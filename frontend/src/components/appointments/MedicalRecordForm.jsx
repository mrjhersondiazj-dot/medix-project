import { useState } from "react";

import api from "../../services/api";

function MedicalRecordForm({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    sintomas: "",
    diagnostico: "",
    tratamiento_recetado: "",
  });
  const [loading, setLoading] = useState(false);

  const patientName = appointment.patient
    ? `${appointment.patient.nombres} ${appointment.patient.apellidos}`
    : "Paciente";

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/medical-records/", {
        appointment_id: appointment.id,
        sintomas: form.sintomas,
        diagnostico: form.diagnostico,
        tratamiento_recetado: form.tratamiento_recetado,
      });

      alert("Atencion registrada correctamente.");
      onSaved?.();
      onClose?.();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo registrar la atencion medica.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900">Atencion medica</h2>
        <p className="mt-2 text-slate-600">Paciente: <strong>{patientName}</strong></p>
        <p className="mt-1 text-sm text-slate-500">Motivo: {appointment.motivo}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea name="sintomas" className="medix-input" placeholder="Sintomas" value={form.sintomas} onChange={handleChange} required />
          <textarea name="diagnostico" className="medix-input" placeholder="Diagnostico" value={form.diagnostico} onChange={handleChange} required />
          <textarea name="tratamiento_recetado" className="medix-input" placeholder="Tratamiento recetado" value={form.tratamiento_recetado} onChange={handleChange} required />

          <div className="flex gap-3">
            <button type="submit" className="medix-button" disabled={loading}>
              {loading ? "Guardando..." : "Guardar atencion"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2 font-bold">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicalRecordForm;
