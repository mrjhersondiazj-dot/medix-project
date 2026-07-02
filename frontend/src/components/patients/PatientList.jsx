import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import Icon from "../ui/Icon";
import PatientHistoryModal from "./PatientHistoryModal";

function PatientList({ refreshKey }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);

  const loadPatients = async () => {
    try {
      const response = await api.get("/patients/");
      setPatients(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo cargar la lista.");
    }
  };

  useEffect(() => {
    loadPatients();
  }, [refreshKey]);

  const filteredPatients = useMemo(() => {
    const value = search.toLowerCase();
    return patients.filter((patient) =>
      `${patient.apellidos} ${patient.nombres} ${patient.dni}`.toLowerCase().includes(value)
    );
  }, [patients, search]);

  const handleDelete = async (patientId) => {
    if (!confirm("Seguro que deseas eliminar este paciente?")) return;

    try {
      await api.delete(`/patients/${patientId}`);
      alert("Paciente eliminado correctamente.");
      loadPatients();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo eliminar el paciente.");
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingPatient({
      ...editingPatient,
      [name]: name === "dni" ? value.replace(/\D/g, "").slice(0, 8) : value,
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      await api.patch(`/patients/${editingPatient.id}`, {
        nombres: editingPatient.nombres,
        apellidos: editingPatient.apellidos,
        dni: editingPatient.dni,
        fecha_nacimiento: editingPatient.fecha_nacimiento || null,
        telefono: editingPatient.telefono || null,
        direccion: editingPatient.direccion || null,
      });

      alert("Paciente actualizado correctamente.");
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo actualizar el paciente.");
    }
  };

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
                <td colSpan="7" className="p-6 text-center text-slate-500">
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
              <input name="dni" className="medix-input" placeholder="DNI" value={editingPatient.dni} onChange={handleEditChange} minLength={8} maxLength={8} required />
              <input name="fecha_nacimiento" type="date" className="medix-input" value={editingPatient.fecha_nacimiento || ""} onChange={handleEditChange} />
              <input name="telefono" className="medix-input" placeholder="Telefono" value={editingPatient.telefono || ""} onChange={handleEditChange} />
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

export default PatientList;
