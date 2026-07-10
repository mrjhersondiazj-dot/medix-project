"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_base_datos_conexion_persistencia.py
Proposito: Conexion a base de datos: prepara engine, sesiones y dependencia de DB.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from collections.abc import AsyncGenerator

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.core.requisito_no_funcional_configuracion_entorno_escalabilidad import settings


# Explicacion: Define una constante de configuracion usada por la logica.
engine = create_async_engine(
    settings.DATABASE_URL,
    # Explicacion: Define una constante de configuracion usada por la logica.
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
)

# Explicacion: Define una constante de configuracion usada por la logica.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    # Explicacion: Define una constante de configuracion usada por la logica.
    class_=AsyncSession,
    expire_on_commit=False,
    # Explicacion: Define una constante de configuracion usada por la logica.
    autoflush=False,
    autocommit=False,
)


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
