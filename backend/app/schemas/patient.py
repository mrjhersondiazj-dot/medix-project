from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.schemas.base import ORMBaseSchema


class PatientBase(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=120)
    apellidos: str = Field(..., min_length=2, max_length=120)
    dni: str = Field(..., min_length=8, max_length=8)
    fecha_nacimiento: date | None = None
    telefono: str | None = Field(default=None, max_length=20)
    direccion: str | None = None

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("El DNI debe contener solo números.")
        return value


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    nombres: str | None = Field(default=None, min_length=2, max_length=120)
    apellidos: str | None = Field(default=None, min_length=2, max_length=120)
    dni: str | None = Field(default=None, min_length=8, max_length=8)
    fecha_nacimiento: date | None = None
    telefono: str | None = Field(default=None, max_length=20)
    direccion: str | None = None

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("El DNI debe contener solo números.")
        return value


class PatientRead(PatientBase, ORMBaseSchema):
    id: UUID