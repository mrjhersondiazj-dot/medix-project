import {
  defaultSpecialtySettings,
  specialties,
} from "../data/RequisitoFuncional_Reportes_DatosDemoIndicadores";

const STORAGE_KEY = "medix_demo_state_v4";

const todayAt = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const addDaysAt = (days, hour, minute) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const demoUsers = [
  {
    id: 1,
    nombres: "Luis",
    apellidos: "Vargas",
    dni: "12345678",
    celular: "999111222",
    password: "admin123",
    role: "admin",
    codigo: "ADM-01",
    display_name: "Luis Vargas",
    specialty: "TODAS",
    shift: "administrativo",
  },
  {
    id: 2,
    nombres: "Carlos",
    apellidos: "Mendoza",
    dni: "11112222",
    celular: "999333444",
    password: "doctor123",
    role: "doctor",
    codigo: "CMP-20451",
    display_name: "Dr. Carlos Mendoza",
    specialty: "MEDICINA INTERNA",
    shift: "manana",
  },
  {
    id: 3,
    nombres: "Ana",
    apellidos: "Quispe",
    dni: "22223333",
    celular: "999555666",
    password: "recep123",
    role: "recepcionista",
    codigo: "REC-01",
    display_name: "Ana Quispe",
    specialty: "TODAS",
    shift: "admision",
  },
  {
    id: 4,
    nombres: "Rosa",
    apellidos: "Delgado",
    dni: "33334444",
    celular: "978555111",
    password: "doctor123",
    role: "doctor",
    codigo: "CMP-33771",
    display_name: "Dra. Rosa Delgado",
    specialty: "PEDIATRIA GENERAL",
    shift: "manana",
  },
  {
    id: 5,
    nombres: "Martin",
    apellidos: "Salas",
    dni: "44445555",
    celular: "976222888",
    password: "doctor123",
    role: "doctor",
    codigo: "CMP-44112",
    display_name: "Dr. Martin Salas",
    specialty: "TRAUMATOLOGIA",
    shift: "tarde",
  },
  {
    id: 6,
    nombres: "Elena",
    apellidos: "Paredes",
    dni: "55556666",
    celular: "966777333",
    password: "doctor123",
    role: "doctor",
    codigo: "CMP-51980",
    display_name: "Dra. Elena Paredes",
    specialty: "GINECOLOGIA",
    shift: "tarde",
  },
];

const patients = [
  {
    id: 1,
    nombres: "Maria Elena",
    apellidos: "Quispe Mamani",
    dni: "29657841",
    fecha_nacimiento: "1988-04-12",
    telefono: "956123456",
    direccion: "Cercado, Arequipa",
    prioridad: "normal",
  },
  {
    id: 2,
    nombres: "Jose Luis",
    apellidos: "Condori Apaza",
    dni: "30456123",
    fecha_nacimiento: "1979-09-20",
    telefono: "954987321",
    direccion: "Paucarpata, Arequipa",
    prioridad: "normal",
  },
  {
    id: 3,
    nombres: "Rosa",
    apellidos: "Mendoza Flores",
    dni: "40781236",
    fecha_nacimiento: "1995-01-18",
    telefono: "958741236",
    direccion: "Yanahuara, Arequipa",
    prioridad: "normal",
  },
  {
    id: 4,
    nombres: "Carlos Alberto",
    apellidos: "Diaz Cruz",
    dni: "29664123",
    fecha_nacimiento: "1974-08-03",
    telefono: "951333222",
    direccion: "Miraflores, Arequipa",
    prioridad: "preferente",
  },
  {
    id: 5,
    nombres: "Sandra Milagros",
    apellidos: "Vargas Tito",
    dni: "46874512",
    fecha_nacimiento: "1991-11-16",
    telefono: "959444555",
    direccion: "Sachaca, Arequipa",
    prioridad: "normal",
  },
  {
    id: 6,
    nombres: "Wilber Paco",
    apellidos: "Huanca",
    dni: "23987456",
    fecha_nacimiento: "1968-05-27",
    telefono: "953223344",
    direccion: "Cayma, Arequipa",
    prioridad: "emergencia",
  },
];

const seedState = () => ({
  version: 4,
  users: demoUsers,
  patients,
  settings: defaultSpecialtySettings,
  appointments: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 2,
      fecha_hora: todayAt(8, 0),
      motivo: "Control de presión y revisión general",
      specialty: "MEDICINA INTERNA",
      consultorio: "MI-01",
      estado: "atendida",
      arrived_at: todayAt(7, 50),
      started_at: todayAt(8, 2),
      closed_at: todayAt(8, 24),
      priority: "normal",
    },
    {
      id: 2,
      patient_id: 2,
      doctor_id: 5,
      fecha_hora: todayAt(8, 20),
      motivo: "Dolor de rodilla posterior a caída",
      specialty: "TRAUMATOLOGIA",
      consultorio: "TRA-02",
      estado: "llegado",
      arrived_at: todayAt(8, 7),
      priority: "normal",
    },
    {
      id: 3,
      patient_id: 3,
      doctor_id: 4,
      fecha_hora: todayAt(8, 40),
      motivo: "Control pediátrico general",
      specialty: "PEDIATRIA GENERAL",
      consultorio: "PED-01",
      estado: "en_atencion",
      arrived_at: todayAt(8, 25),
      started_at: todayAt(8, 44),
      priority: "normal",
    },
    {
      id: 4,
      patient_id: 4,
      doctor_id: 2,
      fecha_hora: todayAt(9, 0),
      motivo: "Seguimiento de glucosa",
      specialty: "MEDICINA INTERNA",
      consultorio: "MI-02",
      estado: "programada",
      priority: "preferente",
    },
    {
      id: 5,
      patient_id: 5,
      doctor_id: 6,
      fecha_hora: todayAt(14, 20),
      motivo: "Control ginecológico",
      specialty: "GINECOLOGIA",
      consultorio: "GIN-01",
      estado: "programada",
      priority: "normal",
    },
    {
      id: 6,
      patient_id: 6,
      doctor_id: 2,
      fecha_hora: todayAt(10, 0),
      motivo: "Atención por emergencia menor",
      specialty: "MEDICINA INTERNA",
      consultorio: "MI-03",
      estado: "programada",
      priority: "emergencia",
    },
    {
      id: 7,
      patient_id: 1,
      doctor_id: 2,
      fecha_hora: addDaysAt(1, 8, 0),
      motivo: "Revisión de resultados",
      specialty: "MEDICINA INTERNA",
      consultorio: "MI-01",
      estado: "programada",
      priority: "normal",
    },
  ],
  records: [
    {
      id: 1,
      appointment_id: 1,
      patient_id: 1,
      doctor_id: 2,
      fecha_registro: todayAt(8, 24),
      motivo_consulta: "Control de presión y revisión general",
      sintomas: "Cefalea leve y cansancio.",
      diagnostico: "Hipertensión controlada.",
      tratamiento_recetado: "Continuar tratamiento, dieta baja en sodio y control en 30 días.",
      patient_feedback: "Atención clara y rápida.",
    },
  ],
  incidents: [
    {
      id: 1,
      title: "Paciente no ubicado en cola",
      description: "Recepción registró llegada, pero el médico no veía al paciente en agenda.",
      reporterRole: "recepcionista",
      reporterName: "Ana Quispe",
      specialty: "MEDICINA INTERNA",
      status: "en_revision",
      priority: "alta",
      decision: "Se validó sincronización de cola y se dejó seguimiento para cierre.",
      attachments: ["captura-cola.png"],
      created_at: todayAt(9, 12),
      updated_at: todayAt(9, 45),
    },
  ],
  audit: [
    { id: 1, created_at: todayAt(7, 40), actor: "Sistema", module: "Jornada", event: "Inicio de jornada asistencial" },
    { id: 2, created_at: todayAt(8, 7), actor: "Ana Quispe", module: "Llegada", event: "Paciente 30456123 marcado como llegado" },
    { id: 3, created_at: todayAt(8, 44), actor: "Dr. Carlos Mendoza", module: "Atención", event: "Atención iniciada para paciente 40781236" },
  ],
  sessionUserId: null,
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const save = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const load = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seedState();
    save(initial);
    return initial;
  }

  const parsed = JSON.parse(raw);
  if (parsed.version !== 4) {
    const initial = seedState();
    save(initial);
    return initial;
  }

  return parsed;
};

const response = (data) => Promise.resolve({ data: clone(data) });

const error = (detail, status = 400) =>
  Promise.reject({
    response: {
      status,
      data: { detail },
    },
  });

const publicUser = (user = {}) => {
  const { password: _password, ...safeUser } = user;
  return {
    ...safeUser,
    codigo: safeUser.codigo || safeUser.dni,
    display_name: safeUser.display_name || `${safeUser.nombres || ""} ${safeUser.apellidos || ""}`.trim(),
  };
};

const nextId = (items) => Math.max(0, ...items.map((item) => Number(item.id))) + 1;

const getCurrentUser = (state) => {
  const id = Number(localStorage.getItem("medix_demo_user_id") || state.sessionUserId);
  return state.users.find((user) => user.id === id) || null;
};

const canUseAdminRoutes = (state) => getCurrentUser(state)?.role === "admin";

const validateFixedDigits = (value, length, label, required = true) => {
  if (!value && !required) return "";
  if (!value) return `${label} es obligatorio.`;
  if (!new RegExp(`^\\d{${length}}$`).test(String(value))) {
    return `${label} debe tener exactamente ${length} digitos numericos.`;
  }
  return "";
};

const addAudit = (state, module, event, actorName) => {
  const actor = actorName || publicUser(getCurrentUser(state) || {}).display_name || "Sistema";
  state.audit.unshift({
    id: nextId(state.audit),
    created_at: new Date().toISOString(),
    actor,
    module,
    event,
  });
};

const hydrateAppointment = (state, appointment) => ({
  ...appointment,
  patient: state.patients.find((patient) => patient.id === Number(appointment.patient_id)) || null,
  doctor: publicUser(state.users.find((user) => user.id === Number(appointment.doctor_id)) || {}),
});

const dateKey = (value) => new Date(value).toISOString().slice(0, 10);

const getShiftFromDate = (settings, isoValue) => {
  const hour = new Date(isoValue).toTimeString().slice(0, 5);
  if (hour >= settings.morningStart && hour <= settings.morningEnd) return "manana";
  if (hour >= settings.afternoonStart && hour <= settings.afternoonEnd) return "tarde";
  return "";
};

const validateAppointment = (state, payload, ignoreId = null) => {
  const patient = state.patients.find((item) => item.id === Number(payload.patient_id));
  if (!patient) {
    return "Selecciona un paciente valido.";
  }

  const doctor = state.users.find((user) => user.id === Number(payload.doctor_id));
  if (!doctor || doctor.role !== "doctor") {
    return "Selecciona un médico válido.";
  }

  const specialty = payload.specialty || doctor.specialty;
  if (!specialties.includes(specialty)) {
    return "Selecciona una especialidad válida.";
  }

  if (doctor.specialty !== specialty) {
    return `El médico seleccionado pertenece a ${doctor.specialty}.`;
  }

  const settings = state.settings[specialty] || defaultSpecialtySettings[specialty];
  const parsedDate = new Date(payload.fecha_hora);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Selecciona una fecha y hora valida.";
  }
  const isoDate = parsedDate.toISOString();
  const shift = getShiftFromDate(settings, isoDate);
  if (!shift) {
    return `La cita debe estar dentro del horario ${settings.morningStart}-${settings.morningEnd} o ${settings.afternoonStart}-${settings.afternoonEnd}.`;
  }

  const sameDaySpecialty = state.appointments.filter(
    (appointment) =>
      appointment.id !== ignoreId &&
      appointment.specialty === specialty &&
      dateKey(appointment.fecha_hora) === dateKey(isoDate) &&
      !["cancelada", "no_presentado"].includes(appointment.estado)
  );

  if (sameDaySpecialty.length >= Number(settings.dailyLimit)) {
    return `La especialidad ${specialty} ya alcanzó el límite diario de ${settings.dailyLimit} citas.`;
  }

  const doctorConflict = state.appointments.some(
    (appointment) =>
      appointment.id !== ignoreId &&
      Number(appointment.doctor_id) === Number(payload.doctor_id) &&
      new Date(appointment.fecha_hora).getTime() === new Date(isoDate).getTime() &&
      !["cancelada", "no_presentado"].includes(appointment.estado)
  );

  if (doctorConflict) {
    return "Ese médico ya tiene una cita programada en la misma fecha y hora.";
  }

  return "";
};

const getAvailability = (state, specialty, date) => {
  const settings = state.settings[specialty] || defaultSpecialtySettings[specialty];
  const doctors = state.users.filter((user) => user.role === "doctor" && user.specialty === specialty);
  const used = state.appointments.filter(
    (appointment) =>
      appointment.specialty === specialty &&
      dateKey(appointment.fecha_hora) === date &&
      !["cancelada", "no_presentado"].includes(appointment.estado)
  );

  return {
    specialty,
    date,
    dailyLimit: Number(settings.dailyLimit),
    used: used.length,
    available: Math.max(0, Number(settings.dailyLimit) - used.length),
    settings,
    doctors: doctors.map(publicUser),
  };
};

const parseUrl = (url) => {
  const [path, query = ""] = url.split("?");
  return { path, params: new URLSearchParams(query) };
};

const demoApi = {
  async get(url) {
    const state = load();
    const { path, params } = parseUrl(url);
    const currentUser = getCurrentUser(state);

    if (path === "/users/me") {
      return currentUser ? response(publicUser(currentUser)) : error("Sesión demo no encontrada.", 401);
    }

    if (path === "/config/specialties") {
      return response({
        specialties,
        settings: state.settings,
      });
    }

    if (path === "/users/doctors") {
      return response(state.users.filter((user) => user.role === "doctor").map(publicUser));
    }

    if (path === "/users/") {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede ver usuarios.", 403);
      return response(state.users.map(publicUser));
    }

    if (path === "/patients/") {
      return response(state.patients);
    }

    if (path === "/appointments/") {
      const all = state.appointments.map((appointment) => hydrateAppointment(state, appointment));
      return response(all);
    }

    if (path === "/incidents/") {
      if (!currentUser) return error("Inicia sesión para revisar incidencias.", 401);
      if (currentUser.role === "admin") return response(state.incidents);
      return response(state.incidents.filter((incident) => incident.reporterRole === currentUser.role));
    }

    if (path === "/audit/") {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede revisar trazabilidad.", 403);
      return response(state.audit);
    }

    if (path === "/availability") {
      const specialty = params.get("specialty") || "MEDICINA INTERNA";
      const date = params.get("date") || new Date().toISOString().slice(0, 10);
      return response(getAvailability(state, specialty, date));
    }

    const doctorMatch = path.match(/^\/appointments\/doctor\/(\d+)$/);
    if (doctorMatch) {
      const doctorId = Number(doctorMatch[1]);
      return response(
        state.appointments
          .filter((appointment) => Number(appointment.doctor_id) === doctorId)
          .map((appointment) => hydrateAppointment(state, appointment))
      );
    }

    const historyMatch = path.match(/^\/medical-records\/patient\/(\d+)$/);
    if (historyMatch) {
      const patientId = Number(historyMatch[1]);
      return response(
        state.records
          .filter((record) => Number(record.patient_id) === patientId)
          .map((record) => ({
            ...record,
            doctor: publicUser(state.users.find((user) => user.id === Number(record.doctor_id)) || {}),
          }))
      );
    }

    return error("Ruta demo no disponible.", 404);
  },

  async post(url, payload) {
    const state = load();
    const { path } = parseUrl(url);
    const currentUser = getCurrentUser(state);

    if (path === "/auth/login") {
      const user = state.users.find((item) => item.dni === payload.dni && item.password === payload.password);
      if (!user) {
        return error("Credenciales inválidas. Verifica tu DNI, contraseña o solicita al administrador revisar tu acceso.", 401);
      }

      state.sessionUserId = user.id;
      addAudit(state, "Seguridad", `Inicio de sesión correcto para rol ${user.role}`, user.display_name);
      save(state);
      localStorage.setItem("medix_demo_user_id", String(user.id));

      return response({
        access_token: `demo-token-${user.id}`,
        token_type: "bearer",
        role: user.role,
      });
    }

    if (path === "/patients/") {
      const dniError = validateFixedDigits(payload.dni, 8, "DNI");
      if (dniError) return error(dniError, 422);
      const phoneError = validateFixedDigits(payload.telefono, 9, "Telefono", false);
      if (phoneError) return error(phoneError, 422);
      if (state.patients.some((patient) => patient.dni === payload.dni)) {
        return error("Ya existe un paciente con ese DNI.", 409);
      }

      const patient = {
        id: nextId(state.patients),
        prioridad: payload.prioridad || "normal",
        ...payload,
      };
      state.patients.push(patient);
      addAudit(state, "Pacientes", `Paciente ${payload.dni} registrado`);
      save(state);
      return response(patient);
    }

    if (path === "/users/") {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede crear usuarios.", 403);
      const dniError = validateFixedDigits(payload.dni, 8, "DNI");
      if (dniError) return error(dniError, 422);
      const phoneError = validateFixedDigits(payload.celular, 9, "Celular");
      if (phoneError) return error(phoneError, 422);
      if (state.users.some((user) => user.dni === payload.dni)) {
        return error("Ya existe un usuario con ese DNI.", 409);
      }

      const user = {
        id: nextId(state.users),
        codigo: payload.role === "doctor" ? `CMP-${payload.dni}` : payload.dni,
        display_name: `${payload.nombres || ""} ${payload.apellidos || ""}`.trim(),
        specialty: payload.role === "doctor" ? payload.specialty || "MEDICINA INTERNA" : "TODAS",
        shift: payload.shift || (payload.role === "doctor" ? "manana" : "administrativo"),
        ...payload,
      };
      state.users.push(user);
      addAudit(state, "Usuarios", `Usuario ${user.dni} creado con rol ${user.role}`);
      save(state);
      return response(publicUser(user));
    }

    if (path === "/appointments/") {
      const validationError = validateAppointment(state, payload);
      if (validationError) return error(validationError, 409);

      const doctor = state.users.find((user) => user.id === Number(payload.doctor_id));
      const settings = state.settings[payload.specialty || doctor.specialty] || defaultSpecialtySettings[payload.specialty || doctor.specialty];
      const appointment = {
        id: nextId(state.appointments),
        patient_id: Number(payload.patient_id),
        doctor_id: Number(payload.doctor_id),
        fecha_hora: new Date(payload.fecha_hora).toISOString(),
        motivo: payload.motivo,
        specialty: payload.specialty || doctor.specialty,
        consultorio: payload.consultorio || `${(payload.specialty || doctor.specialty).slice(0, 3)}-01`,
        estado: "programada",
        priority: payload.priority || "normal",
        turno: getShiftFromDate(settings, payload.fecha_hora),
      };
      state.appointments.push(appointment);
      addAudit(state, "Citas", `Cita creada para ${appointment.specialty} a las ${new Date(appointment.fecha_hora).toLocaleString()}`);
      save(state);
      return response(hydrateAppointment(state, appointment));
    }

    if (path === "/medical-records/") {
      const appointment = state.appointments.find((item) => item.id === Number(payload.appointment_id));
      if (!appointment) return error("La cita no existe.", 404);
      if (!["admin", "doctor"].includes(currentUser?.role)) {
        return error("Solo el medico o administrador puede cerrar una atencion medica.", 403);
      }
      if (currentUser?.role === "doctor" && Number(appointment.doctor_id) !== Number(currentUser.id)) {
        return error("Solo el medico asignado puede registrar esta historia clinica.", 403);
      }

      appointment.estado = "atendida";
      appointment.closed_at = new Date().toISOString();
      const record = {
        id: nextId(state.records),
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        fecha_registro: new Date().toISOString(),
        motivo_consulta: appointment.motivo,
        sintomas: payload.sintomas,
        diagnostico: payload.diagnostico,
        tratamiento_recetado: payload.tratamiento_recetado,
        patient_feedback: payload.patient_feedback || "",
      };
      state.records.push(record);
      addAudit(state, "Atención médica", `Atención registrada para cita ${appointment.id}`);
      save(state);
      return response(record);
    }

    if (path === "/incidents/") {
      if (!currentUser) return error("Inicia sesión para registrar incidencias.", 401);
      const incident = {
        id: nextId(state.incidents),
        title: payload.title,
        description: payload.description,
        reporterRole: currentUser.role,
        reporterName: publicUser(currentUser).display_name,
        specialty: payload.specialty || currentUser.specialty || "TODAS",
        status: "enviada",
        priority: payload.priority || "media",
        decision: "",
        attachments: payload.attachments || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.incidents.unshift(incident);
      addAudit(state, "Incidencias", `Incidencia registrada: ${incident.title}`);
      save(state);
      return response(incident);
    }

    return error("Ruta demo no disponible.", 404);
  },

  async patch(url, payload) {
    const state = load();
    const { path } = parseUrl(url);

    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch) {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede modificar usuarios.", 403);
      const user = state.users.find((item) => item.id === Number(userMatch[1]));
      if (!user) return error("Usuario no encontrado.", 404);
      const dniError = validateFixedDigits(payload.dni, 8, "DNI");
      if (dniError) return error(dniError, 422);
      const phoneError = validateFixedDigits(payload.celular, 9, "Celular");
      if (phoneError) return error(phoneError, 422);
      Object.assign(user, payload, {
        specialty: payload.role === "doctor" ? payload.specialty || user.specialty || "MEDICINA INTERNA" : "TODAS",
        display_name: `${payload.nombres || user.nombres || ""} ${payload.apellidos || user.apellidos || ""}`.trim(),
      });
      addAudit(state, "Usuarios", `Usuario ${user.dni} actualizado`);
      save(state);
      return response(publicUser(user));
    }

    const patientMatch = path.match(/^\/patients\/(\d+)$/);
    if (patientMatch) {
      const patient = state.patients.find((item) => item.id === Number(patientMatch[1]));
      if (!patient) return error("Paciente no encontrado.", 404);
      const dniError = validateFixedDigits(payload.dni, 8, "DNI");
      if (dniError) return error(dniError, 422);
      const phoneError = validateFixedDigits(payload.telefono, 9, "Telefono", false);
      if (phoneError) return error(phoneError, 422);
      Object.assign(patient, payload);
      addAudit(state, "Pacientes", `Paciente ${patient.dni} actualizado`);
      save(state);
      return response(patient);
    }

    const appointmentMatch = path.match(/^\/appointments\/(\d+)$/);
    if (appointmentMatch) {
      const appointment = state.appointments.find((item) => item.id === Number(appointmentMatch[1]));
      if (!appointment) return error("Cita no encontrada.", 404);
      const nextAppointment = {
        ...appointment,
        ...payload,
        patient_id: Number(payload.patient_id || appointment.patient_id),
        doctor_id: Number(payload.doctor_id || appointment.doctor_id),
        fecha_hora: payload.fecha_hora ? new Date(payload.fecha_hora).toISOString() : appointment.fecha_hora,
      };
      const validationError = validateAppointment(state, nextAppointment, appointment.id);
      if (validationError) return error(validationError, 409);
      const doctor = state.users.find((user) => user.id === Number(nextAppointment.doctor_id));
      const specialty = payload.specialty || nextAppointment.specialty || doctor.specialty;
      const settings = state.settings[specialty] || defaultSpecialtySettings[specialty];
      Object.assign(appointment, nextAppointment, {
        specialty,
        estado: payload.estado || "programada",
        turno: getShiftFromDate(settings, nextAppointment.fecha_hora),
      });
      addAudit(state, "Citas", `Cita ${appointment.id} reprogramada o actualizada`);
      save(state);
      return response(hydrateAppointment(state, appointment));
    }

    const statusMatch = path.match(/^\/appointments\/(\d+)\/status$/);
    if (statusMatch) {
      const appointment = state.appointments.find((item) => item.id === Number(statusMatch[1]));
      if (!appointment) return error("Cita no encontrada.", 404);
      const currentUser = getCurrentUser(state);
      const allowedByRole = {
        admin: ["programada", "llegado", "en_atencion", "atendida", "cancelada", "no_presentado"],
        recepcionista: ["llegado", "cancelada", "no_presentado"],
        doctor: ["en_atencion", "atendida"],
      };
      const allowedStatuses = allowedByRole[currentUser?.role] || [];
      if (!allowedStatuses.includes(payload.estado)) {
        return error("Tu rol no puede aplicar ese cambio de estado.", 403);
      }
      if (currentUser?.role === "doctor" && Number(appointment.doctor_id) !== Number(currentUser.id)) {
        return error("Solo el medico asignado puede actualizar esta atencion.", 403);
      }
      appointment.estado = payload.estado;
      if (payload.estado === "llegado") appointment.arrived_at = new Date().toISOString();
      if (payload.estado === "en_atencion") appointment.started_at = new Date().toISOString();
      if (["atendida", "cancelada", "no_presentado"].includes(payload.estado)) appointment.closed_at = new Date().toISOString();
      addAudit(state, "Citas", `Cita ${appointment.id} cambió a ${payload.estado}`);
      save(state);
      return response(hydrateAppointment(state, appointment));
    }

    const incidentMatch = path.match(/^\/incidents\/(\d+)$/);
    if (incidentMatch) {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede revisar incidencias.", 403);
      const incident = state.incidents.find((item) => item.id === Number(incidentMatch[1]));
      if (!incident) return error("Incidencia no encontrada.", 404);
      Object.assign(incident, payload, { updated_at: new Date().toISOString() });
      addAudit(state, "Incidencias", `Incidencia ${incident.id} actualizada a ${incident.status}`);
      save(state);
      return response(incident);
    }

    if (path === "/config/specialties") {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede editar configuración.", 403);
      state.settings = {
        ...state.settings,
        [payload.specialty]: {
          ...(state.settings[payload.specialty] || defaultSpecialtySettings[payload.specialty]),
          ...payload.settings,
        },
      };
      addAudit(state, "Configuración", `Cupos y horarios actualizados para ${payload.specialty}`);
      save(state);
      return response(state.settings[payload.specialty]);
    }

    return error("Ruta demo no disponible.", 404);
  },

  async delete(url) {
    const state = load();
    const { path } = parseUrl(url);

    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch) {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede eliminar usuarios.", 403);
      const id = Number(userMatch[1]);
      if (getCurrentUser(state)?.id === id) return error("No puedes eliminar tu propio usuario.", 400);
      state.users = state.users.filter((user) => user.id !== id);
      addAudit(state, "Usuarios", `Usuario ${id} eliminado`);
      save(state);
      return response({ ok: true });
    }

    const patientMatch = path.match(/^\/patients\/(\d+)$/);
    if (patientMatch) {
      const id = Number(patientMatch[1]);
      state.patients = state.patients.filter((patient) => patient.id !== id);
      state.appointments = state.appointments.filter((appointment) => appointment.patient_id !== id);
      state.records = state.records.filter((record) => record.patient_id !== id);
      addAudit(state, "Pacientes", `Paciente ${id} eliminado`);
      save(state);
      return response({ ok: true });
    }

    return error("Ruta demo no disponible.", 404);
  },
};

export default demoApi;
