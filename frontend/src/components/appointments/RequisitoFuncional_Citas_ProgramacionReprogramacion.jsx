/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Citas_ProgramacionReprogramacion.jsx
 * Proposito: Formulario de citas: programa una cita por especialidad, medico, cupo disponible y horario valido.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

import { useEffect, useMemo, useState } from "react";

import { formatSpecialty } from "../../data/RequisitoFuncional_Reportes_DatosDemoIndicadores";
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";
import Icon from "../ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";

const todayValue = () => new Date().toISOString().slice(0, 10);
const dateKey = (value) => new Date(value).toISOString().slice(0, 10);
const timeKey = (value) => new Date(value).toTimeString().slice(0, 5);

const initialForm = {
  patient_id: "",
  doctor_id: "",
  specialty: "MEDICINA INTERNA",
  date: todayValue(),
  time: "10:30",
  consultorio: "MI-01",
  priority: "normal",
  motivo: "",
};

function AppointmentForm({ onAppointmentCreated }) {
  const [form, setForm] = useState(initialForm);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedDoctors = useMemo(() => doctors.filter((doctor) => doctor.specialty === form.specialty), [doctors, form.specialty]);

  const doctorAvailability = useMemo(() => {
    return selectedDoctors.map((doctor) => {
      const dayAppointments = appointments.filter(
        (appointment) =>
          String(appointment.doctor?.id || appointment.doctor_id) === String(doctor.id) &&
          dateKey(appointment.fecha_hora) === form.date &&
          !["cancelada", "no_presentado"].includes(appointment.estado)
      );
      const sameSlot = dayAppointments.find((appointment) => timeKey(appointment.fecha_hora) === form.time);
      const current = dayAppointments.find((appointment) => appointment.estado === "en_atencion");
      const waiting = dayAppointments.filter((appointment) => ["programada", "llegado"].includes(appointment.estado)).length;
      const free = !sameSlot && !current;

      return {
        ...doctor,
        dayLoad: dayAppointments.length,
        waiting,
        free,
        sameSlot,
        current,
        status: sameSlot ? "Ocupado a esa hora" : current ? "Atendiendo" : "Libre",
      };
    });
  }, [appointments, form.date, form.time, selectedDoctors]);

  const selectedDoctor = doctorAvailability.find((doctor) => String(doctor.id) === String(form.doctor_id));
  const freeDoctors = doctorAvailability.filter((doctor) => doctor.free);
  const firstFreeDoctorId = freeDoctors[0]?.id;

  const loadBaseData = async () => {
    try {
      const [patientsResponse, doctorsResponse, configResponse, appointmentsResponse] = await Promise.all([
        api.get("/patients/"),
        api.get("/users/doctors"),
        api.get("/config/specialties"),
        api.get("/appointments/"),
      ]);

      setPatients(patientsResponse.data);
      setDoctors(doctorsResponse.data);
      setSpecialties(configResponse.data.specialties || []);
      setAppointments(appointmentsResponse.data || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "No se pudieron cargar pacientes, medicos o especialidades.",
      });
    }
  };

  const loadAvailability = async () => {
    try {
      const response = await api.get(
        `/availability?specialty=${encodeURIComponent(form.specialty)}&date=${encodeURIComponent(form.date)}`
      );
      setAvailability(response.data);
    } catch {
      setAvailability(null);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [form.specialty, form.date]);

  useEffect(() => {
    if (form.doctor_id && !selectedDoctor) {
      setForm((current) => ({ ...current, doctor_id: "" }));
    }
  }, [form.doctor_id, selectedDoctor]);

  useEffect(() => {
    if (form.doctor_id && selectedDoctor?.sameSlot) {
      setForm((current) => ({ ...current, doctor_id: "" }));
      setMessage({ type: "error", text: "Ese medico ya tiene una cita en la misma hora. Selecciona uno libre." });
    }
  }, [form.doctor_id, selectedDoctor]);

  useEffect(() => {
    if (!form.doctor_id && firstFreeDoctorId) {
      setForm((current) => ({ ...current, doctor_id: String(firstFreeDoctorId) }));
    }
  }, [firstFreeDoctorId, form.doctor_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "specialty" ? { doctor_id: "", consultorio: `${value.slice(0, 3)}-01` } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post("/appointments/", {
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        specialty: form.specialty,
        fecha_hora: `${form.date}T${form.time}`,
        consultorio: form.consultorio,
        priority: form.priority,
        motivo: form.motivo,
      });
      const appointmentsResponse = await api.get("/appointments/");
      setAppointments(appointmentsResponse.data || []);

      setMessage({
        type: "success",
        text: "Cita registrada correctamente y agregada a la agenda de la especialidad.",
      });
      setForm({ ...initialForm, specialty: form.specialty, date: form.date });
      await loadAvailability();
      onAppointmentCreated?.();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.detail ||
          "No se pudo registrar la cita. Revisa horario, medico, especialidad y cupos disponibles.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Programar cita medica</h2>
          <p>Agenda por especialidad con control de cupos, turno y choque de horario.</p>
        </div>
        <span>{availability ? `${availability.available} cupos libres` : "Cupos por validar"}</span>
      </div>

      {message && (
        <div className={`inline-alert ${message.type}`}>
          <Icon name={message.type === "success" ? "check" : "alert"} size={18} />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="appointment-form">
        <label>
          Especialidad
          <select name="specialty" value={form.specialty} onChange={handleChange} required>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {formatSpecialty(specialty)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Paciente
          <select name="patient_id" value={form.patient_id} onChange={handleChange} required>
            <option value="">Seleccionar paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.apellidos}, {patient.nombres} - DNI {patient.dni}
              </option>
            ))}
          </select>
        </label>

        <label>
          Medico asignado
          <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required>
            <option value="">Seleccionar medico</option>
            {doctorAvailability.map((doctor) => (
              <option key={doctor.id} value={doctor.id} disabled={!!doctor.sameSlot}>
                {doctor.display_name} - {doctor.codigo} - {doctor.status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </label>

        <label>
          Hora
          <input name="time" type="time" value={form.time} onChange={handleChange} required />
        </label>

        <label>
          Consultorio
          <input name="consultorio" value={form.consultorio} onChange={handleChange} required />
        </label>

        <label>
          Prioridad
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="normal">Normal</option>
            <option value="preferente">Preferente</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </label>

        <label className="span-2">
          Motivo de la cita
          <textarea name="motivo" value={form.motivo} onChange={handleChange} required />
        </label>

        <aside className="availability-card">
          <div>
            <Icon name="calendar" />
            <strong>{formatSpecialty(form.specialty)}</strong>
            <span>{form.date}</span>
          </div>
          <dl>
            <div><dt>Cupo diario</dt><dd>{availability?.dailyLimit ?? "-"}</dd></div>
            <div><dt>Usados</dt><dd>{availability?.used ?? "-"}</dd></div>
            <div><dt>Disponibles</dt><dd>{availability?.available ?? "-"}</dd></div>
            <div><dt>Medicos</dt><dd>{selectedDoctors.length}</dd></div>
          </dl>
          <p>
            Horario permitido:
            {" "}
            {availability
              ? `${availability.settings.morningStart}-${availability.settings.morningEnd} / ${availability.settings.afternoonStart}-${availability.settings.afternoonEnd}`
              : "pendiente"}
          </p>
        </aside>

        <aside className="availability-card doctor-availability-card span-2">
          <div>
            <Icon name={form.priority === "emergencia" ? "alertTriangle" : "stethoscope"} />
            <strong>{form.priority === "emergencia" ? "Ruta rapida de emergencia" : "Medicos disponibles"}</strong>
            <span>{freeDoctors.length} libres para {form.time}</span>
          </div>
          <div className="doctor-availability-list">
            {doctorAvailability.map((doctor) => (
              <button
                className={String(form.doctor_id) === String(doctor.id) ? "selected" : ""}
                disabled={!!doctor.sameSlot}
                key={doctor.id}
                onClick={() => setForm((current) => ({ ...current, doctor_id: String(doctor.id) }))}
                type="button"
              >
                <span className={`live-dot ${doctor.free ? "free" : doctor.current ? "busy" : "warning"}`} />
                <strong>{doctor.display_name}</strong>
                <small>{formatSpecialty(doctor.specialty)} | {doctor.status}</small>
                <em>{doctor.waiting} en cola / {doctor.dayLoad} hoy</em>
              </button>
            ))}
            {doctorAvailability.length === 0 && <p>No hay medicos registrados para esta especialidad.</p>}
          </div>
        </aside>

        <button type="submit" className="medix-button span-2" disabled={loading || !selectedDoctors.length || !selectedDoctor || !!selectedDoctor.sameSlot}>
          {loading ? "Programando..." : "Programar cita"}
        </button>
      </form>
    </section>
  );
}

export default AppointmentForm;
