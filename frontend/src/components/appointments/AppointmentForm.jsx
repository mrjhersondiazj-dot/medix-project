import { useEffect, useState } from "react";

import api from "../../services/api";

const initialForm = {
  patient_id: "",
  doctor_id: "",
  fecha_hora: "",
  motivo: "",
};

function AppointmentForm({ onAppointmentCreated }) {
  const [form, setForm] = useState(initialForm);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        api.get("/patients/"),
        api.get("/users/doctors"),
      ]);

      setPatients(patientsResponse.data);
      setDoctors(doctorsResponse.data);
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudieron cargar pacientes o medicos.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/appointments/", form);
      alert("Cita medica registrada correctamente.");
      setForm(initialForm);
      onAppointmentCreated?.();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo registrar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Programar cita medica</h2>
          <p>Asigna paciente, medico, fecha, hora y motivo de atencion.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <select name="patient_id" className="medix-input" value={form.patient_id} onChange={handleChange} required>
          <option value="">Seleccionar paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.apellidos}, {patient.nombres} - DNI {patient.dni}
            </option>
          ))}
        </select>

        <select name="doctor_id" className="medix-input" value={form.doctor_id} onChange={handleChange} required>
          <option value="">Seleccionar medico</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.display_name} - Codigo/CMP {doctor.codigo}
            </option>
          ))}
        </select>

        <input type="datetime-local" name="fecha_hora" className="medix-input" value={form.fecha_hora} onChange={handleChange} required />
        <textarea name="motivo" className="medix-input md:col-span-2" placeholder="Motivo de la cita" value={form.motivo} onChange={handleChange} required />

        <button type="submit" className="medix-button md:col-span-2" disabled={loading}>
          {loading ? "Registrando..." : "Programar cita"}
        </button>
      </form>
    </section>
  );
}

export default AppointmentForm;
