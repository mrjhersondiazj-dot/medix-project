"""EXPOSICION MEDIX
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Archivo: requisito_funcional_citas_validacion_datos.py
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Proposito: Schemas de citas: validan entrada y salida de datos de citas.
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from datetime import datetime
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic import BaseModel, Field

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_citas_modelo_estados import AppointmentStatus
from app.schemas.requisito_no_funcional_esquemas_base_serializacion import ORMBaseSchema


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentPatientRead(ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    nombres: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    apellidos: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentDoctorRead(ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    celular: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    role: str


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentBase(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    patient_id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    doctor_id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    fecha_hora: datetime
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    motivo: str = Field(..., min_length=3)


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentCreate(AppointmentBase):
    pass


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentStatusUpdate(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    estado: AppointmentStatus


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class AppointmentRead(AppointmentBase, ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    estado: AppointmentStatus
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    patient: AppointmentPatientRead | None = None
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    doctor: AppointmentDoctorRead | None = None
