import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentList from "../components/appointments/AppointmentList";
import DoctorLiveStatus from "../components/doctors/DoctorLiveStatus";
import PatientForm from "../components/patients/PatientForm";
import PatientList from "../components/patients/PatientList";
import UserManagement from "../components/users/UserManagement";
import Icon from "../components/ui/Icon";
import { auditEvents, services } from "../data/hospitalDemo";
import api from "../services/api";
import authService from "../services/authService";

const navGroups = [
  {
    title: "Principal",
    items: [
      { id: "home", label: "Dashboard", icon: "home" },
      { id: "appointments", label: "Citas", icon: "calendar" },
      { id: "patients", label: "Pacientes", icon: "users" },
      { id: "medics", label: "Medicos", icon: "stethoscope" },
      { id: "reports", label: "Reportes", icon: "chart" },
    ],
  },
  {
    title: "Admision",
    items: [
      { id: "registerPatient", label: "Admision", icon: "plus" },
      { id: "arrivals", label: "Llegada", icon: "clipboard" },
      { id: "queue", label: "Cola de Espera", icon: "users" },
      { id: "createAppointment", label: "Reprogramacion", icon: "calendar" },
    ],
  },
  {
    title: "Medico",
    items: [
      { id: "doctorAgenda", label: "Agenda", icon: "calendar" },
      { id: "attention", label: "Atenciones del dia", icon: "stethoscope" },
      { id: "history", label: "Historial de atenciones", icon: "file" },
    ],
  },
  {
    title: "Auditoria",
    items: [
      { id: "audit", label: "Trazabilidad", icon: "shield" },
      { id: "users", label: "Usuarios", icon: "user" },
    ],
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const role = authService.getRole() || "admin";
  const [activeView, setActiveView] = useState("home");
  const [patientRefreshKey, setPatientRefreshKey] = useState(0);
  const [appointmentRefreshKey, setAppointmentRefreshKey] = useState(0);
  const [queueFilter, setQueueFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [dashboardAppointments, setDashboardAppointments] = useState([]);
  const [now, setNow] = useState(new Date());

  const isAdminOrReception = role === "admin" || role === "recepcionista";
  const canAccessItem = (itemId) => {
    if (role === "admin") return true;
    if (role === "recepcionista") {
      return [
        "home",
        "appointments",
        "patients",
        "medics",
        "registerPatient",
        "arrivals",
        "queue",
        "createAppointment",
        "reports",
      ].includes(itemId);
    }
    if (role === "doctor") {
      return ["home", "doctorAgenda", "attention", "history", "medics"].includes(itemId);
    }
    return itemId === "home";
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/appointments/");
        setDashboardAppointments(response.data);
      } catch {
        setDashboardAppointments([]);
      }
    };

    loadDashboard();
  }, [appointmentRefreshKey]);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const liveRefresh = setInterval(() => {
      setAppointmentRefreshKey((value) => value + 1);
    }, 120000);

    return () => {
      clearInterval(clock);
      clearInterval(liveRefresh);
    };
  }, []);

  const statusCounts = useMemo(() => {
    return dashboardAppointments.reduce(
      (acc, appointment) => {
        acc[appointment.estado] = (acc[appointment.estado] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, programada: 0, llegado: 0, en_atencion: 0, atendida: 0, cancelada: 0, no_presentado: 0 }
    );
  }, [dashboardAppointments]);

  const flowCards = useMemo(() => [
    {
      id: "cita",
      title: "Cita",
      value: statusCounts.programada,
      subtitle: "programadas",
      icon: "calendar",
      view: "appointments",
      detail: [[statusCounts.programada, "Confirmadas"], [statusCounts.cancelada, "Canceladas"], [statusCounts.no_presentado, "No asistio"]],
    },
    {
      id: "llegada",
      title: "Llegada",
      value: statusCounts.llegado,
      subtitle: "pacientes llegados",
      icon: "clipboard",
      view: "arrivals",
      detail: [[statusCounts.llegado, "Registrados"], [statusCounts.programada, "Por llegar"], [statusCounts.no_presentado, "No se presentaron"]],
    },
    {
      id: "cola",
      title: "Cola",
      value: statusCounts.llegado,
      subtitle: "en espera",
      icon: "users",
      view: "queue",
      detail: [[statusCounts.llegado, "En espera"], [0, "Prioritarios"], [0, "Pausados"]],
    },
    {
      id: "atencion",
      title: "Atencion",
      value: statusCounts.en_atencion,
      subtitle: "en atencion",
      icon: "stethoscope",
      view: "attention",
      detail: [[statusCounts.en_atencion, "Consultorios ocupados"], [statusCounts.llegado, "En espera"], [0, "Pausados"]],
    },
    {
      id: "validacion",
      title: "Validacion",
      value: statusCounts.atendida,
      subtitle: "atenciones validadas",
      icon: "shield",
      view: "history",
      detail: [[statusCounts.atendida, "Validadas"], [statusCounts.en_atencion, "Pendientes"], [0, "Observadas"]],
    },
  ], [statusCounts]);

  const filteredQueue = useMemo(() => {
    const filterStatus = {
      "en cola": "llegado",
      "en atencion": "en_atencion",
      atendida: "atendida",
      pendiente: "programada",
    }[queueFilter];

    return dashboardAppointments.map((appointment) => {
      const patient = appointment.patient
        ? `${appointment.patient.nombres} ${appointment.patient.apellidos}`
        : "Paciente no disponible";
      const hour = new Date(appointment.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const stage = {
        programada: "Cita",
        llegado: "Cola",
        en_atencion: "Atencion",
        atendida: "Validacion",
        cancelada: "Cancelada",
        no_presentado: "No asistio",
      }[appointment.estado] || "Cita";

      return [
        hour,
        patient,
        appointment.patient?.dni || "-",
        appointment.motivo || "Consulta externa",
        appointment.doctor?.dni ? `MED-${appointment.doctor.dni.slice(-2)}` : "-",
        appointment.estado,
        stage,
        appointment.estado === "llegado" ? "18 min" : "-",
      ];
    }).filter((row) => {
      const matchesFilter = queueFilter === "todas" || row[5] === filterStatus;
      const text = row.join(" ").toLowerCase();
      return matchesFilter && text.includes(search.toLowerCase());
    });
  }, [dashboardAppointments, queueFilter, search]);

  const attendedPercent = statusCounts.total
    ? Math.round((statusCounts.atendida / statusCounts.total) * 1000) / 10
    : 0;

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <strong>+</strong>
          </div>
          <div>
            <h1>MEDIX</h1>
            <p>Arequipa</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <section key={group.title}>
              <p className="nav-title">{group.title}</p>
              {group.items.map((item) => {
                if (!canAccessItem(item.id)) return null;

                return (
                  <button
                    className={`nav-item ${activeView === item.id ? "active" : ""}`}
                    key={`${group.title}-${item.id}-${item.label}`}
                    onClick={() => setActiveView(item.id)}
                    type="button"
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </section>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="context-card wide">
            <Icon name="hospital" />
            <div>
              <strong>Hospital Regional Honorio Delgado</strong>
              <span>Arequipa - Peru</span>
            </div>
          </div>
          <div className="context-card">
            <Icon name="stethoscope" />
            <div>
              <strong>Consultorio Externo</strong>
              <span>Sede Principal</span>
            </div>
          </div>
          <div className="context-card compact">
            <Icon name="calendar" />
            <div>
              <strong>Fecha</strong>
              <span>{now.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="context-card compact">
            <Icon name="clock" />
            <div>
              <strong>Hora</strong>
              <span>{now.toLocaleTimeString()}</span>
              <small className="live-pill">En vivo</small>
            </div>
          </div>
          <div className="user-pill">
            <Icon name="user" />
            <div>
              <strong>{role === "doctor" ? "Medico" : "Luis Vargas"}</strong>
              <span>{role}</span>
            </div>
            <button onClick={handleLogout} title="Cerrar sesion" type="button">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </header>

        <div className="tabs">
          {[
            ["Resumen", "home"],
            ["Admision", "arrivals"],
            ["Medico", "medics"],
            ["Auditoria", "audit"],
          ].filter(([, viewId]) => canAccessItem(viewId)).map(([tab, viewId]) => (
            <button
              className={activeView === viewId || (tab === "Resumen" && activeView === "home") ? "selected" : ""}
              key={tab}
              onClick={() => setActiveView(viewId)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {activeView === "home" && (
          <div className="dashboard-grid">
            <div className="left-stack">
            <section className="main-panel">
              <div className="panel-heading">
                <div>
                  <h2>Flujo de atencion en tiempo real</h2>
                  <p>Operacion asistencial, admision y validacion del dia.</p>
                </div>
                <span>Actualizado: hace 1 min</span>
                <Icon name="refresh" size={18} />
              </div>

              <div className="flow-grid">
                {flowCards.map((card, index) => (
                  <article className="flow-card" key={card.id}>
                    <div className="flow-head">
                      <span>{index + 1}</span>
                      <strong>{card.title}</strong>
                    </div>
                    <Icon name={card.icon} size={38} />
                    <b>{card.value}</b>
                    <p>{card.subtitle}</p>
                    <div className="flow-detail">
                      {card.detail.map(([value, label]) => (
                        <div key={label}>
                          <strong>{value}</strong>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveView(card.view)} type="button">
                      Ver {card.title.toLowerCase()} <Icon name="chevron" size={16} />
                    </button>
                  </article>
                ))}
              </div>

              <div className="kpi-strip">
                <Metric icon="clock" label="Tiempo promedio en cola" value="28 min" />
                <Metric icon="users" label="Pacientes atendidos hoy" value={String(statusCounts.atendida)} />
                <Metric icon="check" label="% Cumplimiento de citas" value={`${attendedPercent} %`} />
              </div>
            </section>

            <section className="main-panel table-panel">
              <div className="panel-heading">
                <div>
                  <h2>Citas y cola de hoy</h2>
                  <p>Seguimiento operativo de pacientes por etapa.</p>
                </div>
                <div className="table-actions">
                  <Icon name="filter" size={18} />
                  <input
                    placeholder="Buscar paciente"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Icon name="search" size={18} />
                </div>
              </div>

              <div className="segmented">
                {["todas", "en cola", "en atencion", "atendida", "pendiente"].map((item) => (
                  <button
                    className={queueFilter === item ? "active" : ""}
                    key={item}
                    onClick={() => setQueueFilter(item)}
                    type="button"
                  >
                    {item === "todas" ? "Todas" : item}
                  </button>
                ))}
              </div>

              <QueueTable rows={filteredQueue} />
            </section>
            </div>

            <aside className="right-stack">
              <Panel title="Indicadores del dia" meta={`Total: ${statusCounts.total}`}>
                <div className="donut" />
                <div className="service-list">
                  {services.map((service) => (
                    <div key={service.name}>
                      <span style={{ background: service.color }} />
                      <p>{service.name}</p>
                      <strong>{service.total}</strong>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Estado de atenciones" meta={`Total: ${statusCounts.total}`}>
                {[
                  ["Atendidas", statusCounts.atendida, "green"],
                  ["En atencion", statusCounts.en_atencion, "blue"],
                  ["En cola", statusCounts.llegado, "amber"],
                  ["Programadas", statusCounts.programada, "cyan"],
                  ["No asistio", statusCounts.no_presentado, "gray"],
                ].map(([label, value, color]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <div><i className={color} style={{ width: `${Math.max(value, 4)}%` }} /></div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </Panel>

              <Panel title="Tiempos promedio">
                <Metric icon="clock" label="Espera en cola" value="28 min" compact />
                <Metric icon="clock" label="Atencion" value="23 min" compact />
                <Metric icon="clock" label="Total en sistema" value="51 min" compact />
              </Panel>
              <Panel title="Cumplimiento de citas">
                <div className="gauge">
                  <span>{attendedPercent}%</span>
                  <small>Cumplimiento</small>
                </div>
                <dl className="summary-list">
                  <div><dt>Citas programadas</dt><dd>{statusCounts.programada}</dd></div>
                  <div><dt>Citas cumplidas</dt><dd>{statusCounts.atendida}</dd></div>
                  <div><dt>No asistio</dt><dd>{statusCounts.no_presentado}</dd></div>
                </dl>
              </Panel>

              <Panel title="Bitacora operativa">
                <ul className="audit-list">
                  {auditEvents.map((event) => <li key={event}>{event}</li>)}
                </ul>
              </Panel>
            </aside>
          </div>
        )}

        {activeView === "registerPatient" && (
          <PatientForm
            onPatientCreated={() => {
              setPatientRefreshKey((value) => value + 1);
              setActiveView("patients");
            }}
          />
        )}

        {activeView === "patients" && <PatientList refreshKey={patientRefreshKey} />}

        {activeView === "createAppointment" && isAdminOrReception && (
          <AppointmentForm
            onAppointmentCreated={() => {
              setAppointmentRefreshKey((value) => value + 1);
              setActiveView("appointments");
            }}
          />
        )}

        {["appointments", "doctorAgenda", "attention", "arrivals", "queue", "history"].includes(activeView) && (
          <AppointmentList
            refreshKey={appointmentRefreshKey}
            view={activeView === "doctorAgenda" ? "appointments" : activeView}
            onChanged={() => setAppointmentRefreshKey((value) => value + 1)}
          />
        )}

        {activeView === "users" && <UserManagement />}

        {activeView === "medics" && <DoctorLiveStatus refreshKey={appointmentRefreshKey} />}

        {activeView === "reports" && (
          <ReportsPanel counts={statusCounts} attendedPercent={attendedPercent} />
        )}

        {activeView === "audit" && (
          <AuditPanel appointments={dashboardAppointments} />
        )}
      </section>
    </main>
  );
}

function Metric({ icon, label, value, compact = false }) {
  return (
    <div className={`metric ${compact ? "compact" : ""}`}>
      <Icon name={icon} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, meta, children }) {
  return (
    <section className="side-panel">
      <div className="side-heading">
        <h3>{title}</h3>
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function QueueTable({ rows }) {
  const headers = ["Hora cita", "Paciente", "Documento", "Servicio", "Consultorio", "Estado", "Etapa", "Tiempo en cola"];
  const labels = {
    programada: "Programada",
    llegado: "Llegado",
    en_atencion: "En atencion",
    atendida: "Atendida",
    cancelada: "Cancelada",
    no_presentado: "No asistio",
  };

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row[0]}-${row[2]}`}>
              {row.map((cell, index) => (
                <td key={`${row[2]}-${index}`}>
                  {index === 5 || index === 6 ? (
                    <span className={`status status-${String(cell).replaceAll(" ", "-")}`}>
                      {labels[cell] || cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="table-foot">Mostrando {rows.length} resultados</p>
    </div>
  );
}

function ReportsPanel({ counts, attendedPercent }) {
  const [period, setPeriod] = useState("semanal");
  const reportRows = [
    ["Citas totales", counts.total],
    ["Programadas", counts.programada],
    ["Llegados", counts.llegado],
    ["En atencion", counts.en_atencion],
    ["Atendidas", counts.atendida],
    ["Canceladas", counts.cancelada],
    ["No asistio", counts.no_presentado || 0],
  ];
  const aiSummary = `IA MEDIX (pre-desarrollo): en el periodo ${period}, el sistema registra ${counts.total} citas, ${counts.atendida} atenciones cerradas y ${attendedPercent}% de cumplimiento. Se recomienda revisar pacientes en espera y citas no asistidas antes del cierre del dia.`;

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Reportes hospitalarios</h2>
          <p>Resumen ejecutivo conectado al estado real de citas y atenciones.</p>
        </div>
        <div className="export-actions">
          <button onClick={() => downloadReportPng(reportRows, period, attendedPercent)} type="button">PNG</button>
          <button onClick={() => downloadReportPdf(reportRows, period, attendedPercent)} type="button">PDF</button>
        </div>
      </div>

      <div className="segmented">
        {["semanal", "mensual"].map((item) => (
          <button className={period === item ? "active" : ""} key={item} onClick={() => setPeriod(item)} type="button">
            {item}
          </button>
        ))}
      </div>

      <div className="report-grid">
        <Metric icon="calendar" label="Citas totales" value={String(counts.total)} />
        <Metric icon="clipboard" label="Pacientes llegados" value={String(counts.llegado)} />
        <Metric icon="stethoscope" label="En atencion" value={String(counts.en_atencion)} />
        <Metric icon="check" label="Atendidas" value={String(counts.atendida)} />
        <Metric icon="chart" label="Cumplimiento" value={`${attendedPercent} %`} />
      </div>

      <div className="report-note">
        <strong>Lectura operativa</strong>
        <p>
          El administrador puede usar este panel para ver si admision esta registrando llegadas,
          si los medicos tienen citas en atencion y cuantas atenciones ya fueron cerradas con
          historia clinica.
        </p>
      </div>

      <div className="report-note ai-note">
        <strong>Asistente IA de reportes</strong>
        <p>{aiSummary}</p>
      </div>
    </section>
  );
}

function downloadReportPng(rows, period, attendedPercent) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 620;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#007e7b";
  ctx.font = "bold 34px Arial";
  ctx.fillText("MEDIX - Reporte hospitalario", 48, 62);
  ctx.fillStyle = "#475569";
  ctx.font = "18px Arial";
  ctx.fillText(`Periodo: ${period} | Cumplimiento: ${attendedPercent}%`, 48, 96);

  rows.forEach(([label, value], index) => {
    const y = 150 + index * 58;
    ctx.fillStyle = "#f8fbfb";
    ctx.fillRect(48, y - 30, 700, 44);
    ctx.fillStyle = "#0f172a";
    ctx.font = "20px Arial";
    ctx.fillText(label, 68, y);
    ctx.fillStyle = "#008f8c";
    ctx.font = "bold 24px Arial";
    ctx.fillText(String(value), 650, y);
  });

  ctx.fillStyle = "#64748b";
  ctx.font = "16px Arial";
  ctx.fillText("Fuente: MEDIX | Datos en tiempo real", 48, 580);

  const link = document.createElement("a");
  link.download = `medix-reporte-${period}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function downloadReportPdf(rows, period, attendedPercent) {
  const lines = [
    "MEDIX - Reporte hospitalario",
    `Periodo: ${period}`,
    `Cumplimiento: ${attendedPercent}%`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Fuente: MEDIX | Datos en tiempo real",
  ];
  const stream = buildSimplePdf(lines);
  const blob = new Blob([stream], { type: "application/pdf" });
  const link = document.createElement("a");
  link.download = `medix-reporte-${period}.pdf`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildSimplePdf(lines) {
  const escaped = lines.map((line) => line.replace(/[()\\]/g, "\\$&"));
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    ...escaped.flatMap((line, index) => [
      index === 0 ? "" : "0 -28 Td",
      `(${line}) Tj`,
    ]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function AuditPanel({ appointments }) {
  const latest = appointments.slice(0, 12);

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Auditoria y trazabilidad</h2>
          <p>Seguimiento de actividad asistencial por paciente, medico y estado.</p>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Doctor</th>
              <th>Evento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.fecha_hora).toLocaleString()}</td>
                <td>{appointment.patient ? `${appointment.patient.nombres} ${appointment.patient.apellidos}` : "-"}</td>
                <td>{appointment.doctor?.dni || "-"}</td>
                <td>{appointment.motivo}</td>
                <td><span className={`status status-${appointment.estado}`}>{appointment.estado}</span></td>
              </tr>
            ))}
            {latest.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  Aun no hay eventos para auditar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Dashboard;
