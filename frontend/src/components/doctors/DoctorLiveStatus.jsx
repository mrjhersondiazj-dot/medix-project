import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import authService from "../../services/authService";
import Icon from "../ui/Icon";

function DoctorLiveStatus({ refreshKey = 0 }) {
  const role = authService.getRole();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appointmentsResponse = await api.get("/appointments/");
        setAppointments(appointmentsResponse.data);

        if (role === "admin" || role === "recepcionista") {
          const doctorsResponse = await api.get("/users/doctors");
          setDoctors(doctorsResponse.data);
        } else {
          const meResponse = await api.get("/users/me");
          setDoctors([meResponse.data]);
        }
      } catch (error) {
        alert(error.response?.data?.detail || "No se pudo cargar el horario medico.");
      }
    };

    loadData();
  }, [refreshKey, role]);

  const rows = useMemo(() => {
    return doctors.map((doctor) => {
      const doctorAppointments = appointments.filter((appointment) => appointment.doctor?.id === doctor.id);
      const current = doctorAppointments.find((appointment) => appointment.estado === "en_atencion");
      const waiting = doctorAppointments.filter((appointment) => ["programada", "llegado"].includes(appointment.estado));
      const attended = doctorAppointments.filter((appointment) => appointment.estado === "atendida");
      const status = current ? "Atendiendo" : waiting.length > 0 ? "Ocupado" : "Libre";

      return {
        ...doctor,
        name: doctor.nombres && doctor.apellidos ? `${doctor.nombres} ${doctor.apellidos}` : doctor.display_name || `DNI ${doctor.dni}`,
        status,
        current,
        waiting: waiting.length,
        attended: attended.length,
      };
    });
  }, [appointments, doctors]);

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
              <p>DNI {doctor.dni}</p>
            </div>
            <span className={`doctor-state state-${doctor.status.toLowerCase()}`}>{doctor.status}</span>
            <dl>
              <div><dt>En espera</dt><dd>{doctor.waiting}</dd></div>
              <div><dt>Atendidas</dt><dd>{doctor.attended}</dd></div>
              <div><dt>Actual</dt><dd>{doctor.current?.patient?.dni || "-"}</dd></div>
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

export default DoctorLiveStatus;
