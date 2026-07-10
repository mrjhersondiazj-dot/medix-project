# MEDIX - Mapa rapido de requisitos y archivos

Este archivo organiza el proyecto por requisito funcional para facilitar defensa, revision y mantenimiento.

## Seguridad y acceso

- Backend login por DNI, bloqueo temporal de intentos y mensajes seguros:
  - `backend/app/routes/auth.py`
  - `backend/app/schemas/auth.py`
- Validacion de token y control de roles:
  - `backend/app/auth/dependencies.py`
- Headers de seguridad HTTP:
  - `backend/app/main.py`
- Cliente limpia sesion si el token vence o es invalido:
  - `frontend/src/services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad.js`
  - `frontend/src/services/RequisitoFuncional_Login_AutenticacionRolesSesion.js`
- Login con mensaje amigable:
  - `frontend/src/pages/Login.jsx`

## Gestion de pacientes

- Modelo y validaciones de paciente:
  - `backend/app/models/patient.py`
  - `backend/app/schemas/patient.py`
- CRUD de pacientes:
  - `backend/app/routes/patients.py`
  - `frontend/src/components/patients/PatientForm.jsx`
  - `frontend/src/components/patients/PatientList.jsx`
  - `frontend/src/components/patients/PatientHistoryModal.jsx`

## Gestion de citas y flujo de atencion

- Estados: programada, llegado, en_atencion, atendida, cancelada, no_presentado:
  - `backend/app/models/appointment.py`
  - `backend/app/routes/appointments.py`
  - `backend/app/schemas/appointment.py`
- Pantalla operativa de citas:
  - `frontend/src/components/appointments/AppointmentList.jsx`
  - `frontend/src/components/appointments/AppointmentForm.jsx`

## Atencion medica e historia clinica

- Registro de atencion por medico:
  - `backend/app/routes/medical_records.py`
  - `backend/app/models/medical_record.py`
  - `frontend/src/components/appointments/MedicalRecordForm.jsx`

## Horario medico en vivo

- Estado de medico libre, ocupado o atendiendo:
  - `frontend/src/components/doctors/DoctorLiveStatus.jsx`

## Usuarios, medicos y roles

- Crear, editar, reasignar rol y eliminar usuarios:
  - `backend/app/models/user.py`
  - `backend/app/schemas/user.py`
  - `backend/app/routes/users.py`
  - `frontend/src/components/users/UserManagement.jsx`

## Reportes, trazabilidad e IA

- Reportes semanal/mensual, descarga PNG/PDF, resumen IA pre-desarrollo:
  - `frontend/src/pages/Dashboard.jsx`
- Auditoria y trazabilidad visual:
  - `frontend/src/pages/Dashboard.jsx`

## Configuracion inicial

- Creacion de tablas, migraciones simples y usuarios demo:
  - `backend/app/scripts/requisito_no_funcional_inicializacion_datos_demo_despliegue.py`

## Diseño visual

- Sistema visual general, estados, tablas, login, dashboard y tarjetas:
  - `frontend/src/RequisitoNoFuncional_InterfazDisenoResponsivo_Usabilidad.css`
  - `frontend/src/components/ui/Icon.jsx`
