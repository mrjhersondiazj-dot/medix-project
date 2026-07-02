import uuid

from sqlalchemy import Date, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    nombres: Mapped[str] = mapped_column(String(120), nullable=False)
    apellidos: Mapped[str] = mapped_column(String(120), nullable=False)

    dni: Mapped[str] = mapped_column(
        String(8),
        unique=True,
        nullable=False,
        index=True,
    )

    fecha_nacimiento: Mapped[Date | None] = mapped_column(Date, nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    direccion: Mapped[str | None] = mapped_column(Text, nullable=True)