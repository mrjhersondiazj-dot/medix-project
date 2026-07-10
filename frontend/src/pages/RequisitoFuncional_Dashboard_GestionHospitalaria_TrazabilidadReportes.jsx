/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Dashboard_GestionHospitalaria_TrazabilidadReportes.jsx
 * Proposito: Dashboard principal: concentra flujo hospitalario, roles, citas, admision, medicos, incidencias y reportes.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppointmentList from "../components/appointments/RequisitoFuncional_Citas_FlujoAtencion_ColaEstados";
import AppointmentForm from "../components/appointments/RequisitoFuncional_Citas_ProgramacionReprogramacion";
import DoctorLiveStatus from "../components/doctors/RequisitoFuncional_Medicos_EstadoEnVivo_Agenda";
import PatientList from "../components/patients/RequisitoFuncional_Pacientes_GestionEdicionBusqueda";
import PatientForm from "../components/patients/RequisitoFuncional_Pacientes_RegistroAdmision";
import Icon from "../components/ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";
import UserManagement from "../components/users/RequisitoFuncional_Usuarios_RolesPermisosAdministracion";
import { formatSpecialty, normalizeText } from "../data/RequisitoFuncional_Reportes_DatosDemoIndicadores";
import authService from "../services/RequisitoFuncional_Login_AutenticacionRolesSesion";
import api from "../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";

const navGroups = [
  {
    title: "Principal",
    items: [
      { id: "home", label: "Dashboard", icon: "home" },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { id: "appointments", label: "Citas", icon: "calendar" },
      { id: "patients", label: "Pacientes", icon: "users" },
      { id: "medics", label: "Medicos", icon: "stethoscope" },
      { id: "registerPatient", label: "Admision / Cola", icon: "plus" },
      { id: "arrivals", label: "Llegada", icon: "clipboard" },
      { id: "attention", label: "Atenciones", icon: "stethoscope" },
      { id: "history", label: "Historial Clinico", icon: "file" },
      { id: "createAppointment", label: "Reprogramaciones", icon: "calendar" },
    ],
  },
  {
    title: "Administracion",
    items: [
      { id: "users", label: "Usuarios", icon: "user" },
      { id: "settings", label: "Especialidades", icon: "settings" },
      { id: "doctorAgenda", label: "Turnos y Horarios", icon: "calendar" },
      { id: "incidents", label: "Incidencias", icon: "alert" },
    ],
  },
  {
    title: "Reportes",
    items: [
      { id: "reports", label: "Indicadores", icon: "chart" },
      { id: "history", label: "Atenciones", icon: "file" },
      { id: "reports", label: "Exportar Reportes", icon: "download" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { id: "audit", label: "Trazabilidad", icon: "shield" },
      { id: "incidents", label: "Bitacora", icon: "clipboard" },
      { id: "settings", label: "Configuracion", icon: "settings" },
    ],
  },
];

const statusLabels = {
  programada: "Programadas",
  llegado: "Llegados",
  en_atencion: "En atencion",
  atendida: "Atendidas",
  cancelada: "Canceladas",
  no_presentado: "No asistio",
};

const chartColors = ["#079b95", "#2d6cdf", "#6252c9", "#58c8bd", "#c9ced6"];

const getNavKey = (groupTitle, item) => `${groupTitle}-${item.id}-${item.label}`;

function Dashboard() {
  const navigate = useNavigate();
  const role = authService.getRole() || "admin";
  const [activeView, setActiveView] = useState("home");
  const [activeNavKey, setActiveNavKey] = useState(getNavKey(navGroups[0].title, navGroups[0].items[0]));
  const [patientRefreshKey, setPatientRefreshKey] = useState(0);
  const [appointmentRefreshKey, setAppointmentRefreshKey] = useState(0);
  const [dashboardAppointments, setDashboardAppointments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedSpecialty, setSelectedSpecialty] = useState("TODAS");
  const [queueFilter, setQueueFilter] = useState("todas");
  const [queueStatus, setQueueStatus] = useState("todos");
  const [queueDate, setQueueDate] = useState("");
  const [queueTime, setQueueTime] = useState("");
  const [search, setSearch] = useState("");
  const [me, setMe] = useState(null);
  const [now, setNow] = useState(new Date());
  const [chatOpen, setChatOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Soy MEDIX IA local. Respondo solo sobre esta plataforma: citas, pacientes, cola, medicos, incidencias, reportes y seguridad." },
  ]);
  const [chatInput, setChatInput] = useState("");

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
        "incidents",
      ].includes(itemId);
    }
    if (role === "doctor") {
      return ["home", "doctorAgenda", "attention", "history", "medics", "incidents"].includes(itemId);
    }
    return itemId === "home";
  };

  const selectView = (viewId, navKey) => {
    setActiveView(viewId);
    if (navKey) {
      setActiveNavKey(navKey);
      return;
    }

    const matchingGroup = navGroups
      .map((group) => ({
        group,
        item: group.items.find((item) => item.id === viewId && canAccessItem(item.id)),
      }))
      .find(({ item }) => item);

    setActiveNavKey(matchingGroup ? getNavKey(matchingGroup.group.title, matchingGroup.item) : "");
  };

  const loadDashboard = async () => {
    try {
      const meResponse = await api.get("/users/me");
      setMe(meResponse.data);

      const appointmentsRequest =
        meResponse.data.role === "doctor"
          ? api.get(`/appointments/doctor/${meResponse.data.id}`)
          : api.get("/appointments/");
      const [appointmentsResponse, configResponse, incidentsResponse, doctorsResponse] = await Promise.all([
        appointmentsRequest,
        api.get("/config/specialties"),
        api.get("/incidents/"),
        api.get("/users/doctors"),
      ]);

      setDashboardAppointments(appointmentsResponse.data);
      setSpecialties(configResponse.data.specialties || []);
      setSettings(configResponse.data.settings || {});
      setIncidents(incidentsResponse.data || []);
      setAllDoctors(doctorsResponse.data || []);

      if (meResponse.data.role === "doctor") {
        setSelectedSpecialty(meResponse.data.specialty || "TODAS");
      }

      try {
        const auditResponse = await api.get("/audit/");
        setAuditTrail(auditResponse.data || []);
      } catch {
        setAuditTrail([]);
      }
    } catch {
      setDashboardAppointments([]);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [appointmentRefreshKey]);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const liveRefresh = setInterval(() => {
      setAppointmentRefreshKey((value) => value + 1);
    }, 60000);

    return () => {
      clearInterval(clock);
      clearInterval(liveRefresh);
    };
  }, []);

  const scopedAppointments = useMemo(() => {
    return dashboardAppointments.filter(
      (appointment) => selectedSpecialty === "TODAS" || appointment.specialty === selectedSpecialty
    );
  }, [dashboardAppointments, selectedSpecialty]);

  const statusCounts = useMemo(() => {
    return scopedAppointments.reduce(
      (acc, appointment) => {
        acc[appointment.estado] = (acc[appointment.estado] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, programada: 0, llegado: 0, en_atencion: 0, atendida: 0, cancelada: 0, no_presentado: 0 }
    );
  }, [scopedAppointments]);

  const attendedPercent = statusCounts.total
    ? Math.round((statusCounts.atendida / statusCounts.total) * 1000) / 10
    : 0;

  const averageWait = useMemo(() => {
    const measured = scopedAppointments
      .filter((appointment) => appointment.arrived_at && appointment.started_at)
      .map((appointment) => Math.max(1, Math.round((new Date(appointment.started_at) - new Date(appointment.arrived_at)) / 60000)));
    if (measured.length) {
      return Math.round(measured.reduce((sum, value) => sum + value, 0) / measured.length);
    }
    const estimated = statusCounts.llegado * 18 + statusCounts.en_atencion * 12;
    return statusCounts.llegado + statusCounts.en_atencion
      ? Math.round(estimated / (statusCounts.llegado + statusCounts.en_atencion))
      : 0;
  }, [scopedAppointments, statusCounts.en_atencion, statusCounts.llegado]);

  const serviceStats = useMemo(() => {
    const bySpecialty = scopedAppointments.reduce((acc, appointment) => {
      acc[appointment.specialty] = (acc[appointment.specialty] || 0) + 1;
      return acc;
    }, {});
    const rows = Object.entries(bySpecialty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    return rows.length ? rows : [["Sin registros", 0]];
  }, [scopedAppointments]);

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
      detail: [[statusCounts.llegado, "Registrados"], [statusCounts.programada, "Por llegar"], [statusCounts.no_presentado, "No llegaron"]],
    },
    {
      id: "cola",
      title: "Cola",
      value: statusCounts.llegado,
      subtitle: "en espera",
      icon: "users",
      view: "queue",
      detail: [[statusCounts.llegado, "En espera"], [countPriority(scopedAppointments), "Prioritarios"], [0, "Pausados"]],
    },
    {
      id: "atencion",
      title: "Atencion",
      value: statusCounts.en_atencion,
      subtitle: "en atencion",
      icon: "stethoscope",
      view: "attention",
      detail: [[statusCounts.en_atencion, "Consultorios ocupados"], [statusCounts.llegado, "En espera"], [statusCounts.atendida, "Cerradas"]],
    },
    {
      id: "validacion",
      title: "Validacion",
      value: statusCounts.atendida,
      subtitle: "atenciones validadas",
      icon: "shield",
      view: "history",
      detail: [[statusCounts.atendida, "Validadas"], [statusCounts.en_atencion, "Pendientes"], [incidents.length, "Incidencias"]],
    },
  ], [incidents.length, scopedAppointments, statusCounts]);

  const filteredQueue = useMemo(() => {
    const stageFilter = {
      "en cola": "llegado",
      "en atencion": "en_atencion",
      atendida: "atendida",
      pendiente: "programada",
    }[queueFilter];
    const text = normalizeText(search);

    return scopedAppointments
      .filter((appointment) => {
        const matchesStage = queueFilter === "todas" || appointment.estado === stageFilter;
        const matchesStatus = queueStatus === "todos" || appointment.estado === queueStatus;
        const matchesDate = !queueDate || new Date(appointment.fecha_hora).toISOString().slice(0, 10) === queueDate;
        const matchesTime = !queueTime || new Date(appointment.fecha_hora).toTimeString().slice(0, 5).startsWith(queueTime);
        const patient = appointment.patient
          ? `${appointment.patient.nombres} ${appointment.patient.apellidos} ${appointment.patient.dni}`
          : "";
        const doctor = appointment.doctor ? `${appointment.doctor.display_name} ${appointment.doctor.dni}` : "";
        const matchesSearch = normalizeText(`${patient} ${doctor} ${appointment.specialty} ${appointment.consultorio} ${appointment.motivo}`).includes(text);
        return matchesStage && matchesStatus && matchesDate && matchesTime && matchesSearch;
      })
      .map((appointment) => ({
        id: appointment.id,
        hour: new Date(appointment.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        patient: appointment.patient ? `${appointment.patient.nombres} ${appointment.patient.apellidos}` : "Paciente no disponible",
        dni: appointment.patient?.dni || "-",
        specialty: formatSpecialty(appointment.specialty),
        doctor: appointment.doctor?.display_name || "-",
        motivo: appointment.motivo || "-",
        status: appointment.estado,
      }));
  }, [averageWait, queueDate, queueFilter, queueStatus, queueTime, scopedAppointments, search]);

  const doctorRows = useMemo(() => {
    const rows = new Map(
      allDoctors
        .filter((doctor) => selectedSpecialty === "TODAS" || doctor.specialty === selectedSpecialty)
        .map((doctor) => [
          doctor.id,
          {
            id: doctor.id,
            name: doctor.display_name || `DNI ${doctor.dni}`,
            specialty: doctor.specialty,
            waiting: 0,
            attended: 0,
            active: false,
          },
        ])
    );
    scopedAppointments.forEach((appointment) => {
      if (!appointment.doctor?.id) return;
      const current = rows.get(appointment.doctor.id) || {
        id: appointment.doctor.id,
        name: appointment.doctor.display_name || `DNI ${appointment.doctor.dni}`,
        specialty: appointment.doctor.specialty || appointment.specialty,
        waiting: 0,
        attended: 0,
        active: false,
      };
      if (["programada", "llegado"].includes(appointment.estado)) current.waiting += 1;
      if (appointment.estado === "atendida") current.attended += 1;
      if (appointment.estado === "en_atencion") current.active = true;
      rows.set(appointment.doctor.id, current);
    });
    return Array.from(rows.values()).slice(0, 6);
  }, [allDoctors, scopedAppointments, selectedSpecialty]);

  const activeDoctors = doctorRows.filter((doctor) => doctor.active || doctor.waiting > 0).length;
  const openIncidents = incidents.filter((item) => item.status !== "revisada").length;
  const notifications = useMemo(() => buildNotifications({
    role,
    scopedAppointments,
    incidents,
    doctorRows,
    averageWait,
  }), [averageWait, doctorRows, incidents, role, scopedAppointments]);

  const kpiCards = [
    { label: "Citas programadas", value: statusCounts.programada, sub: "Hoy", icon: "calendar", trend: "+12 % vs ayer" },
    { label: "En espera (cola)", value: statusCounts.llegado, sub: "Ahora", icon: "users", trend: "-5 % vs ayer" },
    { label: "En atencion", value: statusCounts.en_atencion, sub: "Ahora", icon: "stethoscope", trend: "+3 % vs ayer" },
    { label: "Atendidas", value: statusCounts.atendida, sub: "Hoy", icon: "check", trend: "+8 % vs ayer" },
    { label: "Tiempo promedio", value: `${averageWait + 23}`, suffix: "min", sub: "Atencion", icon: "clock", trend: "-2 min vs ayer" },
    { label: "Medicos activos", value: `${activeDoctors} / ${Math.max(doctorRows.length, activeDoctors) || 1}`, sub: "Ahora", icon: "users", trend: `${Math.round((activeDoctors / (Math.max(doctorRows.length, activeDoctors) || 1)) * 100)}% de disponibilidad` },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    const value = chatInput.trim();
    if (!value) return;
    const response = buildChatResponse(value, {
      role,
      me,
      selectedSpecialty,
      counts: statusCounts,
      averageWait,
      incidents,
      attendedPercent,
      appointments: scopedAppointments,
      doctors: doctorRows,
      notifications,
    });
    setChatMessages((current) => [...current, { from: "user", text: value }, { from: "bot", text: response.text }]);
    setChatInput("");
    if (response.view && canAccessItem(response.view)) {
      selectView(response.view);
      setChatOpen(false);
    }
  };

  const askAssistant = (question) => {
    setChatInput(question);
    const response = buildChatResponse(question, {
      role,
      me,
      selectedSpecialty,
      counts: statusCounts,
      averageWait,
      incidents,
      attendedPercent,
      appointments: scopedAppointments,
      doctors: doctorRows,
      notifications,
    });
    setChatMessages((current) => [...current, { from: "user", text: question }, { from: "bot", text: response.text }]);
    if (response.view && canAccessItem(response.view)) {
      selectView(response.view);
      setChatOpen(false);
    }
    setChatInput("");
  };

  return (
    <main className="app-shell medix-dashboard-redesign">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><span /><strong>+</strong></div>
          <div>
            <h1>MEDIX</h1>
            <p>Hospital</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <section key={group.title}>
              <p className="nav-title">{group.title}</p>
              {group.items.map((item) => {
                if (!canAccessItem(item.id)) return null;
                const navKey = getNavKey(group.title, item);

                return (
                  <button
                    className={`nav-item ${activeNavKey === navKey ? "active" : ""}`}
                    key={navKey}
                    onClick={() => selectView(item.id, navKey)}
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

        <div className="system-status-card">
          <span />
          <div>
            <strong>Sistema operativo</strong>
            <p>Todos los servicios activos</p>
            <small>v2.0 Pro</small>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="topbar-menu" title="Menu" type="button">
            <Icon name="menu" size={22} />
          </button>
          <div className="context-card wide hospital-context">
            <span className="context-icon hospital-tile"><Icon name="hospital" size={22} /></span>
            <div>
              <strong>Hospital Regional</strong>
              <span>Sede Principal</span>
            </div>
            <Icon className="context-chevron" name="chevronDown" size={16} />
          </div>
          <div className="context-card specialty-context">
            <span className="context-icon specialty-tile"><Icon name="specialty" size={22} /></span>
            <div>
              <strong>Especialidad</strong>
              <select
                disabled={role === "doctor"}
                value={selectedSpecialty}
                onChange={(event) => setSelectedSpecialty(event.target.value)}
              >
                <option value="TODAS">Todas las especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>{formatSpecialty(specialty)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="context-card compact live-clock">
            <span className="context-icon plain"><Icon name="clock" size={22} /></span>
            <div>
              <strong>Hora actual</strong>
              <span>{now.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="context-card compact">
            <span className="context-icon plain"><Icon name="calendar" size={22} /></span>
            <div>
              <strong>Fecha</strong>
              <span>{now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>
          <button
            className={`notification-button ${notificationsOpen ? "active" : ""}`}
            onClick={() => setNotificationsOpen((value) => !value)}
            type="button"
            title="Notificaciones"
          >
            <Icon name="notification" size={20} />
            <span>{notifications.length || openIncidents || 1}</span>
          </button>
          <div className="user-pill">
            <span className="avatar-icon"><Icon name="user" size={20} /></span>
            <div>
              <strong>{me?.display_name || (role === "doctor" ? "Medico" : "Usuario MEDIX")}</strong>
              <span>{role}</span>
            </div>
            <button onClick={handleLogout} title="Cerrar sesion" type="button">
              <Icon name="chevronDown" size={16} />
            </button>
          </div>
        </header>

        {notificationsOpen && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setNotificationsOpen(false)}
            onOpenView={(view) => {
              selectView(view);
              setNotificationsOpen(false);
            }}
          />
        )}

        <div className="tabs">
          {[
            ["Resumen", "home"],
            ["Admision", "arrivals"],
            ["Medico", "medics"],
            ["Incidencias", "incidents"],
            ["Auditoria", "audit"],
          ].filter(([, viewId]) => canAccessItem(viewId)).map(([tab, viewId]) => (
            <button
              className={activeView === viewId || (tab === "Resumen" && activeView === "home") ? "selected" : ""}
              key={tab}
              onClick={() => selectView(viewId)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {activeView === "home" && (
          <div className="dashboard-grid">
            <section className="kpi-overview">
              {kpiCards.map((card) => (
                <article className="kpi-card" key={card.label}>
                  <div className="kpi-icon"><Icon name={card.icon} size={25} /></div>
                  <div>
                    <span>{card.label}</span>
                    <strong>{card.value}<small>{card.suffix || ""}</small></strong>
                    <p>{card.sub}</p>
                  </div>
                  <em>{card.trend}</em>
                </article>
              ))}
            </section>

            <div className="left-stack">
              <section className="main-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Flujo de atencion en tiempo real</h2>
                    <p>{formatSpecialty(selectedSpecialty)} | admision, cola, atencion y validacion.</p>
                  </div>
                  <span>Actualizado: {now.toLocaleTimeString()}</span>
                  <Icon name="refresh" size={18} />
                </div>

                <div className="flow-grid">
                  {flowCards.map((card, index) => (
                    <article className="flow-card" key={card.id}>
                      <div className="flow-head">
                        <span>{index + 1}</span>
                        <strong>{card.title}</strong>
                      </div>
                      <Icon name={card.icon} size={34} />
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
                      <button onClick={() => selectView(card.view)} type="button">
                        Ver {card.title.toLowerCase()} <Icon name="chevron" size={16} />
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="main-panel table-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Citas y cola de hoy</h2>
                    <p>Busqueda operativa por paciente, especialidad, fecha, hora y estado.</p>
                  </div>
                </div>

                <div className="module-toolbar rich-toolbar">
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
                  <div className="filter-grid">
                    <select value={queueStatus} onChange={(event) => setQueueStatus(event.target.value)}>
                      <option value="todos">Todos los estados</option>
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <option key={status} value={status}>{label}</option>
                      ))}
                    </select>
                    <input type="date" value={queueDate} onChange={(event) => setQueueDate(event.target.value)} />
                    <input type="time" value={queueTime} onChange={(event) => setQueueTime(event.target.value)} />
                    <div className="table-actions">
                      <Icon name="search" size={18} />
                      <input placeholder="Buscar paciente" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                  </div>
                </div>

                <QueueTable rows={filteredQueue.slice(0, 6)} totalRows={filteredQueue.length} onOpen={() => selectView("appointments")} />
              </section>
            </div>

            <aside className="right-stack">
              <DoctorsLiveMini rows={doctorRows} onOpen={() => selectView("medics")} />
              <IncidentPanel
                compact
                incidents={incidents}
                role={role}
                selectedSpecialty={selectedSpecialty}
                onChanged={loadDashboard}
              />
            </aside>

            <section className="bottom-widgets">
              <QuickActions onOpen={selectView} />
              <Panel title="Atenciones por especialidad (hoy)">
                <div className="mini-donut-row">
                  <MiniDonut total={statusCounts.total} />
                  <SpecialtyBars rows={serviceStats} total={statusCounts.total} />
                </div>
              </Panel>
              <Panel title="Tiempos promedio (hoy)">
                <Metric icon="clock" label="Espera en cola" value={`${averageWait} min`} compact />
                <Metric icon="clock" label="En atencion" value="23 min" compact />
                <Metric icon="clock" label="Total en sistema" value={`${averageWait + 23} min`} compact />
              </Panel>
              <QuickReports onOpen={() => selectView("reports")} />
            </section>
          </div>
        )}

        {activeView === "registerPatient" && (
          <PatientForm
            onPatientCreated={() => {
              setPatientRefreshKey((value) => value + 1);
              selectView("patients");
            }}
          />
        )}

        {activeView === "patients" && <PatientList refreshKey={patientRefreshKey} />}

        {activeView === "createAppointment" && isAdminOrReception && (
          <AppointmentForm
            onAppointmentCreated={() => {
              setAppointmentRefreshKey((value) => value + 1);
              selectView("appointments");
            }}
          />
        )}

        {["appointments", "doctorAgenda", "attention", "arrivals", "queue", "history"].includes(activeView) && (
          <AppointmentList
            refreshKey={appointmentRefreshKey}
            selectedSpecialty={selectedSpecialty}
            view={activeView === "doctorAgenda" ? "appointments" : activeView}
            onChanged={() => setAppointmentRefreshKey((value) => value + 1)}
          />
        )}

        {activeView === "users" && <UserManagement />}

        {activeView === "medics" && <DoctorLiveStatus refreshKey={appointmentRefreshKey} />}

        {activeView === "reports" && (
          <ReportsPanel
            appointments={scopedAppointments}
            counts={statusCounts}
            attendedPercent={attendedPercent}
            selectedSpecialty={selectedSpecialty}
          />
        )}

        {activeView === "audit" && (
          <AuditPanel appointments={scopedAppointments} auditTrail={auditTrail} />
        )}

        {activeView === "settings" && (
          <SpecialtySettingsPanel
            selectedSpecialty={selectedSpecialty === "TODAS" ? "MEDICINA INTERNA" : selectedSpecialty}
            settings={settings}
            specialties={specialties}
            onChanged={loadDashboard}
          />
        )}

        {activeView === "incidents" && (
          <IncidentPanel
            incidents={incidents}
            role={role}
            selectedSpecialty={selectedSpecialty}
            onChanged={loadDashboard}
          />
        )}
      </section>

      <button className="chatbot-launcher" onClick={() => setChatOpen((value) => !value)} type="button">
        <Icon name="bot" />
      </button>

      {chatOpen && (
        <section className="chatbot-panel">
          <div className="chatbot-header">
            <div><strong>MEDIX IA local</strong><span>Solo contexto del sistema hospitalario</span></div>
            <button onClick={() => setChatOpen(false)} type="button">Cerrar</button>
          </div>
          <div className="chatbot-suggestions">
            {["Resumen de cola", "Medico libre para emergencia", "Abrir citas", "Incidencias abiertas"].map((item) => (
              <button key={item} onClick={() => askAssistant(item)} type="button">{item}</button>
            ))}
          </div>
          <div className="chatbot-messages">
            {chatMessages.map((message, index) => (
              <p className={`chat-${message.from}`} key={`${message.from}-${index}`}>{message.text}</p>
            ))}
          </div>
          <form onSubmit={handleChatSubmit}>
            <input
              placeholder="Pregunta por cola, medico, reporte..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
            />
            <button type="submit"><Icon name="chevron" size={18} /></button>
          </form>
        </section>
      )}
    </main>
  );
}

function NotificationPanel({ notifications, onClose, onOpenView }) {
  return (
    <section className="notification-panel">
      <div className="notification-panel-head">
        <div>
          <strong>Centro de alertas MEDIX</strong>
          <span>{notifications.length} avisos operativos</span>
        </div>
        <button onClick={onClose} type="button">Cerrar</button>
      </div>
      <div className="notification-list">
        {notifications.map((item) => (
          <article className={`notification-item tone-${item.tone}`} key={item.id}>
            <span><Icon name={item.icon} size={18} /></span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              {item.view && <button onClick={() => onOpenView(item.view)} type="button">{item.action}</button>}
            </div>
          </article>
        ))}
        {notifications.length === 0 && (
          <article className="notification-empty">
            <Icon name="check" size={22} />
            <strong>Sin alertas pendientes</strong>
            <p>La operacion hospitalaria esta estable para tu rol.</p>
          </article>
        )}
      </div>
    </section>
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

function DoctorsLiveMini({ rows, onOpen }) {
  return (
    <section className="side-panel live-doctors-panel">
      <div className="side-heading">
        <h3>Medicos en vivo</h3>
        <button onClick={onOpen} type="button">Ver todos</button>
      </div>
      <div className="mini-table">
        <div className="mini-table-head">
          <span>Medico</span>
          <span>Especialidad</span>
          <span>Estado</span>
          <span>En espera</span>
        </div>
        {rows.length > 0 ? rows.map((doctor) => (
          <div className="mini-table-row" key={doctor.id}>
            <span><i />{doctor.name}</span>
            <span>{formatSpecialty(doctor.specialty)}</span>
            <span className={`mini-status ${doctor.active ? "attending" : doctor.waiting ? "busy" : "free"}`}>
              {doctor.active ? "Atendiendo" : doctor.waiting ? "Ocupado" : "Libre"}
            </span>
            <strong>{doctor.waiting}</strong>
          </div>
        )) : (
          <div className="mini-table-empty">Sin medicos con citas en la especialidad.</div>
        )}
        <div className="mini-table-foot"><span>Actualizacion automatica</span><strong>Cada 2 min</strong></div>
      </div>
    </section>
  );
}

function QuickActions({ onOpen }) {
  const actions = [
    ["Nueva cita", "calendarPlus", "createAppointment", "teal"],
    ["Registrar llegada", "userCheck", "arrivals", "teal"],
    ["Iniciar atencion", "stethoscope", "attention", "teal"],
    ["Atender paciente", "medicalPlus", "queue", "teal"],
    ["Registrar incidente", "alertTriangle", "incidents", "danger"],
  ];

  return (
    <section className="side-panel quick-actions">
      <div className="side-heading"><h3>Acciones rapidas</h3></div>
      <div>
        {actions.map(([label, icon, view, tone]) => (
          <button className={`quick-action-${tone}`} key={label} onClick={() => onOpen(view)} type="button">
            <Icon name={icon} size={30} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MiniDonut({ total }) {
  return (
    <div className="mini-donut">
      <span>{total}</span>
      <small>Total</small>
    </div>
  );
}

function QuickReports({ onOpen }) {
  const rows = [
    ["Resumen de atenciones (hoy)", "Generado 08/07 10:20"],
    ["Atenciones por medico (hoy)", "Generado 08/07 10:20"],
    ["No asistencias (semana)", "Generado 08/07 10:20"],
  ];

  return (
    <section className="side-panel quick-reports">
      <div className="side-heading">
        <h3>Reportes rapidos</h3>
        <button onClick={onOpen} type="button">Ver todos</button>
      </div>
      {rows.map(([title, meta]) => (
        <div className="quick-report-row" key={title}>
          <Icon name="file" size={22} />
          <div><strong>{title}</strong><span>{meta}</span></div>
          <button onClick={onOpen} type="button">Ver</button>
          <button onClick={onOpen} type="button">Exportar</button>
        </div>
      ))}
    </section>
  );
}

function QueueTable({ rows, totalRows = rows.length, onOpen }) {
  const headers = ["Hora", "Paciente", "DNI", "Especialidad", "Medico", "Estado", "Motivo", "Acciones"];

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.hour}</td>
              <td>{row.patient}</td>
              <td>{row.dni}</td>
              <td>{row.specialty}</td>
              <td>{row.doctor}</td>
              <td><span className={`status status-${row.status}`}>{statusLabels[row.status] || row.status}</span></td>
              <td>{row.motivo}</td>
              <td>
                <div className="table-icon-actions">
                  <button onClick={onOpen} title="Ver cita" type="button"><Icon name="eye" size={16} /></button>
                  <button onClick={onOpen} title="Abrir historial" type="button"><Icon name="file" size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan="8" className="p-6 text-center text-slate-500">
                No hay registros con los filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="table-foot">Mostrando {rows.length} de {totalRows} resultados</p>
    </div>
  );
}

function SpecialtyBars({ rows, total }) {
  return (
    <div className="specialty-bars">
      {rows.map(([specialty, value], index) => (
        <div key={specialty}>
          <span><i style={{ "--legend-color": chartColors[index % chartColors.length] }} />{formatSpecialty(specialty)}</span>
          <strong>{value}</strong>
          <small>{percent(value, total)}%</small>
        </div>
      ))}
    </div>
  );
}

function ComplianceBars({ counts, percentValue }) {
  const rows = [
    ["Citas cumplidas", counts.atendida],
    ["En curso", counts.en_atencion + counts.llegado],
    ["Pendientes", counts.programada],
    ["No asistio", counts.no_presentado],
  ];

  return (
    <div className="compliance-panel">
      <strong>{percentValue}%</strong>
      <span>Cumplimiento</span>
      {rows.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div><i className="cyan" style={{ width: `${percent(value, counts.total)}%` }} /></div>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function ReportsPanel({ appointments, counts, attendedPercent, selectedSpecialty }) {
  const [period, setPeriod] = useState("semanal");
  const rows = [
    ["Especialidad", formatSpecialty(selectedSpecialty)],
    ["Periodo", period],
    ["Citas totales", counts.total],
    ["Programadas", counts.programada],
    ["Llegados", counts.llegado],
    ["En atencion", counts.en_atencion],
    ["Atendidas", counts.atendida],
    ["Canceladas", counts.cancelada],
    ["No asistio", counts.no_presentado],
    ["Cumplimiento", `${attendedPercent}%`],
  ];

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Reportes hospitalarios</h2>
          <p>Exportacion operativa para revisar por periodo, medico y especialidad.</p>
        </div>
        <div className="export-actions">
          <button onClick={() => downloadCsv(rows, appointments, period)} type="button"><Icon name="download" size={16} /> CSV para Excel</button>
          <button onClick={() => downloadJson({ rows, appointments }, period)} type="button"><Icon name="download" size={16} /> JSON</button>
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
          El reporte se arma con los datos vivos de citas, estado, medico, especialidad, prioridad y paciente.
          La descarga es manual para no generar documentos mientras se revisa localmente.
        </p>
      </div>
    </section>
  );
}

function IncidentPanel({ incidents, role, selectedSpecialty, onChanged, compact = false }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "media",
    attachments: [],
  });
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setDrafts(
      incidents.reduce((acc, incident) => {
        acc[incident.id] = { status: incident.status, decision: incident.decision || "" };
        return acc;
      }, {})
    );
  }, [incidents]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? Array.from(files).map((file) => file.name) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      await api.post("/incidents/", {
        ...form,
        specialty: selectedSpecialty === "TODAS" ? undefined : selectedSpecialty,
      });
      setForm({ title: "", description: "", priority: "media", attachments: [] });
      setMessage({ type: "success", text: "Incidencia enviada para revision." });
      onChanged?.();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "No se pudo enviar la incidencia." });
    }
  };

  const handleReview = async (incident) => {
    try {
      await api.patch(`/incidents/${incident.id}`, drafts[incident.id]);
      setMessage({ type: "success", text: "Decision de incidencia guardada." });
      onChanged?.();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "No se pudo revisar la incidencia." });
    }
  };

  return (
    <section className={compact ? "side-panel incident-panel" : "main-panel module-panel incident-panel"}>
      <div className="side-heading">
        <h3>{compact ? "Incidencias recientes" : "Bitacora operativa"}</h3>
        <span>{compact ? "Ver todas" : `${incidents.length} registros`}</span>
      </div>

      {message && (
        <div className={`inline-alert ${message.type}`}>
          <Icon name={message.type === "success" ? "check" : "alert"} size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {!compact && (
        <form className="incident-form" onSubmit={handleSubmit}>
          <input name="title" placeholder="Titulo de incidencia" value={form.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Explica el caso, paciente, modulo y evidencia disponible" value={form.description} onChange={handleChange} required />
          <div>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <label className="file-chip">
              <Icon name="paperclip" size={16} />
              Evidencias
              <input name="attachments" type="file" multiple onChange={handleChange} />
            </label>
            <button type="submit">Enviar</button>
          </div>
        </form>
      )}

      <div className={compact ? "incident-list compact-list" : "incident-list"}>
        {compact && incidents.length > 0 && (
          <div className="incident-table-head">
            <span>Incidencia</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span>Fecha</span>
          </div>
        )}
        {incidents.slice(0, compact ? 3 : 20).map((incident) => (
          compact ? (
            <article className="compact-incident-row" key={incident.id}>
              <strong>{incident.title}</strong>
              <span>{incident.priority === "alta" ? "No asistencias" : formatSpecialty(incident.specialty)}</span>
              <span className={`status incident-${incident.status}`}>{incident.status.replace("_", " ")}</span>
              <time>{new Date(incident.created_at).toLocaleDateString("es-PE")} {new Date(incident.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
            </article>
          ) : (
            <article key={incident.id}>
              <div>
                <strong>{incident.title}</strong>
                <span>{incident.reporterName} | {formatSpecialty(incident.specialty)} | {incident.priority}</span>
              </div>
              <p>{incident.description}</p>
              <div className="incident-meta">
                <span className={`status incident-${incident.status}`}>{incident.status.replace("_", " ")}</span>
                <span>{new Date(incident.created_at).toLocaleString()}</span>
              </div>
              {incident.attachments?.length > 0 && (
                <div className="attachment-row">
                  {incident.attachments.map((item) => <span key={item}><Icon name="file" size={14} /> {item}</span>)}
                </div>
              )}
              {role === "admin" ? (
                <div className="review-box">
                  <select
                    value={drafts[incident.id]?.status || incident.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [incident.id]: { ...(current[incident.id] || {}), status: event.target.value },
                      }))
                    }
                  >
                    <option value="enviada">Enviada</option>
                    <option value="en_revision">En revision</option>
                    <option value="revisada">Revisada</option>
                  </select>
                  <textarea
                    placeholder="Decision o respuesta del administrador"
                    value={drafts[incident.id]?.decision || ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [incident.id]: { ...(current[incident.id] || {}), decision: event.target.value },
                      }))
                    }
                  />
                  <button onClick={() => handleReview(incident)} type="button">Guardar decision</button>
                </div>
              ) : (
                incident.decision && <p className="decision-note">Decision: {incident.decision}</p>
              )}
            </article>
          )
        ))}
      </div>
    </section>
  );
}

function SpecialtySettingsPanel({ selectedSpecialty, specialties, settings, onChanged }) {
  const [specialty, setSpecialty] = useState(selectedSpecialty);
  const [form, setForm] = useState(settings[selectedSpecialty] || {});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setSpecialty(selectedSpecialty);
    setForm(settings[selectedSpecialty] || {});
  }, [selectedSpecialty, settings]);

  const handleSpecialty = (value) => {
    setSpecialty(value);
    setForm(settings[value] || {});
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      await api.patch("/config/specialties", {
        specialty,
        settings: {
          ...form,
          dailyLimit: Number(form.dailyLimit),
          slotMinutes: Number(form.slotMinutes || 20),
        },
      });
      setMessage({ type: "success", text: "Cupos y horarios actualizados." });
      onChanged?.();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "No se pudo guardar la configuracion." });
    }
  };

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Parametros por especialidad</h2>
          <p>El hospital define cupo diario, turno manana/tarde y duracion del slot.</p>
        </div>
      </div>
      {message && (
        <div className={`inline-alert ${message.type}`}>
          <Icon name={message.type === "success" ? "check" : "alert"} size={18} />
          <span>{message.text}</span>
        </div>
      )}
      <form className="appointment-form compact" onSubmit={handleSubmit}>
        <label>
          Especialidad
          <select value={specialty} onChange={(event) => handleSpecialty(event.target.value)}>
            {specialties.map((item) => <option key={item} value={item}>{formatSpecialty(item)}</option>)}
          </select>
        </label>
        <label>Cupo diario<input name="dailyLimit" type="number" min="1" value={form.dailyLimit || 12} onChange={handleChange} /></label>
        <label>Inicio manana<input name="morningStart" type="time" value={form.morningStart || "08:00"} onChange={handleChange} /></label>
        <label>Fin manana<input name="morningEnd" type="time" value={form.morningEnd || "12:00"} onChange={handleChange} /></label>
        <label>Inicio tarde<input name="afternoonStart" type="time" value={form.afternoonStart || "14:00"} onChange={handleChange} /></label>
        <label>Fin tarde<input name="afternoonEnd" type="time" value={form.afternoonEnd || "18:00"} onChange={handleChange} /></label>
        <label>Minutos por cita<input name="slotMinutes" type="number" min="5" value={form.slotMinutes || 20} onChange={handleChange} /></label>
        <button className="medix-button span-2" type="submit">Guardar parametros</button>
      </form>
    </section>
  );
}

function AuditPanel({ appointments, auditTrail }) {
  const appointmentRows = appointments.slice(0, 10).map((appointment) => ({
    id: `appointment-${appointment.id}`,
    date: appointment.fecha_hora,
    actor: appointment.doctor?.display_name || "Sistema",
    module: "Citas",
    event: `${appointment.patient?.dni || "-"} | ${appointment.motivo}`,
    status: appointment.estado,
  }));
  const auditRows = auditTrail.slice(0, 20).map((event) => ({
    id: `audit-${event.id}`,
    date: event.created_at,
    actor: event.actor,
    module: event.module,
    event: event.event,
    status: "auditado",
  }));
  const rows = [...auditRows, ...appointmentRows].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Auditoria y trazabilidad</h2>
          <p>Eventos de seguridad, admision, citas, usuarios e historias clinicas.</p>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Fecha</th><th>Actor</th><th>Modulo</th><th>Evento</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.date).toLocaleString()}</td>
                <td>{row.actor}</td>
                <td>{row.module}</td>
                <td>{row.event}</td>
                <td><span className={`status status-${row.status}`}>{row.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="5" className="p-6 text-center text-slate-500">Aun no hay eventos para auditar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function countPriority(appointments) {
  return appointments.filter((appointment) => ["preferente", "emergencia"].includes(appointment.priority)).length;
}

function percent(value, total) {
  if (!total) return value ? 100 : 0;
  return Math.max(value ? 5 : 0, Math.round((value / total) * 100));
}

function buildNotifications({ role, scopedAppointments, incidents, doctorRows, averageWait }) {
  const waiting = scopedAppointments.filter((appointment) => appointment.estado === "llegado");
  const emergency = scopedAppointments.filter(
    (appointment) => appointment.priority === "emergencia" && !["atendida", "cancelada", "no_presentado"].includes(appointment.estado)
  );
  const active = scopedAppointments.filter((appointment) => appointment.estado === "en_atencion");
  const freeDoctors = doctorRows.filter((doctor) => !doctor.active && doctor.waiting === 0);
  const openIncidents = incidents.filter((incident) => incident.status !== "revisada");
  const notifications = [];

  if (waiting.length) {
    notifications.push({
      id: "cola",
      title: `${waiting.length} paciente(s) en cola`,
      body: `Tiempo promedio estimado: ${averageWait} min. Revisa admision y consultorios.`,
      tone: "info",
      icon: "users",
      action: "Ver cola",
      view: role === "doctor" ? "attention" : "queue",
    });
  }

  if (emergency.length) {
    notifications.push({
      id: "emergencia",
      title: `${emergency.length} caso(s) de emergencia`,
      body: freeDoctors.length
        ? `${freeDoctors[0].name} aparece libre para apoyo inmediato.`
        : "No hay medico totalmente libre; revisa la cola por prioridad.",
      tone: "danger",
      icon: "alertTriangle",
      action: "Ver atenciones",
      view: "attention",
    });
  }

  if (active.length) {
    notifications.push({
      id: "atencion",
      title: `${active.length} atencion(es) en curso`,
      body: role === "doctor" ? "Puedes cerrar historia clinica desde Atenciones." : "Admin y recepcion pueden monitorear el avance en vivo.",
      tone: "success",
      icon: "stethoscope",
      action: "Abrir atenciones",
      view: "attention",
    });
  }

  if (openIncidents.length) {
    notifications.push({
      id: "incidencias",
      title: `${openIncidents.length} incidencia(s) abiertas`,
      body: "Hay observaciones operativas pendientes de revision o cierre.",
      tone: "warning",
      icon: "notification",
      action: "Revisar incidencias",
      view: "incidents",
    });
  }

  return notifications.slice(0, 5);
}

function buildChatResponse(question, context) {
  const text = normalizeText(question);
  const specialty = formatSpecialty(context.selectedSpecialty);
  const freeDoctors = context.doctors.filter((doctor) => !doctor.active && doctor.waiting === 0);
  const emergencyAppointments = context.appointments.filter(
    (appointment) => appointment.priority === "emergencia" && !["atendida", "cancelada", "no_presentado"].includes(appointment.estado)
  );

  if (text.includes("abrir") || text.includes("ir a") || text.includes("ver ")) {
    if (text.includes("cita")) return { text: "Abriendo Citas. Ahi puedes filtrar, reprogramar y revisar estados.", view: "appointments" };
    if (text.includes("cola")) return { text: "Abriendo Cola. Veras pacientes llegados y pendientes de atencion.", view: "queue" };
    if (text.includes("paciente")) return { text: "Abriendo Pacientes para registrar, editar o revisar historial.", view: "patients" };
    if (text.includes("incidencia")) return { text: "Abriendo Incidencias para registrar, revisar o cerrar observaciones.", view: "incidents" };
    if (text.includes("reporte")) return { text: "Abriendo Reportes con exportacion CSV/JSON.", view: "reports" };
  }

  if (text.includes("cola") || text.includes("espera")) {
    return {
      text: `${specialty}: hay ${context.counts.llegado} paciente(s) en cola. Tiempo promedio: ${context.averageWait} min. ${
        context.counts.llegado > 0 ? "Prioriza llegados y casos preferentes." : "No hay cola activa ahora."
      }`,
      view: context.counts.llegado ? "queue" : null,
    };
  }
  if (text.includes("medico") || text.includes("doctor") || text.includes("emergencia") || text.includes("libre")) {
    const freeText = freeDoctors.length
      ? freeDoctors.slice(0, 3).map((doctor) => `${doctor.name} (${formatSpecialty(doctor.specialty)})`).join(", ")
      : "no hay medicos totalmente libres en este filtro";
    return {
      text: `${specialty}: ${freeText}. Emergencias abiertas: ${emergencyAppointments.length}. Para asignar una cita urgente, usa Programar cita y prioridad Emergencia.`,
      view: "createAppointment",
    };
  }
  if (text.includes("incidencia") || text.includes("bitacora")) {
    return {
      text: `Hay ${context.incidents.length} incidencia(s) visibles para tu rol. Admin puede moverlas a revision o revisada; recepcion/medico pueden reportar nuevas.`,
      view: "incidents",
    };
  }
  if (text.includes("reporte") || text.includes("excel")) {
    return {
      text: `Cumplimiento actual: ${context.attendedPercent}%. En Reportes puedes exportar CSV para Excel o JSON con trazabilidad de atenciones.`,
      view: "reports",
    };
  }
  if (text.includes("cita") || text.includes("programar")) {
    return {
      text: "Para programar: elige especialidad, paciente, fecha, hora y prioridad. MEDIX muestra medicos libres y bloquea choque de horario.",
      view: "createAppointment",
    };
  }
  if (text.includes("dni") || text.includes("telefono") || text.includes("celular")) {
    return {
      text: "Regla de datos MEDIX: DNI = 8 digitos. Telefono/Celular = 9 digitos. Solo se aceptan numeros.",
      view: null,
    };
  }
  if (text.includes("seguridad") || text.includes("trazabilidad")) {
    return {
      text: `Tu rol actual es ${context.role}. La trazabilidad registra cambios de citas, pacientes, usuarios e incidencias para auditoria.`,
      view: context.role === "admin" ? "audit" : null,
    };
  }
  return {
    text: "Solo puedo responder sobre MEDIX: citas, cola, pacientes, medicos, incidencias, reportes, seguridad y trazabilidad. Preguntame por una de esas areas.",
    view: null,
  };
}

function downloadCsv(rows, appointments, period) {
  const summary = rows.map(([label, value]) => `"${label}","${value}"`).join("\n");
  const detailHeader = "Fecha,Paciente,DNI,Especialidad,Medico,Consultorio,Estado,Prioridad,Motivo";
  const detail = appointments.map((appointment) => [
    new Date(appointment.fecha_hora).toLocaleString(),
    appointment.patient ? `${appointment.patient.nombres} ${appointment.patient.apellidos}` : "",
    appointment.patient?.dni || "",
    appointment.specialty,
    appointment.doctor?.display_name || "",
    appointment.consultorio || "",
    appointment.estado,
    appointment.priority || "",
    appointment.motivo || "",
  ].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadBlob(`MEDIX resumen\n${summary}\n\nDetalle\n${detailHeader}\n${detail}`, `medix-reporte-${period}.csv`, "text/csv;charset=utf-8");
}

function downloadJson(payload, period) {
  downloadBlob(JSON.stringify(payload, null, 2), `medix-reporte-${period}.json`, "application/json");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

export default Dashboard;
