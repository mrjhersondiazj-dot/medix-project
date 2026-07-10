/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Usuarios_RolesPermisosAdministracion.jsx
 * Proposito: Usuarios y roles: permite al administrador crear, editar y eliminar usuarios del sistema.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { useEffect, useState } from "react";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { formatSpecialty } from "../../data/RequisitoFuncional_Reportes_DatosDemoIndicadores";
import api from "../../services/RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";
import Icon from "../ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";

const initialForm = {
  nombres: "",
  apellidos: "",
  dni: "",
  celular: "",
  password: "",
  role: "doctor",
  specialty: "MEDICINA INTERNA",
  shift: "manana",
};

// Explicacion: Define un componente o funcion reutilizable del sistema.
function UserManagement() {
  const [users, setUsers] = useState([]);
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [form, setForm] = useState(initialForm);
  const [editingUser, setEditingUser] = useState(null);
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const loadUsers = async () => {
    try {
      const [response, configResponse] = await Promise.all([
        api.get("/users/"),
        api.get("/config/specialties"),
      ]);
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setUsers(response.data);
      setSpecialties(configResponse.data.specialties || []);
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudieron cargar los usuarios.");
    }
  };

  // Explicacion: Ejecuta una accion automatica cuando el componente carga o cambian sus dependencias.
  useEffect(() => {
    loadUsers();
  }, []);

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleChange = (event) => {
    const { name, value } = event.target;
    const numericValue = value.replace(/\D/g, "");
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setForm((current) => ({
      ...current,
      [name]:
        name === "dni"
          ? numericValue.slice(0, 8)
          : name === "celular"
            ? numericValue.slice(0, 9)
            : value,
    }));
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.dni.length !== 8) {
      alert("El DNI debe tener exactamente 8 digitos.");
      return;
    }
    if (form.celular.length !== 9) {
      alert("El celular debe tener exactamente 9 digitos.");
      return;
    }
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setLoading(true);

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.post("/users/", form);
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setForm(initialForm);
      await loadUsers();
      alert("Usuario creado correctamente.");
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo crear el usuario.");
    } finally {
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setLoading(false);
    }
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    const numericValue = value.replace(/\D/g, "");
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setEditingUser((current) => ({
      ...current,
      [name]:
        name === "dni"
          ? numericValue.slice(0, 8)
          : name === "celular"
            ? numericValue.slice(0, 9)
            : value,
    }));
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleUpdate = async (event) => {
    event.preventDefault();
    if (editingUser.dni.length !== 8) {
      alert("El DNI debe tener exactamente 8 digitos.");
      return;
    }
    if (editingUser.celular.length !== 9) {
      alert("El celular debe tener exactamente 9 digitos.");
      return;
    }
    const payload = {
      nombres: editingUser.nombres || null,
      apellidos: editingUser.apellidos || null,
      dni: editingUser.dni,
      celular: editingUser.celular,
      role: editingUser.role,
      specialty: editingUser.role === "doctor" ? editingUser.specialty : "TODAS",
      shift: editingUser.shift,
    };

    // Explicacion: Evalua una condicion para decidir el flujo que debe seguir el sistema.
    if (editingUser.password) payload.password = editingUser.password;

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.patch(`/users/${editingUser.id}`, payload);
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setEditingUser(null);
      await loadUsers();
      alert("Usuario actualizado correctamente.");
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo actualizar el usuario.");
    }
  };

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleDelete = async (user) => {
    if (!confirm(`Eliminar usuario DNI ${user.dni}?`)) return;

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      await api.delete(`/users/${user.id}`);
      await loadUsers();
      alert("Usuario eliminado correctamente.");
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo eliminar el usuario.");
    }
  };

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
  return (
    <section className="main-panel module-panel">
      <div className="panel-heading">
        <div>
          <h2>Usuarios, medicos y roles</h2>
          <p>Solo el administrador puede crear, modificar, reasignar rol o eliminar usuarios.</p>
        </div>
      </div>

      <form className="module-form users-form" onSubmit={handleSubmit}>
        <label>Nombres<input name="nombres" value={form.nombres} onChange={handleChange} /></label>
        <label>Apellidos<input name="apellidos" value={form.apellidos} onChange={handleChange} /></label>
        <label>DNI<input name="dni" value={form.dni} onChange={handleChange} inputMode="numeric" pattern="\d{8}" minLength={8} maxLength={8} required /></label>
        <label>Celular<input name="celular" value={form.celular} onChange={handleChange} inputMode="numeric" pattern="\d{9}" minLength={9} maxLength={9} required /></label>
        <label>Contrasena<input name="password" type="password" value={form.password} onChange={handleChange} minLength={6} required /></label>
        <label>
          Rol
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Administrador</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="doctor">Medico</option>
          </select>
        </label>
        {form.role === "doctor" && (
          <>
            <label>
              Especialidad
              <select name="specialty" value={form.specialty} onChange={handleChange}>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>{formatSpecialty(specialty)}</option>
                ))}
              </select>
            </label>
            <label>
              Turno
              <select name="shift" value={form.shift} onChange={handleChange}>
                <option value="manana">Manana</option>
                <option value="tarde">Tarde</option>
                <option value="mixto">Mixto</option>
              </select>
            </label>
          </>
        )}
        <button disabled={loading} type="submit">
          <Icon name="plus" size={18} />
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Celular</th>
              <th>Rol</th>
              <th>Especialidad</th>
              <th>Turno</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nombres || "-"} {user.apellidos || ""}</td>
                <td>{user.dni}</td>
                <td>{user.celular}</td>
                <td><span className="status status-llegada">{user.role}</span></td>
                <td>{user.role === "doctor" ? formatSpecialty(user.specialty) : "Todas"}</td>
                <td>{user.shift || "-"}</td>
                <td>Activo</td>
                <td>
                  <div className="action-row">
                    <button className="small-action blue" onClick={() => setEditingUser({ ...user, password: "" })} type="button">Editar</button>
                    <button className="small-action red" onClick={() => handleDelete(user)} type="button">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Editar usuario</h2>
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
              <input name="nombres" className="medix-input" placeholder="Nombres" value={editingUser.nombres || ""} onChange={handleEditChange} />
              <input name="apellidos" className="medix-input" placeholder="Apellidos" value={editingUser.apellidos || ""} onChange={handleEditChange} />
              <input name="dni" className="medix-input" placeholder="DNI" value={editingUser.dni} onChange={handleEditChange} inputMode="numeric" pattern="\d{8}" minLength={8} maxLength={8} required />
              <input name="celular" className="medix-input" placeholder="Celular" value={editingUser.celular} onChange={handleEditChange} inputMode="numeric" pattern="\d{9}" minLength={9} maxLength={9} required />
              <select name="role" className="medix-input" value={editingUser.role} onChange={handleEditChange}>
                <option value="admin">Administrador</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="doctor">Medico</option>
              </select>
              {editingUser.role === "doctor" && (
                <>
                  <select name="specialty" className="medix-input" value={editingUser.specialty || "MEDICINA INTERNA"} onChange={handleEditChange}>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>{formatSpecialty(specialty)}</option>
                    ))}
                  </select>
                  <select name="shift" className="medix-input" value={editingUser.shift || "manana"} onChange={handleEditChange}>
                    <option value="manana">Manana</option>
                    <option value="tarde">Tarde</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </>
              )}
              <input name="password" className="medix-input" type="password" placeholder="Nueva contrasena opcional" value={editingUser.password} onChange={handleEditChange} />
              <div className="flex gap-3 md:col-span-2">
                <button className="medix-button" type="submit">Guardar cambios</button>
                <button className="rounded-lg bg-slate-200 px-4 py-2 font-bold" onClick={() => setEditingUser(null)} type="button">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default UserManagement;
