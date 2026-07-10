/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Pacientes_GestionEdicionBusqueda.jsx
 * Proposito: Gestion de pacientes: lista, busca, edita, elimina y abre historial clinico.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { useEffect, useMemo, useState } from "react";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";
import Icon from "../ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";
// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import PatientHistoryModal from "./RequisitoFuncional_Pacientes_HistorialClinico";

// Explicacion: Define un componente o funcion reutilizable del sistema.
function PatientList({ refreshKey }) {
  const [patients, setPatients] = useState([]);
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [historyPatient, setHistoryPatient] = useState(null);

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const loadPatients = async () => {
    try {
      const response = await api.get("/patients/");
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setPatients(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo cargar la lista.");
    }
  };

  // Explicacion: Ejecuta una accion automatica cuando el componente carga o cambian sus dependencias.
  useEffect(() => {
    loadPatients();
  }, [refreshKey]);

  // Explicacion: Calcula un valor derivado y lo memoriza para mejorar rendimiento.
  const filteredPatients = useMemo(() => {
    const value = search.toLowerCase();
    // Explicacion: Devuelve el resultado calculado por la funcion.
    return patients.filter((patient) =>
      `${patient.apellidos} ${patient.nombres} ${patient.dni}`.toLowerCase().includes(value)
    );
  }, [patients, search]);

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleDelete = async (patientId) => {
    if (!confirm("Seguro que deseas eliminar este paciente?")) return;

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.delete(`/patients/${patientId}`);
      alert("Paciente eliminado correctamente.");
      loadPatients();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo eliminar el paciente.");
    }
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    const numericValue = value.replace(/\D/g, "");
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setEditingPatient({
      ...editingPatient,
      [name]:
        name === "dni"
          ? numericValue.slice(0, 8)
          : name === "telefono"
            ? numericValue.slice(0, 9)
            : value,
    });
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleUpdate = async (event) => {
    event.preventDefault();
    if (editingPatient.dni.length !== 8) {
      alert("El DNI debe tener exactamente 8 digitos.");
      return;
    }
    if (editingPatient.telefono && editingPatient.telefono.length !== 9) {
      alert("El telefono debe tener exactamente 9 digitos.");
      return;
    }

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.patch(`/patients/${editingPatient.id}`, {
        nombres: editingPatient.nombres,
        apellidos: editingPatient.apellidos,
        dni: editingPatient.dni,
        fecha_nacimiento: editingPatient.fecha_nacimiento || null,
        telefono: editingPatient.telefono || null,
        direccion: editingPatient.direccion || null,
        prioridad: editingPatient.prioridad || "normal",
      });

      alert("Paciente actualizado correctamente.");
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo actualizar el paciente.");
    }
  };

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Lista de pacientes</h2>
          <p>Pacientes registrados, historial clinico y datos de admision.</p>
        </div>
        <div className="table-actions">
          <Icon name="search" size={18} />
          <input placeholder="Buscar paciente o DNI" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Nacimiento</th>
              <th>Telefono</th>
              <th>Prioridad</th>
              <th>Direccion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.dni}</td>
                <td>{patient.nombres}</td>
                <td>{patient.apellidos}</td>
                <td>{patient.fecha_nacimiento || "-"}</td>
                <td>{patient.telefono || "-"}</td>
                <td><span className={`status priority-${patient.prioridad || "normal"}`}>{patient.prioridad || "normal"}</span></td>
                <td>{patient.direccion || "-"}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setHistoryPatient(patient)} className="medix-button" type="button">Historial</button>
                    <button onClick={() => setEditingPatient(patient)} className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white" type="button">Editar</button>
                    <button onClick={() => handleDelete(patient.id)} className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white" type="button">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-slate-500">
                  No hay pacientes para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {historyPatient && <PatientHistoryModal patient={historyPatient} onClose={() => setHistoryPatient(null)} />}

      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2>Editar paciente</h2>
            <form onSubmit={handleUpdate} className="mt-6 grid gap-4 md:grid-cols-2">
              <input name="nombres" className="medix-input" placeholder="Nombres" value={editingPatient.nombres} onChange={handleEditChange} required />
              <input name="apellidos" className="medix-input" placeholder="Apellidos" value={editingPatient.apellidos} onChange={handleEditChange} required />
              <input name="dni" className="medix-input" placeholder="DNI" value={editingPatient.dni} onChange={handleEditChange} inputMode="numeric" pattern="\d{8}" minLength={8} maxLength={8} required />
              <input name="fecha_nacimiento" type="date" className="medix-input" value={editingPatient.fecha_nacimiento || ""} onChange={handleEditChange} />
              <input name="telefono" className="medix-input" placeholder="Telefono" value={editingPatient.telefono || ""} onChange={handleEditChange} inputMode="numeric" pattern="\d{9}" maxLength={9} />
              <select name="prioridad" className="medix-input" value={editingPatient.prioridad || "normal"} onChange={handleEditChange}>
                <option value="normal">Prioridad normal</option>
                <option value="preferente">Preferente</option>
                <option value="emergencia">Emergencia</option>
              </select>
              <input name="direccion" className="medix-input md:col-span-2" placeholder="Direccion" value={editingPatient.direccion || ""} onChange={handleEditChange} />
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="medix-button">Guardar cambios</button>
                <button type="button" onClick={() => setEditingPatient(null)} className="rounded-lg bg-slate-200 px-4 py-2 font-bold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default PatientList;
