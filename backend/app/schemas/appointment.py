from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.appointment import AppointmentStatus
from app.schemas.base import ORMBaseSchema


class AppointmentPatientRead(ORMBaseSchema):
    id: UUID
    nombres: str
    apellidos: str
    dni: str


class AppointmentDoctorRead(ORMBaseSchema):
    id: UUID
    dni: str
    celular: str
    role: str


class AppointmentBase(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    fecha_hora: datetime
    motivo: str = Field(..., min_length=3)


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentStatusUpdate(BaseModel):
    estado: AppointmentStatus


class AppointmentRead(AppointmentBase, ORMBaseSchema):
    id: UUID
    estado: AppointmentStatus
    patient: AppointmentPatientRead | None = None
    doctor: AppointmentDoctorRead | None = None
