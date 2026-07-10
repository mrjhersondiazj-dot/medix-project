"""EXPOSICION MEDIX
Archivo: requisito_funcional_login_acceso_seguro.py
Proposito: Endpoint de login: valida DNI y contrasena, aplica limite de intentos y devuelve token con rol.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
import time

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.ext.asyncio import AsyncSession

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.auth.requisito_no_funcional_seguridad_jwt_password_tokens import create_access_token, verify_password
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import get_db
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User
from app.schemas.requisito_funcional_login_validacion_credenciales import LoginRequest, TokenResponse

# Explicacion: Configura el grupo de rutas de este modulo.
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Maximo de intentos fallidos antes de bloquear temporalmente el acceso.
# Explicacion: Define una constante de configuracion usada por la logica.
MAX_LOGIN_ATTEMPTS = 5
# Tiempo de bloqueo en segundos: 10 minutos para frenar fuerza bruta basica.
# Explicacion: Define una constante de configuracion usada por la logica.
LOCK_SECONDS = 10 * 60
# Memoria temporal de intentos por IP + DNI. En produccion podria moverse a Redis.
login_attempts: dict[str, list[float]] = {}


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    # La clave combina IP y DNI para contar intentos por usuario/origen.
    # Explicacion: Define una constante de configuracion usada por la logica.
    key = f"{request.client.host if request.client else 'unknown'}:{credentials.dni}"
    # Marca de tiempo actual para filtrar intentos recientes.
    # Explicacion: Define una constante de configuracion usada por la logica.
    now = time.time()
    # Solo se conservan intentos dentro de la ventana de bloqueo.
    # Explicacion: Define una constante de configuracion usada por la logica.
    attempts = [item for item in login_attempts.get(key, []) if now - item < LOCK_SECONDS]

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        # Respuesta 429: indica demasiados intentos sin revelar si el DNI existe.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            # Explicacion: Define una constante de configuracion usada por la logica.
            detail="Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
        )

    # Busca el usuario por DNI, que es el identificador institucional del personal.
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(User).where(User.dni == credentials.dni))
    user = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if user is None or not verify_password(credentials.password, user.hashed_password):
        # Registra el intento fallido y responde con mensaje generico de seguridad.
        attempts.append(now)
        login_attempts[key] = attempts
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            # Explicacion: Define una constante de configuracion usada por la logica.
            detail="DNI o contrasena incorrectos. Verifica los datos e intenta nuevamente.",
        )

    # Si el login fue correcto, se limpian intentos fallidos previos.
    login_attempts.pop(key, None)

    # El token incluye ID del usuario y rol para aplicar permisos en rutas protegidas.
    # Explicacion: Define una constante de configuracion usada por la logica.
    token = create_access_token({"sub": str(user.id), "role": user.role.value})

    # Respuesta estandar: token Bearer y rol para que el frontend adapte la interfaz.
    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,
    }
