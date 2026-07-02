import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import authService from "../../services/authService";
import Icon from "../ui/Icon";
import MedicalRecordForm from "./MedicalRecordForm";

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
    description: "Vista general de citas programadas, llegadas, atendidas y canceladas.",
    statuses: [],
  },
  arrivals: {
    title: "Llegada de pacientes",
    description: "Marca la llegada del paciente cuando se presente en admision.",
    statuses: ["programada"],
  },
  queue: {
    title: "Cola de espera",
    description: "Pacientes registrados en admision y listos para atencion.",
    statuses: ["llegado"],
  },
  attention: {
    title: "Atenciones del dia",
    description: "Citas en atencion y citas listas para que el medico registre la consulta.",
    statuses: ["programada", "llegado", "en_atencion"],
  },
  history: {
    title: "Historial de atenciones",
    description: "Atenciones finalizadas con historia clinica registrada.",
    statuses: ["atendida"],
  },
};

function AppointmentList({ refreshKey, view = "appointments", onChanged }) {
  const role = authService.getRole();
  const [appointments, setAppointments] = useState([]);
  const [me, setMe] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(false);

  const currentView = viewConfig[view] || viewConfig.appointments;

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const meResponse = await api.get("/users/me");
      setMe(meResponse.data);

      const appointmentsResponse =
        meResponse.data.role === "doctor"
          ? await api.get(`/appointments/doctor/${meResponse.data.id}`)
          : await api.get("/appointments/");

      setAppointments(appointmentsResponse.data);
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [refreshKey]);

  const visibleAppointments = useMemo(() => {
    const text = search.toLowerCase();

    return appointments.filter((appointment) => {
      const viewMatches =
        currentView.statuses.length === 0 || currentView.statuses.includes(appointment.estado);
      const statusMatches = statusFilter === "todos" || appointment.estado === statusFilter;
      const patient = appointment.patient
        ? `${appointment.patient.nombres} ${appointment.patient.apellidos} ${appointment.patient.dni}`
        : "";
      const doctor = appointment.doctor ? `${appointment.doctor.dni} ${appointment.doctor.celular}` : "";

      return (
        viewMatches &&
        statusMatches &&
        `${patient} ${doctor} ${appointment.motivo} ${appointment.estado}`.toLowerCase().includes(text)
      );
    });
  }, [appointments, currentView.statuses, search, statusFilter]);

  const counts = useMemo(() => {
    return appointments.reduce(
      (acc, appointment) => {
        acc[appointment.estado] = (acc[appointment.estado] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, programada: 0, llegado: 0, en_atencion: 0, atendida: 0, cancelada: 0, no_presentado: 0 }
    );
  }, [appointments]);

  const updateStatus = async (appointment, estado) => {
    try {
      await api.patch(`/appointments/${appointment.id}/status`, { estado });
      await loadAppointments();
      onChanged?.();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo actualizar la cita.");
    }
  };

  const handleSaved = async () => {
    await loadAppointments();
    onChanged?.();
  };

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>{role === "doctor" && view === "appointments" ? "Mis citas de hoy" : currentView.title}</h2>
          <p>{role === "doctor" && view === "appointments" ? "Agenda asignada para tu atencion medica." : currentView.description}</p>
        </div>
        {me && <span>Usuario: {me.celular} | Rol: {me.role}</span>}
      </div>

      <div className="status-summary">
        <SummaryCard label="Total" value={counts.total} />
        <SummaryCard label="Programadas" value={counts.programada} />
        <SummaryCard label="Llegados" value={counts.llegado} />
        <SummaryCard label="En atencion" value={counts.en_atencion} />
        <SummaryCard label="Atendidas" value={counts.atendida} />
        <SummaryCard label="No asistio" value={counts.no_presentado} />
      </div>

      <div className="module-toolbar">
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

        <div className="table-actions">
          <Icon name="search" size={18} />
          <input
            placeholder="Buscar paciente, DNI o medico"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table appointments-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Paciente</th>
              <th>DNI</th>
              <th>Doctor</th>
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
                <td>{appointment.doctor ? `DNI ${appointment.doctor.dni}` : "-"}</td>
                <td>{appointment.motivo}</td>
                <td><span className={`status status-${appointment.estado}`}>{statusLabels[appointment.estado] || appointment.estado}</span></td>
                <td>
                  <AppointmentActions
                    appointment={appointment}
                    role={role}
                    onAttend={() => setSelectedAppointment(appointment)}
                    onStatusChange={updateStatus}
                  />
                </td>
              </tr>
            ))}

            {!loading && visibleAppointments.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">
                  No hay citas para mostrar en esta vista.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">
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

function AppointmentActions({ appointment, role, onAttend, onStatusChange }) {
  const isClosed = ["atendida", "cancelada", "no_presentado"].includes(appointment.estado);
  const canReceptionOperate = role === "admin" || role === "recepcionista";
  const canStartAttention = role === "admin" || role === "doctor";
  const canRegisterAttention = role === "doctor";

  if (isClosed) return <span className="muted-action">Cerrada</span>;

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

      {canReceptionOperate && appointment.estado !== "en_atencion" && (
        <button className="small-action red" onClick={() => onStatusChange(appointment, "cancelada")} type="button">
          Cancelar
        </button>
      )}

      {["admin", "recepcionista", "doctor"].includes(role) && ["programada", "llegado"].includes(appointment.estado) && (
        <button className="small-action amber" onClick={() => onStatusChange(appointment, "no_presentado")} type="button">
          No asistio
        </button>
      )}
    </div>
  );
}

export default AppointmentList;
