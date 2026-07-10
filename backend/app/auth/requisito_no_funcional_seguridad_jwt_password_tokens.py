"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_seguridad_jwt_password_tokens.py
Proposito: Seguridad JWT: hashea contrasenas, verifica credenciales, crea y decodifica tokens.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from datetime import datetime, timedelta, timezone

# Explicacion: Importa librerias o modulos usados por este archivo.
from jose import JWTError, jwt
from passlib.context import CryptContext

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.core.requisito_no_funcional_configuracion_entorno_escalabilidad import settings

# Explicacion: Define una constante de configuracion usada por la logica.
ALGORITHM = "HS256"

# Explicacion: Define una constante de configuracion usada por la logica.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    # Explicacion: Define una constante de configuracion usada por la logica.
    deprecated="auto",
)


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def create_access_token(data: dict) -> str:

    # Explicacion: Define una constante de configuracion usada por la logica.
    to_encode = data.copy()

    # Explicacion: Define una constante de configuracion usada por la logica.
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        # Explicacion: Define una constante de configuracion usada por la logica.
        algorithm=ALGORITHM,
    )


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def decode_access_token(token: str):
    try:
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            # Explicacion: Define una constante de configuracion usada por la logica.
            algorithms=[ALGORITHM],
        )

    # Explicacion: Captura errores y responde de forma controlada.
    except JWTError:
        return None
