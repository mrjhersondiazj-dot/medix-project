import enum
import uuid

from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AppointmentStatus(str, enum.Enum):
    PROGRAMADA = "programada"
    LLEGADO = "llegado"
    EN_ATENCION = "en_atencion"
    ATENDIDA = "atendida"
    CANCELADA = "cancelada"
    NO_PRESENTADO = "no_presentado"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    fecha_hora: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    motivo: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    estado: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, native_enum=False, length=20),
        default=AppointmentStatus.PROGRAMADA,
        nullable=False,
        index=True,
    )

    patient = relationship("Patient")
    doctor = relationship("User")
