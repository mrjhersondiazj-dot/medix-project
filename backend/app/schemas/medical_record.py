from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import ORMBaseSchema


class MedicalRecordCreate(BaseModel):
    appointment_id: UUID
    sintomas: str = Field(..., min_length=3)
    diagnostico: str = Field(..., min_length=3)
    tratamiento_recetado: str = Field(..., min_length=3)


class MedicalRecordDoctorRead(ORMBaseSchema):
    id: UUID
    dni: str
    celular: str
    role: str


class MedicalRecordRead(ORMBaseSchema):
    id: UUID
    appointment_id: UUID
    patient_id: UUID
    doctor_id: UUID
    fecha_registro: datetime
    motivo_consulta: str
    sintomas: str
    diagnostico: str
    tratamiento_recetado: str
    doctor: MedicalRecordDoctorRead | None = None