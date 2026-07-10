"""EXPOSICION MEDIX
Archivo: requisito_funcional_citas_modelo_estados.py
Proposito: Modelo de citas: define la entidad cita y sus estados operativos.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
import enum
import uuid

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_no_funcional_base_modelos_orm import Base


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentStatus(str, enum.Enum):
    PROGRAMADA = "programada"
    # Explicacion: Define una constante de configuracion usada por la logica.
    LLEGADO = "llegado"
    EN_ATENCION = "en_atencion"
    # Explicacion: Define una constante de configuracion usada por la logica.
    ATENDIDA = "atendida"
    CANCELADA = "cancelada"
    # Explicacion: Define una constante de configuracion usada por la logica.
    NO_PRESENTADO = "no_presentado"


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class Appointment(Base):
    __tablename__ = "appointments"

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        # Explicacion: Define una constante de configuracion usada por la logica.
        primary_key=True,
        default=uuid.uuid4,
        # Explicacion: Define una constante de configuracion usada por la logica.
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        # Explicacion: Define una constante de configuracion usada por la logica.
        nullable=False,
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        # Explicacion: Define una constante de configuracion usada por la logica.
        nullable=False,
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    fecha_hora: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        # Explicacion: Define una constante de configuracion usada por la logica.
        nullable=False,
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    motivo: Mapped[str] = mapped_column(
        Text,
        # Explicacion: Define una constante de configuracion usada por la logica.
        nullable=False,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    estado: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, native_enum=False, length=20),
        # Explicacion: Define una constante de configuracion usada por la logica.
        default=AppointmentStatus.PROGRAMADA,
        nullable=False,
        # Explicacion: Define una constante de configuracion usada por la logica.
        index=True,
    )

    # Explicacion: Define una constante de configuracion usada por la logica.
    patient = relationship("Patient")
    # Explicacion: relacion ORM para conectar esta tabla con otra entidad del sistema.
    doctor = relationship("User")
