const STORAGE_KEY = "medix_demo_state_v1";

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
  },
];

const todayAt = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const seedState = () => ({
  users: demoUsers,
  patients: [
    {
      id: 1,
      nombres: "Maria Elena",
      apellidos: "Quispe Mamani",
      dni: "29657841",
      fecha_nacimiento: "1988-04-12",
      telefono: "956123456",
      direccion: "Cercado, Arequipa",
    },
    {
      id: 2,
      nombres: "Jose Luis",
      apellidos: "Condori Apaza",
      dni: "30456123",
      fecha_nacimiento: "1979-09-20",
      telefono: "954987321",
      direccion: "Paucarpata, Arequipa",
    },
    {
      id: 3,
      nombres: "Rosa",
      apellidos: "Mendoza Flores",
      dni: "40781236",
      fecha_nacimiento: "1995-01-18",
      telefono: "958741236",
      direccion: "Yanahuara, Arequipa",
    },
  ],
  appointments: [
    { id: 1, patient_id: 1, doctor_id: 2, fecha_hora: todayAt(8, 0), motivo: "Medicina interna", estado: "atendida" },
    { id: 2, patient_id: 2, doctor_id: 2, fecha_hora: todayAt(8, 30), motivo: "Traumatologia", estado: "llegado" },
    { id: 3, patient_id: 3, doctor_id: 2, fecha_hora: todayAt(9, 0), motivo: "Pediatria", estado: "en_atencion" },
  ],
  records: [
    {
      id: 1,
      appointment_id: 1,
      patient_id: 1,
      doctor_id: 2,
      fecha_registro: todayAt(8, 22),
      motivo_consulta: "Medicina interna",
      sintomas: "Dolor abdominal leve y malestar general.",
      diagnostico: "Gastritis leve.",
      tratamiento_recetado: "Dieta blanda, hidratacion y control en 7 dias.",
    },
  ],
  sessionUserId: null,
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const load = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seedState();
    save(initial);
    return initial;
  }
  return JSON.parse(raw);
};

const save = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const response = (data) => Promise.resolve({ data: clone(data) });

const error = (detail, status = 400) =>
  Promise.reject({
    response: {
      status,
      data: { detail },
    },
  });

const publicUser = (user) => {
  const { password: _password, ...safeUser } = user;
  return {
    ...safeUser,
    codigo: safeUser.codigo || safeUser.dni,
    display_name: safeUser.display_name || `${safeUser.nombres || ""} ${safeUser.apellidos || ""}`.trim(),
  };
};

const hydrateAppointment = (state, appointment) => ({
  ...appointment,
  patient: state.patients.find((patient) => patient.id === Number(appointment.patient_id)) || null,
  doctor: publicUser(state.users.find((user) => user.id === Number(appointment.doctor_id)) || {}),
});

const nextId = (items) => Math.max(0, ...items.map((item) => Number(item.id))) + 1;

const getCurrentUser = (state) => {
  const id = Number(localStorage.getItem("medix_demo_user_id") || state.sessionUserId);
  return state.users.find((user) => user.id === id) || null;
};

const canUseAdminRoutes = (state) => getCurrentUser(state)?.role === "admin";

const demoApi = {
  async get(url) {
    const state = load();

    if (url === "/users/me") {
      const user = getCurrentUser(state);
      return user ? response(publicUser(user)) : error("Sesion demo no encontrada.", 401);
    }

    if (url === "/users/doctors") {
      return response(state.users.filter((user) => user.role === "doctor").map(publicUser));
    }

    if (url === "/users/") {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede ver usuarios.", 403);
      return response(state.users.map(publicUser));
    }

    if (url === "/patients/") {
      return response(state.patients);
    }

    if (url === "/appointments/") {
      return response(state.appointments.map((appointment) => hydrateAppointment(state, appointment)));
    }

    const doctorMatch = url.match(/^\/appointments\/doctor\/(\d+)$/);
    if (doctorMatch) {
      const doctorId = Number(doctorMatch[1]);
      return response(
        state.appointments
          .filter((appointment) => Number(appointment.doctor_id) === doctorId)
          .map((appointment) => hydrateAppointment(state, appointment))
      );
    }

    const historyMatch = url.match(/^\/medical-records\/patient\/(\d+)$/);
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

    if (url === "/auth/login") {
      const user = state.users.find(
        (item) => item.dni === payload.dni && item.password === payload.password
      );

      if (!user) {
        return error("DNI o contrasena incorrectos. Verifica los datos e intenta nuevamente.", 401);
      }

      state.sessionUserId = user.id;
      save(state);
      localStorage.setItem("medix_demo_user_id", String(user.id));

      return response({
        access_token: `demo-token-${user.id}`,
        token_type: "bearer",
        role: user.role,
      });
    }

    if (url === "/patients/") {
      if (state.patients.some((patient) => patient.dni === payload.dni)) {
        return error("Ya existe un paciente con ese DNI.", 409);
      }
      const patient = { id: nextId(state.patients), ...payload };
      state.patients.push(patient);
      save(state);
      return response(patient);
    }

    if (url === "/users/") {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede crear usuarios.", 403);
      if (state.users.some((user) => user.dni === payload.dni)) {
        return error("Ya existe un usuario con ese DNI.", 409);
      }
      const user = {
        id: nextId(state.users),
        codigo: payload.role === "doctor" ? `CMP-${payload.dni}` : payload.dni,
        display_name: `${payload.nombres || ""} ${payload.apellidos || ""}`.trim(),
        ...payload,
      };
      state.users.push(user);
      save(state);
      return response(publicUser(user));
    }

    if (url === "/appointments/") {
      const appointment = {
        id: nextId(state.appointments),
        patient_id: Number(payload.patient_id),
        doctor_id: Number(payload.doctor_id),
        fecha_hora: new Date(payload.fecha_hora).toISOString(),
        motivo: payload.motivo,
        estado: "programada",
      };
      state.appointments.push(appointment);
      save(state);
      return response(hydrateAppointment(state, appointment));
    }

    if (url === "/medical-records/") {
      const appointment = state.appointments.find((item) => item.id === Number(payload.appointment_id));
      if (!appointment) return error("La cita no existe.", 404);
      appointment.estado = "atendida";

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
      };
      state.records.push(record);
      save(state);
      return response(record);
    }

    return error("Ruta demo no disponible.", 404);
  },

  async patch(url, payload) {
    const state = load();

    const userMatch = url.match(/^\/users\/(\d+)$/);
    if (userMatch) {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede modificar usuarios.", 403);
      const user = state.users.find((item) => item.id === Number(userMatch[1]));
      if (!user) return error("Usuario no encontrado.", 404);
      Object.assign(user, payload, {
        display_name: `${payload.nombres || user.nombres || ""} ${payload.apellidos || user.apellidos || ""}`.trim(),
      });
      save(state);
      return response(publicUser(user));
    }

    const patientMatch = url.match(/^\/patients\/(\d+)$/);
    if (patientMatch) {
      const patient = state.patients.find((item) => item.id === Number(patientMatch[1]));
      if (!patient) return error("Paciente no encontrado.", 404);
      Object.assign(patient, payload);
      save(state);
      return response(patient);
    }

    const statusMatch = url.match(/^\/appointments\/(\d+)\/status$/);
    if (statusMatch) {
      const appointment = state.appointments.find((item) => item.id === Number(statusMatch[1]));
      if (!appointment) return error("Cita no encontrada.", 404);
      appointment.estado = payload.estado;
      save(state);
      return response(hydrateAppointment(state, appointment));
    }

    return error("Ruta demo no disponible.", 404);
  },

  async delete(url) {
    const state = load();

    const userMatch = url.match(/^\/users\/(\d+)$/);
    if (userMatch) {
      if (!canUseAdminRoutes(state)) return error("Solo el administrador puede eliminar usuarios.", 403);
      const id = Number(userMatch[1]);
      if (getCurrentUser(state)?.id === id) return error("No puedes eliminar tu propio usuario.", 400);
      state.users = state.users.filter((user) => user.id !== id);
      save(state);
      return response({ ok: true });
    }

    const patientMatch = url.match(/^\/patients\/(\d+)$/);
    if (patientMatch) {
      const id = Number(patientMatch[1]);
      state.patients = state.patients.filter((patient) => patient.id !== id);
      state.appointments = state.appointments.filter((appointment) => appointment.patient_id !== id);
      state.records = state.records.filter((record) => record.patient_id !== id);
      save(state);
      return response({ ok: true });
    }

    return error("Ruta demo no disponible.", 404);
  },
};

export default demoApi;
