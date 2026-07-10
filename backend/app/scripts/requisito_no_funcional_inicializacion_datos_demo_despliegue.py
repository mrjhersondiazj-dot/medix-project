"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_inicializacion_datos_demo_despliegue.py
Proposito: Inicializacion: prepara tablas, migraciones simples y usuarios demo.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
import asyncio

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy import select

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.auth.requisito_no_funcional_seguridad_jwt_password_tokens import hash_password
from app.core.requisito_no_funcional_base_datos_conexion_persistencia import AsyncSessionLocal, engine
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models import Base
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User, UserRole


# Explicacion: Define una constante de configuracion usada por la logica.
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


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
async def create_initial_users() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.exec_driver_sql("ALTER TABLE appointments ALTER COLUMN estado TYPE VARCHAR(20)")
        await conn.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS nombres VARCHAR(120)")
        await conn.exec_driver_sql("ALTER TABLE users ADD COLUMN IF NOT EXISTS apellidos VARCHAR(120)")

    async with AsyncSessionLocal() as db:
        for user_data in USERS_TO_CREATE:
            # Explicacion: Define una constante de configuracion usada por la logica.
            result = await db.execute(select(User).where(User.dni == user_data["dni"]))
            existing_user = result.scalar_one_or_none()

            # Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
            if existing_user:
                existing_user.nombres = existing_user.nombres or user_data["nombres"]
                existing_user.apellidos = existing_user.apellidos or user_data["apellidos"]
                print(f"[OK] {user_data['label']} ya existe.")
                continue

            # Explicacion: Define una constante de configuracion usada por la logica.
            user = User(
                dni=user_data["dni"],
                # Explicacion: Define una constante de configuracion usada por la logica.
                celular=user_data["celular"],
                nombres=user_data["nombres"],
                # Explicacion: Define una constante de configuracion usada por la logica.
                apellidos=user_data["apellidos"],
                hashed_password=hash_password(user_data["password"]),
                # Explicacion: Define una constante de configuracion usada por la logica.
                role=user_data["role"],
            )

            # Explicacion: Agrega el nuevo objeto a la sesion de base de datos.
            db.add(user)

            print(f"[OK] {user_data['label']} creado.")
            print(f"DNI: {user_data['dni']}")
            print(f"Password: {user_data['password']}")

        # Explicacion: Confirma los cambios en la base de datos.
        await db.commit()


# Explicacion: Evalua una condicion para validar permisos, datos o reglas de negocio.
if __name__ == "__main__":
    asyncio.run(create_initial_users())
