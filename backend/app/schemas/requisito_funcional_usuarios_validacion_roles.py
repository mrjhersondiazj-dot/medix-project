"""EXPOSICION MEDIX
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Archivo: requisito_funcional_usuarios_validacion_roles.py
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Proposito: Schemas de usuarios: validan creacion, edicion y lectura de usuarios.
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic import BaseModel, Field, field_validator

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import UserRole
from app.schemas.requisito_no_funcional_esquemas_base_serializacion import ORMBaseSchema


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class UserCreate(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str = Field(..., min_length=8, max_length=8)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    celular: str = Field(..., min_length=9, max_length=9)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    password: str = Field(..., min_length=6)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    role: UserRole
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    nombres: str | None = Field(default=None, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    apellidos: str | None = Field(default=None, max_length=120)

    @field_validator("dni", "celular")
    @classmethod
    # Explicacion: Define una funcion que implementa parte del requisito del modulo.
    def validate_digits(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("El campo debe contener solo numeros.")
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return value


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class UserRead(ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    celular: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    role: UserRole
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    nombres: str | None = None
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    apellidos: str | None = None


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class UserUpdate(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str | None = Field(default=None, min_length=8, max_length=8)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    celular: str | None = Field(default=None, min_length=9, max_length=9)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    role: UserRole | None = None
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    nombres: str | None = Field(default=None, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    apellidos: str | None = Field(default=None, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    password: str | None = Field(default=None, min_length=6)

    @field_validator("dni", "celular")
    @classmethod
    # Explicacion: Define una funcion que implementa parte del requisito del modulo.
    def validate_optional_digits(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("El campo debe contener solo numeros.")
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return value
