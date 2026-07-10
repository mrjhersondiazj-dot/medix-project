"""EXPOSICION MEDIX
Archivo: requisito_funcional_citas_flujo_atencion_estados.py
Proposito: Endpoints de citas: administra agenda, estados de atencion y reglas por rol.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from datetime import date, datetime, time
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.auth.requisito_no_funcional_seguridad_dependencias_roles import get_current_user, require_roles
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import get_db
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_citas_modelo_estados import Appointment, AppointmentStatus
from app.models.requisito_funcional_pacientes_modelo_admision import Patient
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User, UserRole
from app.schemas.requisito_funcional_citas_validacion_datos import AppointmentCreate, AppointmentRead, AppointmentStatusUpdate

# Explicacion: Configura el grupo de rutas de este modulo.
router = APIRouter(prefix="/appointments", tags=["Appointments"])


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "recepcionista")),
):
    # Valida que el paciente exista antes de programar la cita.
    # Explicacion: Define una constante de configuracion usada por la logica.
    patient_result = await db.execute(
        select(Patient).where(Patient.id == appointment_data.patient_id)
    )
    # Explicacion: Define una constante de configuracion usada por la logica.
    patient = patient_result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado.")

    # Valida que el usuario asignado sea realmente un medico.
    # Explicacion: Define una constante de configuracion usada por la logica.
    doctor_result = await db.execute(
        select(User).where(
            User.id == appointment_data.doctor_id,
            User.role == UserRole.DOCTOR,
        )
    )
    # Explicacion: Define una constante de configuracion usada por la logica.
    doctor = doctor_result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if doctor is None:
        raise HTTPException(
            # Explicacion: Define una constante de configuracion usada por la logica.
            status_code=404,
            detail="Doctor no encontrado o no tiene rol doctor.",
        )

    # Crea la cita con estado inicial definido por el modelo.
    # Explicacion: Define una constante de configuracion usada por la logica.
    appointment = Appointment(**appointment_data.model_dump())

    # Explicacion: Agrega el nuevo objeto a la sesion de base de datos.
    db.add(appointment)
    await db.commit()
    # Explicacion: Actualiza el objeto con los datos guardados en base de datos.
    await db.refresh(appointment)

    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(Appointment.id == appointment.id)
    )

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return result.scalar_one()


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/", response_model=list[AppointmentRead])
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Consulta base: incluye paciente y doctor para evitar llamadas adicionales.
    # Explicacion: Define una constante de configuracion usada por la logica.
    query = (
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .order_by(Appointment.fecha_hora.desc())
    )

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if current_user.role == UserRole.DOCTOR:
        # El medico solo puede ver su propia agenda.
        # Explicacion: Define una constante de configuracion usada por la logica.
        query = query.where(Appointment.doctor_id == current_user.id)

    # Explicacion: Define una alternativa dentro del flujo de validacion.
    elif current_user.role not in [UserRole.ADMIN, UserRole.RECEPCIONISTA]:
        # Cualquier otro rol queda bloqueado.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=403, detail="No autorizado.")

    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(query)
    return result.scalars().all()


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/doctor/{doctor_id}", response_model=list[AppointmentRead])
async def list_doctor_appointments_today(
    doctor_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if current_user.role == UserRole.DOCTOR and current_user.id != doctor_id:
        raise HTTPException(
            # Explicacion: Define una constante de configuracion usada por la logica.
            status_code=403,
            detail="Solo puedes ver tus propias citas.",
        )

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if current_user.role not in [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.DOCTOR]:
        # Cualquier otro rol queda bloqueado.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=403, detail="No autorizado.")

    # Calcula inicio y fin del dia actual para listar solo agenda de hoy.
    # Explicacion: Define una constante de configuracion usada por la logica.
    today = date.today()
    start = datetime.combine(today, time.min)
    # Explicacion: Define una constante de configuracion usada por la logica.
    end = datetime.combine(today, time.max)

    # Explicacion: Define una constante de configuracion usada por la logica.
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

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return result.scalars().all()


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.patch("/{appointment_id}/status", response_model=AppointmentRead)
async def update_appointment_status(
    appointment_id: UUID,
    status_data: AppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(Appointment.id == appointment_id)
    )
    # Explicacion: Define una constante de configuracion usada por la logica.
    appointment = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if appointment is None:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    # Matriz de permisos: cada rol tiene estados permitidos.
    # Explicacion: Define una constante de configuracion usada por la logica.
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

    # Obtiene el conjunto de estados que puede usar el rol autenticado.
    # Explicacion: Define una constante de configuracion usada por la logica.
    allowed_statuses = allowed_by_role.get(current_user.role, set())

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if status_data.estado not in allowed_statuses:
        # Bloquea intentos de escalar acciones desde un rol no autorizado.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=403, detail="No autorizado para cambiar a este estado.")

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if current_user.role == UserRole.DOCTOR and appointment.doctor_id != current_user.id:
        # El medico solo puede operar sus propias citas.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=403, detail="Solo puedes atender tus propias citas.")

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if appointment.estado in [
        AppointmentStatus.ATENDIDA,
        AppointmentStatus.CANCELADA,
        AppointmentStatus.NO_PRESENTADO,
    ]:
        # Si la cita ya cerro, se protege la trazabilidad evitando cambios posteriores.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=400, detail="La cita ya fue cerrada.")

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if (
        current_user.role == UserRole.DOCTOR
        and status_data.estado == AppointmentStatus.EN_ATENCION
        and appointment.estado not in [
            AppointmentStatus.PROGRAMADA,
            AppointmentStatus.LLEGADO,
        ]
    ):
        # Evita iniciar atencion si la cita no esta en una etapa valida.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=400, detail="La cita no esta lista para iniciar atencion.")

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if (
        status_data.estado == AppointmentStatus.NO_PRESENTADO
        and appointment.estado not in [AppointmentStatus.PROGRAMADA, AppointmentStatus.LLEGADO]
    ):
        # No asistio solo aplica antes de iniciar atencion medica.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=400, detail="Solo se puede marcar no asistio antes de iniciar atencion.")

    # Aplica el cambio de estado y lo persiste en la base.
    appointment.estado = status_data.estado
    # Explicacion: Confirma los cambios en la base de datos.
    await db.commit()
    await db.refresh(appointment)

    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor))
        .where(Appointment.id == appointment.id)
    )
    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return result.scalar_one()
