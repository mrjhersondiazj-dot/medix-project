"""EXPOSICION MEDIX
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Archivo: requisito_funcional_historia_clinica_validacion.py
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Proposito: Schemas de historia clinica: validan los datos medicos registrados.
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from datetime import datetime
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic import BaseModel, Field

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.schemas.requisito_no_funcional_esquemas_base_serializacion import ORMBaseSchema


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class MedicalRecordCreate(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    appointment_id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    sintomas: str = Field(..., min_length=3)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    diagnostico: str = Field(..., min_length=3)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    tratamiento_recetado: str = Field(..., min_length=3)


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class MedicalRecordDoctorRead(ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    celular: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    role: str


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class MedicalRecordRead(ORMBaseSchema):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    appointment_id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    patient_id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    doctor_id: UUID
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    fecha_registro: datetime
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    motivo_consulta: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    sintomas: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    diagnostico: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    tratamiento_recetado: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    doctor: MedicalRecordDoctorRead | None = None
