"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_api_enrutamiento_escalabilidad.py
Proposito: Router principal: agrupa endpoints versionados de la API.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from fastapi import APIRouter

# Explicacion: Importa librerias o modulos usados por este archivo.
from app.routes.requisito_funcional_login_acceso_seguro import router as auth_router
from app.routes.requisito_funcional_citas_flujo_atencion_estados import router as appointments_router
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.routes.requisito_funcional_historia_clinica_registro_medico import router as medical_records_router
from app.routes.requisito_funcional_pacientes_crud_admision import router as patients_router
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.routes.requisito_funcional_usuarios_roles_permisos import router as users_router

# Explicacion: Define una constante de configuracion usada por la logica.
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(patients_router)
api_router.include_router(appointments_router)
api_router.include_router(medical_records_router)
