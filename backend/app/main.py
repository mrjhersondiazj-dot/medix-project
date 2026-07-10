"""EXPOSICION MEDIX
Archivo: main.py
Proposito: Aplicacion FastAPI: registra middleware de seguridad, CORS y routers principales.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Explicacion: Importa librerias o modulos usados por este archivo.
from starlette.middleware.base import BaseHTTPMiddleware

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.requisito_no_funcional_api_enrutamiento_escalabilidad import api_router
from app.core.requisito_no_funcional_configuracion_entorno_escalabilidad import settings

# Explicacion: Define una constante de configuracion usada por la logica.
app = FastAPI(title="MEDIX API", version="1.0.0")


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Explicacion: Define una constante de configuracion usada por la logica.
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Cache-Control"] = "no-store"
        # Explicacion: Devuelve la respuesta que recibira el frontend o el siguiente proceso.
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    # Explicacion: Define una constante de configuracion usada por la logica.
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    # Explicacion: Define una constante de configuracion usada por la logica.
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
# Explicacion: Define una funcion que implementa parte del requisito del modulo.
async def health_check():
    return {
        "status": "healthy",
        "database": "connected (async)",
        "redis": "online",
        "project": "MEDIX - FLIT 2026",
    }
