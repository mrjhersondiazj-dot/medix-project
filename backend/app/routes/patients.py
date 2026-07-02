from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_roles
from app.core.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientRead, PatientUpdate

router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
    dependencies=[Depends(require_roles("admin", "recepcionista"))],
)


@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    db: AsyncSession = Depends(get_db),
):
    patient = Patient(**patient_data.model_dump())
    db.add(patient)

    try:
        await db.commit()
        await db.refresh(patient)
        return patient
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un paciente con este DNI.",
        )


@router.get("/", response_model=list[PatientRead])
async def list_patients(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Patient).order_by(Patient.apellidos))
    return result.scalars().all()


@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    return patient


@router.patch("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    update_data = patient_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(patient, field, value)

    try:
        await db.commit()
        await db.refresh(patient)
        return patient
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe otro paciente con este DNI.",
        )


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado.",
        )

    await db.delete(patient)
    await db.commit()
    return None