/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_HistoriaClinica_RegistroAtencionMedica.jsx
 * Proposito: Registro medico: permite al medico guardar sintomas, diagnostico y tratamiento del paciente.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { useState } from "react";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";

// Explicacion: Define un componente o funcion reutilizable del sistema.
function MedicalRecordForm({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    sintomas: "",
    diagnostico: "",
    tratamiento_recetado: "",
    patient_feedback: "",
  });
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [loading, setLoading] = useState(false);

  const patientName = appointment.patient
    ? `${appointment.patient.nombres} ${appointment.patient.apellidos}`
    : "Paciente";

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setLoading(true);

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.post("/medical-records/", {
        appointment_id: appointment.id,
        sintomas: form.sintomas,
        diagnostico: form.diagnostico,
        tratamiento_recetado: form.tratamiento_recetado,
        patient_feedback: form.patient_feedback,
      });

      alert("Atencion registrada correctamente.");
      onSaved?.();
      onClose?.();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo registrar la atencion medica.");
    } finally {
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setLoading(false);
    }
  };

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
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
          <textarea name="patient_feedback" className="medix-input" placeholder="Feedback del paciente u observacion de cierre" value={form.patient_feedback} onChange={handleChange} />

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

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default MedicalRecordForm;
