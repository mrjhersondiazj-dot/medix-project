"""EXPOSICION MEDIX
Archivo: requisito_funcional_pacientes_crud_admision.py
Proposito: Endpoints de pacientes: crear, listar, editar y eliminar registros de admision.
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
from app.auth.requisito_no_funcional_seguridad_dependencias_roles import require_roles
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import get_db
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_pacientes_modelo_admision import Patient
from app.schemas.requisito_funcional_pacientes_validacion_datos import PatientCreate, PatientRead, PatientUpdate

# Explicacion: Configura el grupo de rutas de este modulo.
router = APIRouter(
    prefix="/patients",
    # Explicacion: Define una constante de configuracion usada por la logica.
    tags=["Patients"],
    dependencies=[Depends(require_roles("admin", "recepcionista"))],
)


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    db: AsyncSession = Depends(get_db),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    patient = Patient(**patient_data.model_dump())
    db.add(patient)

    # Explicacion: Inicia un bloque protegido ante posibles errores.
    try:
        await db.commit()
        # Explicacion: Actualiza el objeto con los datos guardados en base de datos.
        await db.refresh(patient)
        return patient
    # Explicacion: Captura errores y responde de forma controlada.
    except IntegrityError:
        await db.rollback()
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            # Explicacion: Define una constante de configuracion usada por la logica.
            detail="Ya existe un paciente con este DNI.",
        )


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/", response_model=list[PatientRead])
async def list_patients(
    db: AsyncSession = Depends(get_db),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(Patient).order_by(Patient.apellidos))
    return result.scalars().all()


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if patient is None:
        raise HTTPException(
            # Explicacion: Define una constante de configuracion usada por la logica.
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return patient


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.patch("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if patient is None:
        raise HTTPException(
            # Explicacion: Define una constante de configuracion usada por la logica.
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    # Explicacion: Define una constante de configuracion usada por la logica.
    update_data = patient_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(patient, field, value)

    # Explicacion: Inicia un bloque protegido ante posibles errores.
    try:
        await db.commit()
        # Explicacion: Actualiza el objeto con los datos guardados en base de datos.
        await db.refresh(patient)
        return patient
    # Explicacion: Captura errores y responde de forma controlada.
    except IntegrityError:
        await db.rollback()
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            # Explicacion: Define una constante de configuracion usada por la logica.
            detail="Ya existe otro paciente con este DNI.",
        )


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if patient is None:
        raise HTTPException(
            # Explicacion: Define una constante de configuracion usada por la logica.
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    await db.delete(patient)
    # Explicacion: Confirma los cambios en la base de datos.
    await db.commit()
    return None
