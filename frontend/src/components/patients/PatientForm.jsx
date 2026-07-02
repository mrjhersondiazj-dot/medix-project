import { useState } from "react";

import api from "../../services/api";

const initialForm = {
  nombres: "",
  apellidos: "",
  dni: "",
  fecha_nacimiento: "",
  telefono: "",
  direccion: "",
};

function PatientForm({ onPatientCreated }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: name === "dni" ? value.replace(/\D/g, "").slice(0, 8) : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/patients/", {
        ...form,
        fecha_nacimiento: form.fecha_nacimiento || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
      });

      alert("Paciente registrado correctamente.");
      setForm(initialForm);
      onPatientCreated?.();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo registrar el paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Registrar paciente</h2>
          <p>Datos administrativos basicos para admision hospitalaria.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="nombres" className="medix-input" placeholder="Nombres" value={form.nombres} onChange={handleChange} required />
        <input name="apellidos" className="medix-input" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
        <input name="dni" className="medix-input" placeholder="DNI" value={form.dni} onChange={handleChange} minLength={8} maxLength={8} required />
        <input name="fecha_nacimiento" type="date" className="medix-input" value={form.fecha_nacimiento} onChange={handleChange} />
        <input name="telefono" className="medix-input" placeholder="Telefono" value={form.telefono} onChange={handleChange} />
        <input name="direccion" className="medix-input md:col-span-2" placeholder="Direccion" value={form.direccion} onChange={handleChange} />

        <button type="submit" className="medix-button md:col-span-2" disabled={loading}>
          {loading ? "Registrando..." : "Registrar paciente"}
        </button>
      </form>
    </section>
  );
}

export default PatientForm;
