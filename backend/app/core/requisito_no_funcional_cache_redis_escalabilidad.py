"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_cache_redis_escalabilidad.py
Proposito: Cliente Redis: prepara conexion para cache y escalabilidad.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from redis.asyncio import Redis

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.core.requisito_no_funcional_configuracion_entorno_escalabilidad import settings


# Explicacion: Define una constante de configuracion usada por la logica.
redis_client = Redis.from_url(
    settings.REDIS_URL,
    # Explicacion: Define una constante de configuracion usada por la logica.
    encoding="utf-8",
    decode_responses=True,
)


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
async def get_redis() -> Redis:
    return redis_client


# Explicacion: Define una funcion que implementa parte del requisito del modulo.
async def close_redis() -> None:
    await redis_client.aclose()
