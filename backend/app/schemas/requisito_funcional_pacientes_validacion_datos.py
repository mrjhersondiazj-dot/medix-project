"""EXPOSICION MEDIX
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Archivo: requisito_funcional_pacientes_validacion_datos.py
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Proposito: Schemas de pacientes: validan datos de admision y actualizacion.
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from datetime import date
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic import BaseModel, Field, field_validator

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.schemas.requisito_no_funcional_esquemas_base_serializacion import ORMBaseSchema


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class PatientBase(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    nombres: str = Field(..., min_length=2, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    apellidos: str = Field(..., min_length=2, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str = Field(..., min_length=8, max_length=8)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    fecha_nacimiento: date | None = None
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    telefono: str | None = Field(default=None, min_length=9, max_length=9)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    direccion: str | None = None

    @field_validator("dni")
    @classmethod
    # Explicacion: Define una funcion que implementa parte del requisito del modulo.
    def validate_dni(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("El DNI debe contener solo números.")
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return value

    @field_validator("telefono")
    @classmethod
    def validate_telefono(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("El telefono debe contener solo numeros.")
        return value


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class PatientCreate(PatientBase):
    pass


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class PatientUpdate(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    nombres: str | None = Field(default=None, min_length=2, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    apellidos: str | None = Field(default=None, min_length=2, max_length=120)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str | None = Field(default=None, min_length=8, max_length=8)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    fecha_nacimiento: date | None = None
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    telefono: str | None = Field(default=None, min_length=9, max_length=9)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    direccion: str | None = None

    @field_validator("dni")
    @classmethod
    # Explicacion: Define una funcion que implementa parte del requisito del modulo.
    def validate_dni(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("El DNI debe contener solo números.")
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return value

    @field_validator("telefono")
    @classmethod
    def validate_telefono(cls, value: str | None) -> str | None:
        if value is not None and not value.isdigit():
            raise ValueError("El telefono debe contener solo numeros.")
        return value


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class PatientRead(PatientBase, ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
