from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.user import UserRole
from app.schemas.base import ORMBaseSchema


class UserCreate(BaseModel):
    dni: str = Field(..., min_length=8, max_length=8)
    celular: str = Field(..., min_length=9, max_length=9)
    password: str = Field(..., min_length=6)
    role: UserRole
    nombres: str | None = Field(default=None, max_length=120)
    apellidos: str | None = Field(default=None, max_length=120)

    @field_validator("dni", "celular")
    @classmethod
    def validate_digits(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("El campo debe contener solo numeros.")
        return value


class UserRead(ORMBaseSchema):
    id: UUID
    dni: str
    celular: str
    role: UserRole
    nombres: str | None = None
    apellidos: str | None = None


class UserUpdate(BaseModel):
    dni: str | None = Field(default=None, min_length=8, max_length=8)
    celular: str | None = Field(default=None, min_length=9, max_length=9)
    role: UserRole | None = None
    nombres: str | None = Field(default=None, max_length=120)
    apellidos: str | None = Field(default=None, max_length=120)
    password: str | None = Field(default=None, min_length=6)

    @field_validator("dni", "celular")
    @classmethod
    def validate_optional_digits(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("El campo debe contener solo numeros.")
        return value
