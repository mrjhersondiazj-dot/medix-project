"""EXPOSICION MEDIX
Archivo: requisito_funcional_usuarios_roles_permisos.py
Proposito: Endpoints de usuarios: administra cuentas, roles y permisos desde el perfil administrador.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from uuid import UUID

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.auth.requisito_no_funcional_seguridad_dependencias_roles import get_current_user, require_roles
from app.auth.requisito_no_funcional_seguridad_jwt_password_tokens import hash_password
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import get_db
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User, UserRole
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.schemas.requisito_funcional_usuarios_validacion_roles import UserCreate, UserRead, UserUpdate

# Explicacion: Configura el grupo de rutas de este modulo.
router = APIRouter(prefix="/users", tags=["Users"])


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return serialize_user(current_user)


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/doctors")
async def list_doctors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "recepcionista")),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(User).where(User.role == UserRole.DOCTOR).order_by(User.apellidos, User.dni))
    doctors = result.scalars().all()

    # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
    return [
        {
            **serialize_user(doctor),
            "display_name": display_name(doctor),
            "codigo": doctor.dni,
        }
        for doctor in doctors
    ]


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.get("/", response_model=list[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(User).order_by(User.role, User.apellidos, User.dni))
    return result.scalars().all()


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    user = User(
        dni=user_data.dni,
        # Explicacion: Define una constante de configuracion usada por la logica.
        celular=user_data.celular,
        nombres=user_data.nombres,
        # Explicacion: Define una constante de configuracion usada por la logica.
        apellidos=user_data.apellidos,
        hashed_password=hash_password(user_data.password),
        # Explicacion: Define una constante de configuracion usada por la logica.
        role=user_data.role,
    )
    # Explicacion: Agrega el nuevo objeto a la sesion de base de datos.
    db.add(user)

    # Explicacion: Inicia un bloque protegido ante posibles errores.
    try:
        await db.commit()
        # Explicacion: Actualiza el objeto con los datos guardados en base de datos.
        await db.refresh(user)
        return user
    # Explicacion: Captura errores y responde de forma controlada.
    except IntegrityError:
        await db.rollback()
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=409, detail="Ya existe un usuario con este DNI o celular.")


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    # Explicacion: Define una constante de configuracion usada por la logica.
    update_data = user_data.model_dump(exclude_unset=True)
    password = update_data.pop("password", None)

    for field, value in update_data.items():
        setattr(user, field, value)

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if password:
        user.hashed_password = hash_password(password)

    # Explicacion: Inicia un bloque protegido ante posibles errores.
    try:
        await db.commit()
        # Explicacion: Actualiza el objeto con los datos guardados en base de datos.
        await db.refresh(user)
        return user
    # Explicacion: Captura errores y responde de forma controlada.
    except IntegrityError:
        await db.rollback()
        # Explicacion: Detiene la operacion y devuelve un error controlado al cliente.
        raise HTTPException(status_code=409, detail="Ya existe un usuario con este DNI o celular.")


# Explicacion: Declara un endpoint de la API disponible para el frontend.
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario activo.")

    # Explicacion: Define una constante de configuracion usada por la logica.
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    await db.delete(user)
    # Explicacion: Confirma los cambios en la base de datos.
    await db.commit()
    return None


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "dni": user.dni,
        "celular": user.celular,
        "role": user.role.value.lower(),
        "nombres": user.nombres,
        "apellidos": user.apellidos,
    }


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def display_name(user: User) -> str:
    if user.nombres and user.apellidos:
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return f"Dr. {user.nombres} {user.apellidos}"
    return f"Doctor DNI {user.dni}"
