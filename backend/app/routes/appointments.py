from datetime import date, datetime, time
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user, require_roles
from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentStatusUpdate

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "recepcionista")),
):
    patient_result = await db.execute(
        select(Patient).where(Patient.id == appointment_data.patient_id)
    )
    patient = patient_result.scalar_one_or_none()

    if patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado.")

    doctor_result = await db.execute(
        select(User).where(
            User.id == appointment_data.doctor_id,
            User.role == UserRole.DOCTOR,
        )
    )
    doctor = doctor_result.scalar_one_or_none()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor no encontrado o no tiene rol doctor.",
        )

    appointment = Appointment(**appointment_data.model_dump())

    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(Appointment.id == appointment.id)
    )

    return result.scalar_one()


@router.get("/", response_model=list[AppointmentRead])
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .order_by(Appointment.fecha_hora.desc())
    )

    if current_user.role == UserRole.DOCTOR:
        query = query.where(Appointment.doctor_id == current_user.id)

    elif current_user.role not in [UserRole.ADMIN, UserRole.RECEPCIONISTA]:
        raise HTTPException(status_code=403, detail="No autorizado.")

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/doctor/{doctor_id}", response_model=list[AppointmentRead])
async def list_doctor_appointments_today(
    doctor_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.DOCTOR and current_user.id != doctor_id:
        raise HTTPException(
            status_code=403,
            detail="Solo puedes ver tus propias citas.",
        )

    if current_user.role not in [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.DOCTOR]:
        raise HTTPException(status_code=403, detail="No autorizado.")

    today = date.today()
    start = datetime.combine(today, time.min)
    end = datetime.combine(today, time.max)

    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(
            Appointment.doctor_id == doctor_id,
            Appointment.fecha_hora >= start,
            Appointment.fecha_hora <= end,
        )
        .order_by(Appointment.fecha_hora.asc())
    )

    return result.scalars().all()


@router.patch("/{appointment_id}/status", response_model=AppointmentRead)
async def update_appointment_status(
    appointment_id: UUID,
    status_data: AppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()

    if appointment is None:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    allowed_by_role = {
        UserRole.ADMIN: {
            AppointmentStatus.PROGRAMADA,
            AppointmentStatus.LLEGADO,
            AppointmentStatus.EN_ATENCION,
            AppointmentStatus.ATENDIDA,
            AppointmentStatus.CANCELADA,
            AppointmentStatus.NO_PRESENTADO,
        },
        UserRole.RECEPCIONISTA: {
            AppointmentStatus.PROGRAMADA,
            AppointmentStatus.LLEGADO,
            AppointmentStatus.CANCELADA,
            AppointmentStatus.NO_PRESENTADO,
        },
        UserRole.DOCTOR: {
            AppointmentStatus.EN_ATENCION,
            AppointmentStatus.NO_PRESENTADO,
        },
    }

    allowed_statuses = allowed_by_role.get(current_user.role, set())

    if status_data.estado not in allowed_statuses:
        raise HTTPException(status_code=403, detail="No autorizado para cambiar a este estado.")

    if current_user.role == UserRole.DOCTOR and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes atender tus propias citas.")

    if appointment.estado in [
        AppointmentStatus.ATENDIDA,
        AppointmentStatus.CANCELADA,
        AppointmentStatus.NO_PRESENTADO,
    ]:
        raise HTTPException(status_code=400, detail="La cita ya fue cerrada.")

    if (
        current_user.role == UserRole.DOCTOR
        and status_data.estado == AppointmentStatus.EN_ATENCION
        and appointment.estado not in [
            AppointmentStatus.PROGRAMADA,
            AppointmentStatus.LLEGADO,
        ]
    ):
        raise HTTPException(status_code=400, detail="La cita no esta lista para iniciar atencion.")

    if (
        status_data.estado == AppointmentStatus.NO_PRESENTADO
        and appointment.estado not in [AppointmentStatus.PROGRAMADA, AppointmentStatus.LLEGADO]
    ):
        raise HTTPException(status_code=400, detail="Solo se puede marcar no asistio antes de iniciar atencion.")

    appointment.estado = status_data.estado
    await db.commit()
    await db.refresh(appointment)

    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(Appointment.id == appointment.id)
    )
    return result.scalar_one()
