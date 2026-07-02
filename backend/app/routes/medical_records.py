from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user, require_roles
from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical_record import MedicalRecord
from app.models.user import User, UserRole
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordRead

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


@router.post("/", response_model=MedicalRecordRead, status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("doctor")),
):
    result = await db.execute(select(Appointment).where(Appointment.id == record_data.appointment_id))
    appointment = result.scalar_one_or_none()

    if appointment is None:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    if appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes atender tus propias citas.")

    if appointment.estado not in [
        AppointmentStatus.PROGRAMADA,
        AppointmentStatus.LLEGADO,
        AppointmentStatus.EN_ATENCION,
    ]:
        raise HTTPException(
            status_code=400,
            detail="La cita no esta disponible para atencion o ya fue cerrada.",
        )

    record = MedicalRecord(
        appointment_id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=current_user.id,
        motivo_consulta=appointment.motivo,
        sintomas=record_data.sintomas,
        diagnostico=record_data.diagnostico,
        tratamiento_recetado=record_data.tratamiento_recetado,
    )

    appointment.estado = AppointmentStatus.ATENDIDA
    db.add(record)

    try:
        await db.commit()
        await db.refresh(record)
        return record
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Esta cita ya tiene una historia clinica registrada.")


@router.get("/patient/{patient_id}", response_model=list[MedicalRecordRead])
async def list_patient_medical_records(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.DOCTOR]:
        raise HTTPException(status_code=403, detail="No autorizado.")

    result = await db.execute(
        select(MedicalRecord)
        .options(selectinload(MedicalRecord.doctor))
        .where(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.fecha_registro.desc())
    )

    return result.scalars().all()
