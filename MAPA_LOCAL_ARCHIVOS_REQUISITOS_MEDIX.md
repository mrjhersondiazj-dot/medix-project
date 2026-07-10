# Mapa local de archivos por requisitos MEDIX

Cambios locales para explicar el proyecto por requisitos. No se subieron a GitHub.

## Frontend

- `frontend/src/pages/RequisitoFuncional_Login_AccesoSeguro.jsx`: login por DNI, mensajes de error y acceso seguro.
- `frontend/src/services/RequisitoFuncional_Login_AutenticacionRolesSesion.js`: autenticacion, sesion, token y rol activo.
- `frontend/src/routes/RequisitoNoFuncional_Seguridad_RutaPrivada_ControlAcceso.jsx`: proteccion de rutas privadas.
- `frontend/src/services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad.js`: cliente API, token Bearer y limpieza de sesion ante 401.
- `frontend/src/services/RequisitoNoFuncional_DemoPublica_Escalabilidad_LocalStorage.js`: modo demo publico, persistencia local y despliegue gratuito.
- `frontend/src/pages/RequisitoFuncional_Dashboard_GestionHospitalaria_TrazabilidadReportes.jsx`: dashboard, admision, reportes, auditoria y flujo general.
- `frontend/src/components/patients/RequisitoFuncional_Pacientes_RegistroAdmision.jsx`: registro de pacientes.
- `frontend/src/components/patients/RequisitoFuncional_Pacientes_GestionEdicionBusqueda.jsx`: listado, busqueda, edicion y eliminacion de pacientes.
- `frontend/src/components/patients/RequisitoFuncional_Pacientes_HistorialClinico.jsx`: consulta de historial clinico por paciente.
- `frontend/src/components/appointments/RequisitoFuncional_Citas_ProgramacionReprogramacion.jsx`: programacion y reprogramacion de citas.
- `frontend/src/components/appointments/RequisitoFuncional_Citas_FlujoAtencion_ColaEstados.jsx`: cola, llegada, atencion, estados y acciones de cita.
- `frontend/src/components/appointments/RequisitoFuncional_HistoriaClinica_RegistroAtencionMedica.jsx`: registro de atencion medica e historia clinica.
- `frontend/src/components/doctors/RequisitoFuncional_Medicos_EstadoEnVivo_Agenda.jsx`: estado en vivo de medicos y agenda.
- `frontend/src/components/users/RequisitoFuncional_Usuarios_RolesPermisosAdministracion.jsx`: usuarios, roles y permisos administrativos.
- `frontend/src/components/ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad.jsx`: iconografia reutilizable y usabilidad visual.
- `frontend/src/RequisitoNoFuncional_InterfazDisenoResponsivo_Usabilidad.css`: diseno visual, responsividad y experiencia de usuario.
- `frontend/src/RequisitoFuncional_NavegacionPrincipal_RutasAcceso.jsx`: navegacion principal y rutas del sistema.
- `frontend/src/RequisitoNoFuncional_ArranqueFrontend_RenderizadoAplicacion.jsx`: arranque de React y renderizado de la aplicacion.

## Backend

- `backend/app/routes/requisito_funcional_login_acceso_seguro.py`: endpoint de login, validacion y limite de intentos.
- `backend/app/auth/requisito_no_funcional_seguridad_jwt_password_tokens.py`: hash de contrasenas, JWT y expiracion de token.
- `backend/app/auth/requisito_no_funcional_seguridad_dependencias_roles.py`: usuario actual, roles y permisos.
- `backend/app/routes/requisito_funcional_pacientes_crud_admision.py`: CRUD de pacientes.
- `backend/app/routes/requisito_funcional_citas_flujo_atencion_estados.py`: citas, estados y reglas de flujo medico.
- `backend/app/routes/requisito_funcional_historia_clinica_registro_medico.py`: historias clinicas y cierre de atencion.
- `backend/app/routes/requisito_funcional_usuarios_roles_permisos.py`: administracion de usuarios, roles y permisos.
- `backend/app/models/requisito_funcional_pacientes_modelo_admision.py`: modelo de pacientes.
- `backend/app/models/requisito_funcional_citas_modelo_estados.py`: modelo de citas y estados.
- `backend/app/models/requisito_funcional_historia_clinica_modelo_atencion.py`: modelo de historia clinica.
- `backend/app/models/requisito_funcional_usuarios_modelo_roles_acceso.py`: modelo de usuarios y roles.
- `backend/app/schemas/requisito_funcional_login_validacion_credenciales.py`: validacion de credenciales.
- `backend/app/schemas/requisito_funcional_pacientes_validacion_datos.py`: validacion de datos de pacientes.
- `backend/app/schemas/requisito_funcional_citas_validacion_datos.py`: validacion de datos de citas.
- `backend/app/schemas/requisito_funcional_historia_clinica_validacion.py`: validacion de historia clinica.
- `backend/app/schemas/requisito_funcional_usuarios_validacion_roles.py`: validacion de usuarios y roles.
- `backend/app/core/requisito_no_funcional_configuracion_entorno_escalabilidad.py`: configuracion por entorno.
- `backend/app/core/requisito_no_funcional_base_datos_conexion_persistencia.py`: conexion a base de datos.
- `backend/app/core/requisito_no_funcional_cache_redis_escalabilidad.py`: Redis y escalabilidad.
- `backend/app/requisito_no_funcional_api_enrutamiento_escalabilidad.py`: router principal de API.
- `backend/app/scripts/requisito_no_funcional_inicializacion_datos_demo_despliegue.py`: datos demo e inicializacion para despliegue.