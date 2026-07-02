import uuid

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    appointment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    fecha_registro: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    motivo_consulta: Mapped[str] = mapped_column(Text, nullable=False)
    sintomas: Mapped[str] = mapped_column(Text, nullable=False)
    diagnostico: Mapped[str] = mapped_column(Text, nullable=False)
    tratamiento_recetado: Mapped[str] = mapped_column(Text, nullable=False)

    appointment = relationship("Appointment")
    patient = relationship("Patient")
    doctor = relationship("User")