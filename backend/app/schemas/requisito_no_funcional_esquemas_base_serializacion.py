"""EXPOSICION MEDIX
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Archivo: requisito_no_funcional_esquemas_base_serializacion.py
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Proposito: Schema base: configura serializacion ORM para respuestas API.
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from datetime import datetime
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic import BaseModel, ConfigDict


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class ORMBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class TimestampSchema(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    created_at: datetime
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    updated_at: datetime


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class UUIDSchema(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    id: UUID
