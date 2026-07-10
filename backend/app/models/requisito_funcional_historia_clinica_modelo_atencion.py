"""EXPOSICION MEDIX
Archivo: requisito_funcional_historia_clinica_modelo_atencion.py
Proposito: Modelo de historia clinica: guarda sintomas, diagnostico y tratamiento.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
import uuid

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_no_funcional_base_modelos_orm import Base


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class MedicalRecord(Base):
    __tablename__ = "medical_records"

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    appointment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="CASCADE"),
        # Explicacion: Define una constante de configuracion usada por la logica.
        unique=True,
        nullable=False,
        # Explicacion: Define una constante de configuracion usada por la logica.
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    fecha_registro: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    motivo_consulta: Mapped[str] = mapped_column(Text, nullable=False)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    sintomas: Mapped[str] = mapped_column(Text, nullable=False)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    diagnostico: Mapped[str] = mapped_column(Text, nullable=False)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    tratamiento_recetado: Mapped[str] = mapped_column(Text, nullable=False)

    # Explicacion: Define una constante de configuracion usada por la logica.
    appointment = relationship("Appointment")
    # Explicacion: relacion ORM para conectar esta tabla con otra entidad del sistema.
    patient = relationship("Patient")
    # Explicacion: Define una constante de configuracion usada por la logica.
    doctor = relationship("User")
