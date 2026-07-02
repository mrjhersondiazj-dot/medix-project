from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_roles
from app.auth.security import hash_password
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@router.get("/doctors")
async def list_doctors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "recepcionista")),
):
    result = await db.execute(select(User).where(User.role == UserRole.DOCTOR).order_by(User.apellidos, User.dni))
    doctors = result.scalars().all()

    return [
        {
            **serialize_user(doctor),
            "display_name": display_name(doctor),
            "codigo": doctor.dni,
        }
        for doctor in doctors
    ]


@router.get("/", response_model=list[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    result = await db.execute(select(User).order_by(User.role, User.apellidos, User.dni))
    return result.scalars().all()


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    user = User(
        dni=user_data.dni,
        celular=user_data.celular,
        nombres=user_data.nombres,
        apellidos=user_data.apellidos,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
    )
    db.add(user)

    try:
        await db.commit()
        await db.refresh(user)
        return user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe un usuario con este DNI o celular.")


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    update_data = user_data.model_dump(exclude_unset=True)
    password = update_data.pop("password", None)

    for field, value in update_data.items():
        setattr(user, field, value)

    if password:
        user.hashed_password = hash_password(password)

    try:
        await db.commit()
        await db.refresh(user)
        return user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe un usuario con este DNI o celular.")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario activo.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    await db.delete(user)
    await db.commit()
    return None


def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "dni": user.dni,
        "celular": user.celular,
        "role": user.role.value.lower(),
        "nombres": user.nombres,
        "apellidos": user.apellidos,
    }


def display_name(user: User) -> str:
    if user.nombres and user.apellidos:
        return f"Dr. {user.nombres} {user.apellidos}"
    return f"Doctor DNI {user.dni}"
