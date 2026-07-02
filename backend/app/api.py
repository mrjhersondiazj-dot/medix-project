from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.appointments import router as appointments_router
from app.routes.medical_records import router as medical_records_router
from app.routes.patients import router as patients_router
from app.routes.users import router as users_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(patients_router)
api_router.include_router(appointments_router)
api_router.include_router(medical_records_router)