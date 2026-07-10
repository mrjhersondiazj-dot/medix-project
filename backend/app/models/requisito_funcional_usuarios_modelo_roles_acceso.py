"""EXPOSICION MEDIX
Archivo: requisito_funcional_usuarios_modelo_roles_acceso.py
Proposito: Modelo de usuarios: representa credenciales, roles y datos del personal.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
import enum
import uuid

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy import Enum, String
from sqlalchemy.dialects.postgresql import UUID
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.orm import Mapped, mapped_column

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_no_funcional_base_modelos_orm import Base


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    # Explicacion: Define una constante de configuracion usada por la logica.
    RECEPCIONISTA = "recepcionista"
    DOCTOR = "doctor"
    # Explicacion: Define una constante de configuracion usada por la logica.
    PACIENTE = "paciente"


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class User(Base):
    __tablename__ = "users"

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        # Explicacion: Define una constante de configuracion usada por la logica.
        primary_key=True,
        default=uuid.uuid4,
    )

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
    celular: Mapped[str] = mapped_column(
        String(9),
        # Explicacion: Define una constante de configuracion usada por la logica.
        unique=True,
        nullable=False,
        # Explicacion: Define una constante de configuracion usada por la logica.
        index=True,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    nombres: Mapped[str | None] = mapped_column(String(120), nullable=True)
    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    apellidos: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        # Explicacion: Define una constante de configuracion usada por la logica.
        nullable=False,
    )

    # Explicacion: campo del modelo que se guarda como columna en la base de datos.
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False),
        # Explicacion: Define una constante de configuracion usada por la logica.
        nullable=False,
        default=UserRole.PACIENTE,
    )
