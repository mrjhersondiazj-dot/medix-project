/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Pacientes_RegistroAdmision.jsx
 * Proposito: Registro de pacientes: captura datos basicos para admision hospitalaria.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { useState } from "react";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";
import Icon from "../ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";

const initialForm = {
  nombres: "",
  apellidos: "",
  dni: "",
  fecha_nacimiento: "",
  telefono: "",
  direccion: "",
  prioridad: "normal",
};

// Explicacion: Define un componente o funcion reutilizable del sistema.
function PatientForm({ onPatientCreated }) {
  const [form, setForm] = useState(initialForm);
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleChange = (event) => {
    const { name, value } = event.target;
    const numericValue = value.replace(/\D/g, "");
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setForm({
      ...form,
      [name]:
        name === "dni"
          ? numericValue.slice(0, 8)
          : name === "telefono"
            ? numericValue.slice(0, 9)
            : value,
    });
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    if (form.dni.length !== 8) {
      setMessage({ type: "error", text: "El DNI debe tener exactamente 8 digitos." });
      return;
    }
    if (form.telefono && form.telefono.length !== 9) {
      setMessage({ type: "error", text: "El telefono debe tener exactamente 9 digitos." });
      return;
    }
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setLoading(true);

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.post("/patients/", {
        ...form,
        fecha_nacimiento: form.fecha_nacimiento || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        prioridad: form.prioridad,
      });

      setMessage({ type: "success", text: "Paciente registrado correctamente y listo para programar cita." });
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setForm(initialForm);
      onPatientCreated?.();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "No se pudo registrar el paciente." });
    } finally {
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setLoading(false);
    }
  };

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Registrar paciente</h2>
          <p>Datos administrativos basicos para admision hospitalaria.</p>
        </div>
      </div>

      {message && (
        <div className={`inline-alert ${message.type}`}>
          <Icon name={message.type === "success" ? "check" : "alert"} size={18} />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="nombres" className="medix-input" placeholder="Nombres" value={form.nombres} onChange={handleChange} required />
        <input name="apellidos" className="medix-input" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
        <input name="dni" className="medix-input" placeholder="DNI" value={form.dni} onChange={handleChange} inputMode="numeric" pattern="\d{8}" minLength={8} maxLength={8} required />
        <input name="fecha_nacimiento" type="date" className="medix-input" value={form.fecha_nacimiento} onChange={handleChange} />
        <input name="telefono" className="medix-input" placeholder="Telefono" value={form.telefono} onChange={handleChange} inputMode="numeric" pattern="\d{9}" maxLength={9} />
        <select name="prioridad" className="medix-input" value={form.prioridad} onChange={handleChange}>
          <option value="normal">Prioridad normal</option>
          <option value="preferente">Preferente</option>
          <option value="emergencia">Emergencia</option>
        </select>
        <input name="direccion" className="medix-input md:col-span-2" placeholder="Direccion" value={form.direccion} onChange={handleChange} />

        <button type="submit" className="medix-button md:col-span-2" disabled={loading}>
          {loading ? "Registrando..." : "Registrar paciente"}
        </button>
      </form>
    </section>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default PatientForm;
