"""EXPOSICION MEDIX
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Archivo: requisito_funcional_login_validacion_credenciales.py
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Proposito: Schemas de login: validan DNI, contrasena y respuesta del token.
# Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic import BaseModel, Field


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class LoginRequest(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    dni: str = Field(..., min_length=8, max_length=8)
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    password: str = Field(..., min_length=6)


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class TokenResponse(BaseModel):
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    access_token: str
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    token_type: str = "bearer"
    # Explicacion: campo validado por Pydantic antes de entrar o salir de la API.
    role: str
