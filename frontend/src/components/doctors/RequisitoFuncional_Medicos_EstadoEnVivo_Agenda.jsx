/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Medicos_EstadoEnVivo_Agenda.jsx
 * Proposito: Medicos en vivo: muestra disponibilidad, pacientes en espera y citas atendidas por medico.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { useEffect, useMemo, useState } from "react";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { formatSpecialty } from "../../data/RequisitoFuncional_Reportes_DatosDemoIndicadores";
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";
import authService from "../../services/RequisitoFuncional_Login_AutenticacionRolesSesion";
// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import Icon from "../ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";

// Explicacion: Define un componente o funcion reutilizable del sistema.
function DoctorLiveStatus({ refreshKey = 0 }) {
  const role = authService.getRole();
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Explicacion: Ejecuta una accion automatica cuando el componente carga o cambian sus dependencias.
  useEffect(() => {
    const loadData = async () => {
      // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
      try {
        const meResponse = await api.get("/users/me");
        if (role === "admin" || role === "recepcionista") {
          const [appointmentsResponse, doctorsResponse] = await Promise.all([
            api.get("/appointments/"),
            api.get("/users/doctors"),
          ]);
          setAppointments(appointmentsResponse.data);
          setDoctors(doctorsResponse.data);
        } else {
          const appointmentsResponse = await api.get(`/appointments/doctor/${meResponse.data.id}`);
          setAppointments(appointmentsResponse.data);
          setDoctors([meResponse.data]);
        }
      } catch (error) {
        alert(error.response?.data?.detail || "No se pudo cargar el horario medico.");
      }
    };

    loadData();
  }, [refreshKey, role]);

  // Explicacion: Calcula un valor derivado y lo memoriza para mejorar rendimiento.
  const rows = useMemo(() => {
    return doctors.map((doctor) => {
      // Explicacion: Define una funcion o constante usada en la logica del modulo.
      const doctorAppointments = appointments.filter((appointment) => appointment.doctor?.id === doctor.id);
      const current = doctorAppointments.find((appointment) => appointment.estado === "en_atencion");
      // Explicacion: Define una funcion o constante usada en la logica del modulo.
      const waiting = doctorAppointments.filter((appointment) => ["programada", "llegado"].includes(appointment.estado));
      const attended = doctorAppointments.filter((appointment) => appointment.estado === "atendida");
      const nextAppointment = waiting
        .slice()
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))[0];
      const status = current ? "Atendiendo" : waiting.length > 0 ? "Ocupado" : "Libre";

      // Explicacion: Devuelve el resultado calculado por la funcion.
      return {
        ...doctor,
        name: doctor.nombres && doctor.apellidos ? `${doctor.nombres} ${doctor.apellidos}` : doctor.display_name || `DNI ${doctor.dni}`,
        status,
        current,
        nextAppointment,
        waiting: waiting.length,
        attended: attended.length,
      };
    });
  }, [appointments, doctors]);

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Horario de atencion en vivo</h2>
          <p>Estado operativo de cada medico: libre, ocupado o atendiendo.</p>
        </div>
        <span>Actualizacion automatica cada 2 min</span>
      </div>

      <div className="doctor-grid">
        {rows.map((doctor) => (
          <article className="doctor-card" key={doctor.id}>
            <div className="doctor-avatar"><Icon name="stethoscope" /></div>
            <div>
              <h3>{doctor.name}</h3>
              <p>DNI {doctor.dni} | {formatSpecialty(doctor.specialty)}</p>
            </div>
            <span className={`doctor-state state-${doctor.status.toLowerCase()}`}>{doctor.status}</span>
            <p className="doctor-specialty-line">
              Turno: {doctor.shift || "no definido"} | {doctor.status === "Libre" ? "Disponible para emergencia" : "Agenda activa"}
            </p>
            <dl>
              <div><dt>En espera</dt><dd>{doctor.waiting}</dd></div>
              <div><dt>Atendidas</dt><dd>{doctor.attended}</dd></div>
              <div><dt>Actual</dt><dd>{doctor.current?.patient?.dni || "-"}</dd></div>
              <div><dt>Siguiente</dt><dd>{doctor.nextAppointment ? new Date(doctor.nextAppointment.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</dd></div>
              <div><dt>Consultorio</dt><dd>{doctor.current?.consultorio || doctor.nextAppointment?.consultorio || "-"}</dd></div>
              <div><dt>Paciente actual</dt><dd>{doctor.current?.patient ? `${doctor.current.patient.apellidos}` : "Libre"}</dd></div>
            </dl>
          </article>
        ))}

        {rows.length === 0 && (
          <div className="empty-state compact">
            <Icon name="stethoscope" />
            <h2>No hay medicos registrados</h2>
            <p>El administrador puede crear medicos desde Usuarios.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default DoctorLiveStatus;
