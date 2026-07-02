import enum
import uuid

from sqlalchemy import Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RECEPCIONISTA = "recepcionista"
    DOCTOR = "doctor"
    PACIENTE = "paciente"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    dni: Mapped[str] = mapped_column(
        String(8),
        unique=True,
        nullable=False,
        index=True,
    )

    celular: Mapped[str] = mapped_column(
        String(9),
        unique=True,
        nullable=False,
        index=True,
    )

    nombres: Mapped[str | None] = mapped_column(String(120), nullable=True)
    apellidos: Mapped[str | None] = mapped_column(String(120), nullable=True)

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False),
        nullable=False,
        default=UserRole.PACIENTE,
    )
