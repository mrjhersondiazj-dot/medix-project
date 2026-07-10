"""EXPOSICION MEDIX
Archivo: requisito_funcional_pacientes_modelo_admision.py
Proposito: Modelo de pacientes: representa datos administrativos del paciente.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
import uuid

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy import Date, String, Text
from sqlalchemy.dialects.postgresql import UUID
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.orm import Mapped, mapped_column

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_no_funcional_base_modelos_orm import Base


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class Patient(Base):
    __tablename__ = "patients"

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
    nombres: Mapped[str] = mapped_column(String(120), nullable=False)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    apellidos: Mapped[str] = mapped_column(String(120), nullable=False)

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    dni: Mapped[str] = mapped_column(
        String(8),
        # Explicacion: Define una constante de configuracion usada por la logica.
        unique=True,
        nullable=False,
        # Explicacion: Define una constante de configuracion usada por la logica.
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    fecha_nacimiento: Mapped[Date | None] = mapped_column(Date, nullable=True)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    direccion: Mapped[str | None] = mapped_column(Text, nullable=True)
