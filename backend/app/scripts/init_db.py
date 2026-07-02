import asyncio

from sqlalchemy import select

from app.auth.security import hash_password
from app.core.database import AsyncSessionLocal, engine
from app.models import Base
from app.models.user import User, UserRole


USERS_TO_CREATE = [
    {
        "dni": "12345678",
        "celular": "999999999",
        "password": "admin123",
        "role": UserRole.ADMIN,
        "label": "Administrador",
        "nombres": "Luis",
        "apellidos": "Vargas",
    },
    {
        "dni": "11112222",
        "celular": "987654321",
        "password": "doctor123",
        "role": UserRole.DOCTOR,
        "label": "Doctor de prueba",
        "nombres": "Carlos",
        "apellidos": "Mendoza",
    },
    {
        "dni": "22223333",
        "celular": "966666666",
        "password": "recep123",
        "role": UserRole.RECEPCIONISTA,
        "label": "Recepcionista de prueba",
        "nombres": "Ana",
        "apellidos": "Quispe",
    },
]


async def create_initial_users() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.exec_driver_sql("ALTER TABLE appointments ALTER COLUMN estado TYPE VARCHAR(20)")
        await conn.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS nombres VARCHAR(120)")
        await conn.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS apellidos VARCHAR(120)")

    async with AsyncSessionLocal() as db:
        for user_data in USERS_TO_CREATE:
            result = await db.execute(select(User).where(User.dni == user_data["dni"]))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                existing_user.nombres = existing_user.nombres or user_data["nombres"]
                existing_user.apellidos = existing_user.apellidos or user_data["apellidos"]
                print(f"[OK] {user_data['label']} ya existe.")
                continue

            user = User(
                dni=user_data["dni"],
                celular=user_data["celular"],
                nombres=user_data["nombres"],
                apellidos=user_data["apellidos"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"],
            )

            db.add(user)

            print(f"[OK] {user_data['label']} creado.")
            print(f"DNI: {user_data['dni']}")
            print(f"Password: {user_data['password']}")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(create_initial_users())
