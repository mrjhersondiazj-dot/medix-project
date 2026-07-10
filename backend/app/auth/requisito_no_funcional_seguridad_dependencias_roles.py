"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_seguridad_dependencias_roles.py
Proposito: Dependencias de seguridad: obtiene usuario actual y valida permisos por rol.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.auth.requisito_no_funcional_seguridad_jwt_password_tokens import decode_access_token
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import get_db
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    # Decodifica el JWT recibido desde el encabezado Authorization.
    # Explicacion: Define una constante de configuracion usada por la logica.
    payload = decode_access_token(token)

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if payload is None:
        # Si el token no es valido o expiro, se corta el acceso.
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

    # El campo sub guarda el identificador unico del usuario autenticado.
    # Explicacion: Define una constante de configuracion usada por la logica.
    user_id = payload.get("sub")

    # Explicacion: Inicia un bloque protegido ante posibles errores.
    try:
        # Convierte el ID a UUID para consultar la base de datos de forma segura.
        # Explicacion: Define una constante de configuracion usada por la logica.
        user_uuid = UUID(str(user_id))
    except (TypeError, ValueError):
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

    # Confirma que el usuario del token todavia exista en la base de datos.
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return user


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def require_roles(*roles):
    # Factory de seguridad: recibe roles permitidos y devuelve una dependencia FastAPI.
    # Explicacion: Define una funcion que implementa parte del requisito del modulo.
    async def role_checker(current_user: User = Depends(get_current_user)):
        # Compara el rol del usuario contra la lista autorizada para el endpoint.
        # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
        if current_user.role.value not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")

        # Si pasa la validacion, el endpoint recibe el usuario actual.
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return current_user

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return role_checker
