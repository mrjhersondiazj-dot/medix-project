# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_no_funcional_base_modelos_orm import Base
from app.models.requisito_funcional_pacientes_modelo_admision import Patient
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_citas_modelo_estados import Appointment, AppointmentStatus
from app.models.requisito_funcional_usuarios_modelo_roles_acceso import User, UserRole
# Explicacion: Importa librerias o modulos usados por este archivo.
from app.models.requisito_funcional_historia_clinica_modelo_atencion import MedicalRecord
