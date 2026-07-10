/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Citas_FlujoAtencion_ColaEstados.jsx
 * Proposito: Lista de citas: controla llegada, cola, atencion, reprogramacion, no asistencia y cierre medico.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

import { useEffect, useMemo, useState } from "react";

import { formatSpecialty, normalizeText } from "../../data/RequisitoFuncional_Reportes_DatosDemoIndicadores";
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";
import authService from "../../services/RequisitoFuncional_Login_AutenticacionRolesSesion";
import Icon from "../ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";
import MedicalRecordForm from "./RequisitoFuncional_HistoriaClinica_RegistroAtencionMedica";

const statusLabels = {
  programada: "Programada",
  llegado: "Llegado",
  en_atencion: "En atencion",
  atendida: "Atendida",
  cancelada: "Cancelada",
  no_presentado: "No asistio",
};

const viewConfig = {
  appointments: {
    title: "Citas medicas del hospital",
    description: "Vista general con filtros por especialidad, fecha, hora y estado.",
    statuses: [],
  },
  arrivals: {
    title: "Llegada de pacientes",
    description: "Recepcion marca llegada para activar cola de espera.",
    statuses: ["programada"],
  },
  queue: {
    title: "Cola de espera",
    description: "Pacientes llegados y pendientes de atencion medica.",
    statuses: ["llegado"],
  },
  attention: {
    title: "Atenciones del dia",
    description: "Citas listas, en cola o en atencion para cierre medico.",
    statuses: ["programada", "llegado", "en_atencion"],
  },
  history: {
    title: "Historial de atenciones",
    description: "Atenciones cerradas con historia clinica y feedback registrado.",
    statuses: ["atendida"],
  },
};

const getDateValue = (iso) => new Date(iso).toISOString().slice(0, 10);
const getTimeValue = (iso) => new Date(iso).toTimeString().slice(0, 5);

function AppointmentList({ refreshKey, view = "appointments", selectedSpecialty = "TODAS", onChanged }) {
  const role = authService.getRole();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [me, setMe] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [specialtyFilter, setSpecialtyFilter] = useState(selectedSpecialty);
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const currentView = viewConfig[view] || viewConfig.appointments;

  const loadAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [meResponse, doctorsResponse, configResponse] = await Promise.all([
        api.get("/users/me"),
        api.get("/users/doctors"),
        api.get("/config/specialties"),
      ]);
      setMe(meResponse.data);
      setDoctors(doctorsResponse.data);
      setSpecialties(configResponse.data.specialties || []);

      const appointmentsResponse =
        meResponse.data.role === "doctor"
          ? await api.get(`/appointments/doctor/${meResponse.data.id}`)
          : await api.get("/appointments/");

      setAppointments(appointmentsResponse.data);
      if (meResponse.data.role === "doctor") {
        setSpecialtyFilter(meResponse.data.specialty || "TODAS");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "No se pudieron cargar las citas.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [refreshKey]);

  useEffect(() => {
    const refreshMs = role === "doctor" ? 15000 : 12000;
    const liveRefresh = setInterval(() => {
      loadAppointments(true);
    }, refreshMs);

    return () => clearInterval(liveRefresh);
  }, [role, view, selectedSpecialty]);

  useEffect(() => {
    if (role !== "doctor") setSpecialtyFilter(selectedSpecialty);
  }, [selectedSpecialty, role]);

  const visibleAppointments = useMemo(() => {
    const text = normalizeText(search);

    return appointments.filter((appointment) => {
      const viewMatches =
        currentView.statuses.length === 0 || currentView.statuses.includes(appointment.estado);
      const statusMatches = statusFilter === "todos" || appointment.estado === statusFilter;
      const specialtyMatches =
        specialtyFilter === "TODAS" || appointment.specialty === specialtyFilter;
      const dateMatches = !dateFilter || getDateValue(appointment.fecha_hora) === dateFilter;
      const timeMatches = !timeFilter || getTimeValue(appointment.fecha_hora).startsWith(timeFilter);
      const patient = appointment.patient
        ? `${appointment.patient.nombres} ${appointment.patient.apellidos} ${appointment.patient.dni}`
        : "";
      const doctor = appointment.doctor
        ? `${appointment.doctor.display_name} ${appointment.doctor.dni} ${appointment.doctor.specialty}`
        : "";
      const searchable = normalizeText(
        `${patient} ${doctor} ${appointment.motivo} ${appointment.estado} ${appointment.specialty} ${appointment.consultorio}`
      );

      return (
        viewMatches &&
        statusMatches &&
        specialtyMatches &&
        dateMatches &&
        timeMatches &&
        searchable.includes(text)
      );
    });
  }, [appointments, currentView.statuses, dateFilter, search, specialtyFilter, statusFilter, timeFilter]);

  const counts = useMemo(() => {
    return visibleAppointments.reduce(
      (acc, appointment) => {
        acc[appointment.estado] = (acc[appointment.estado] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, programada: 0, llegado: 0, en_atencion: 0, atendida: 0, cancelada: 0, no_presentado: 0 }
    );
  }, [visibleAppointments]);

  const updateStatus = async (appointment, estado) => {
    setMessage(null);
    try {
      await api.patch(`/appointments/${appointment.id}/status`, { estado });
      setMessage({ type: "success", text: `Cita actualizada a: ${statusLabels[estado]}.` });
      await loadAppointments();
      onChanged?.();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "No se pudo actualizar la cita.",
      });
    }
  };

  const handleSaved = async () => {
    setSelectedAppointment(null);
    await loadAppointments();
    onChanged?.();
  };

  const handleReprogrammed = async () => {
    setEditingAppointment(null);
    await loadAppointments();
    onChanged?.();
  };

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>{role === "doctor" && view === "appointments" ? "Mis citas medicas" : currentView.title}</h2>
          <p>{role === "doctor" ? "Agenda propia asignada por especialidad y medico." : currentView.description}</p>
        </div>
        {me && <span>{me.display_name || me.celular} | {formatSpecialty(me.specialty || "TODAS")}</span>}
      </div>

      {message && (
        <div className={`inline-alert ${message.type}`}>
          <Icon name={message.type === "success" ? "check" : "alert"} size={18} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="status-summary">
        <SummaryCard label="Total" value={counts.total} />
        <SummaryCard label="Programadas" value={counts.programada} />
        <SummaryCard label="Llegados" value={counts.llegado} />
        <SummaryCard label="En atencion" value={counts.en_atencion} />
        <SummaryCard label="Atendidas" value={counts.atendida} />
        <SummaryCard label="No asistio" value={counts.no_presentado} />
      </div>

      <div className="module-toolbar rich-toolbar">
        <div className="segmented">
          {["todos", "programada", "llegado", "en_atencion", "atendida", "cancelada", "no_presentado"].map((status) => (
            <button
              className={statusFilter === status ? "active" : ""}
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
            >
              {status === "todos" ? "Todos" : statusLabels[status]}
            </button>
          ))}
        </div>

        <div className="filter-grid">
          <select
            disabled={role === "doctor"}
            value={specialtyFilter}
            onChange={(event) => setSpecialtyFilter(event.target.value)}
          >
            <option value="TODAS">Todas las especialidades</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>{formatSpecialty(specialty)}</option>
            ))}
          </select>
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          <input type="time" value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)} />
          <div className="table-actions">
            <Icon name="search" size={18} />
            <input
              placeholder="Paciente, DNI, medico o consultorio"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table appointments-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Paciente</th>
              <th>DNI</th>
              <th>Especialidad</th>
              <th>Doctor</th>
              <th>Consultorio</th>
              <th>Prioridad</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {visibleAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.fecha_hora).toLocaleString()}</td>
                <td>{appointment.patient ? `${appointment.patient.nombres} ${appointment.patient.apellidos}` : "-"}</td>
                <td>{appointment.patient?.dni || "-"}</td>
                <td>{formatSpecialty(appointment.specialty)}</td>
                <td>{appointment.doctor?.display_name || `DNI ${appointment.doctor?.dni || "-"}`}</td>
                <td>{appointment.consultorio || "-"}</td>
                <td><span className={`status priority-${appointment.priority || "normal"}`}>{appointment.priority || "normal"}</span></td>
                <td>{appointment.motivo}</td>
                <td><span className={`status status-${appointment.estado}`}>{statusLabels[appointment.estado] || appointment.estado}</span></td>
                <td>
                  <AppointmentActions
                    appointment={appointment}
                    role={role}
                    onAttend={() => setSelectedAppointment(appointment)}
                    onReprogram={() => setEditingAppointment(appointment)}
                    onStatusChange={updateStatus}
                  />
                </td>
              </tr>
            ))}

            {!loading && visibleAppointments.length === 0 && (
              <tr>
                <td colSpan="10" className="p-6 text-center text-slate-500">
                  No hay citas para mostrar con los filtros seleccionados.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="10" className="p-6 text-center text-slate-500">
                  Cargando citas...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedAppointment && (
        <MedicalRecordForm
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSaved={handleSaved}
        />
      )}

      {editingAppointment && (
        <ReprogramModal
          appointment={editingAppointment}
          doctors={doctors}
          onClose={() => setEditingAppointment(null)}
          onSaved={handleReprogrammed}
        />
      )}
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AppointmentActions({ appointment, role, onAttend, onReprogram, onStatusChange }) {
  const canReceptionOperate = role === "admin" || role === "recepcionista";
  const canStartAttention = role === "admin" || role === "doctor";
  const canRegisterAttention = role === "admin" || role === "doctor";
  const canReprogram =
    canReceptionOperate && ["programada", "cancelada", "no_presentado"].includes(appointment.estado);

  return (
    <div className="action-row">
      {canReceptionOperate && appointment.estado === "programada" && (
        <button className="small-action teal" onClick={() => onStatusChange(appointment, "llegado")} type="button">
          Llegada
        </button>
      )}

      {canStartAttention && ["programada", "llegado"].includes(appointment.estado) && (
        <button className="small-action blue" onClick={() => onStatusChange(appointment, "en_atencion")} type="button">
          Iniciar
        </button>
      )}

      {canRegisterAttention && ["programada", "llegado", "en_atencion"].includes(appointment.estado) && (
        <button className="small-action green" onClick={onAttend} type="button">
          Registrar
        </button>
      )}

      {canReprogram && (
        <button className="small-action amber" onClick={onReprogram} type="button">
          Reprogramar
        </button>
      )}

      {canReceptionOperate && !["atendida", "cancelada", "no_presentado", "en_atencion"].includes(appointment.estado) && (
        <button className="small-action red" onClick={() => onStatusChange(appointment, "cancelada")} type="button">
          Cancelar
        </button>
      )}

      {canReceptionOperate && ["programada", "llegado"].includes(appointment.estado) && (
        <button className="small-action slate" onClick={() => onStatusChange(appointment, "no_presentado")} type="button">
          No asistio
        </button>
      )}

      {!canReprogram && ["atendida", "cancelada", "no_presentado"].includes(appointment.estado) && (
        <span className="muted-action">Cerrada</span>
      )}
    </div>
  );
}

function ReprogramModal({ appointment, doctors, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: getDateValue(appointment.fecha_hora),
    time: getTimeValue(appointment.fecha_hora),
    doctor_id: appointment.doctor_id || appointment.doctor?.id || "",
    consultorio: appointment.consultorio || "",
  });
  const [message, setMessage] = useState(null);
  const filteredDoctors = doctors.filter((doctor) => doctor.specialty === appointment.specialty);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      await api.patch(`/appointments/${appointment.id}`, {
        patient_id: appointment.patient_id,
        doctor_id: Number(form.doctor_id),
        specialty: appointment.specialty,
        fecha_hora: `${form.date}T${form.time}`,
        consultorio: form.consultorio,
        priority: appointment.priority,
        motivo: appointment.motivo,
        estado: "programada",
      });
      onSaved?.();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "No se pudo reprogramar. Revisa cupo, horario y medico.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="modal-panel">
        <div className="panel-heading">
          <div>
            <h2>Reprogramar cita</h2>
            <p>{formatSpecialty(appointment.specialty)} | {appointment.patient?.nombres} {appointment.patient?.apellidos}</p>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">Cerrar</button>
        </div>

        {message && (
          <div className={`inline-alert ${message.type}`}>
            <Icon name="alert" size={18} />
            <span>{message.text}</span>
          </div>
        )}

        <form className="appointment-form compact" onSubmit={handleSubmit}>
          <label>
            Fecha
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>
            Hora
            <input name="time" type="time" value={form.time} onChange={handleChange} required />
          </label>
          <label>
            Medico
            <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required>
              {filteredDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.display_name} - {doctor.codigo}
                </option>
              ))}
            </select>
          </label>
          <label>
            Consultorio
            <input name="consultorio" value={form.consultorio} onChange={handleChange} required />
          </label>
          <button className="medix-button span-2" type="submit">Guardar reprogramacion</button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentList;
