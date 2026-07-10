"""EXPOSICION MEDIX
Archivo: requisito_funcional_historia_clinica_registro_medico.py
Proposito: Endpoints de historia clinica: registra atencion medica y consulta historial por paciente.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.orm import selectinload

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.auth.requisito_no_funcional_seguridad_dependencias_roles import get_current_user, require_roles
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import get_db
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_citas_modelo_estados import Appointment, AppointmentStatus
from app.models.requisito_funcional_historia_clinica_modelo_atencion import MedicalRecord
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User, UserRole
from app.schemas.requisito_funcional_historia_clinica_validacion import MedicalRecordCreate, MedicalRecordRead

# Explicacion: Configura el grupo de rutas de este modulo.
router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.post("/", response_model=MedicalRecordRead, status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("doctor")),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(Appointment).where(Appointment.id == record_data.appointment_id))
    appointment = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if appointment is None:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes atender tus propias citas.")

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if appointment.estado not in [
        AppointmentStatus.PROGRAMADA,
        AppointmentStatus.LLEGADO,
        AppointmentStatus.EN_ATENCION,
    ]:
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(
            status_code=400,
            # Explicacion: Define una constante de configuracion usada por la logica.
            detail="La cita no esta disponible para atencion o ya fue cerrada.",
        )

    # Explicacion: Define una constante de configuracion usada por la logica.
    record = MedicalRecord(
        appointment_id=appointment.id,
        # Explicacion: Define una constante de configuracion usada por la logica.
        patient_id=appointment.patient_id,
        doctor_id=current_user.id,
        # Explicacion: Define una constante de configuracion usada por la logica.
        motivo_consulta=appointment.motivo,
        sintomas=record_data.sintomas,
        # Explicacion: Define una constante de configuracion usada por la logica.
        diagnostico=record_data.diagnostico,
        tratamiento_recetado=record_data.tratamiento_recetado,
    )

    appointment.estado = AppointmentStatus.ATENDIDA
    # Explicacion: Agrega el nuevo objeto a la sesion de base de datos.
    db.add(record)

    # Explicacion: Inicia un bloque protegido ante posibles errores.
    try:
        await db.commit()
        # Explicacion: Actualiza el objeto con los datos guardados en base de datos.
        await db.refresh(record)
        return record
    # Explicacion: Captura errores y responde de forma controlada.
    except IntegrityError:
        await db.rollback()
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=409, detail="Esta cita ya tiene una historia clinica registrada.")


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/patient/{patient_id}", response_model=list[MedicalRecordRead])
async def list_patient_medical_records(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if current_user.role not in [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.DOCTOR]:
        raise HTTPException(status_code=403, detail="No autorizado.")

    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(
        select(MedicalRecord)
        .options(selectinload(MedicalRecord.doctor))
        .where(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.fecha_registro.desc())
    )

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return result.scalars().all()
