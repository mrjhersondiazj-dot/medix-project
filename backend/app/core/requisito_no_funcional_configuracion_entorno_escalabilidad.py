"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_configuracion_entorno_escalabilidad.py
Proposito: Configuracion: centraliza variables de entorno para desarrollo y produccion.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from functools import lru_cache

# Explicacion: Importa librerias o modulos usados por este archivo.
from pydantic_settings import BaseSettings, SettingsConfigDict


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDIX API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    REDIS_URL: str
    SECRET_KEY: str = "MEDIX_LOCAL_DEV_SECRET_CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Explicacion: Define una constante de configuracion usada por la logica.
    model_config = SettingsConfigDict(
        env_file=".env",
        # Explicacion: Define una constante de configuracion usada por la logica.
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
# Explicacion: Define una funcion que implementa parte del requisito del modulo.
def get_settings() -> Settings:
    return Settings()


# Explicacion: Define una constante de configuracion usada por la logica.
settings = get_settings()
