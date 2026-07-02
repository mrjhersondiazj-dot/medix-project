import { useEffect, useState } from "react";

import api from "../../services/api";
import Icon from "../ui/Icon";

const initialForm = {
  nombres: "",
  apellidos: "",
  dni: "",
  celular: "",
  password: "",
  role: "doctor",
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudieron cargar los usuarios.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: ["dni", "celular"].includes(name) ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/", form);
      setForm(initialForm);
      await loadUsers();
      alert("Usuario creado correctamente.");
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingUser((current) => ({
      ...current,
      [name]: ["dni", "celular"].includes(name) ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const payload = {
      nombres: editingUser.nombres || null,
      apellidos: editingUser.apellidos || null,
      dni: editingUser.dni,
      celular: editingUser.celular,
      role: editingUser.role,
    };

    if (editingUser.password) payload.password = editingUser.password;

    try {
      await api.patch(`/users/${editingUser.id}`, payload);
      setEditingUser(null);
      await loadUsers();
      alert("Usuario actualizado correctamente.");
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo actualizar el usuario.");
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Eliminar usuario DNI ${user.dni}?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      await loadUsers();
      alert("Usuario eliminado correctamente.");
    } catch (error) {
      alert(error.response?.data?.detail || "No se pudo eliminar el usuario.");
    }
  };

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
        <label>DNI<input name="dni" value={form.dni} onChange={handleChange} minLength={8} maxLength={8} required /></label>
        <label>Celular<input name="celular" value={form.celular} onChange={handleChange} minLength={9} maxLength={9} required /></label>
        <label>Contrasena<input name="password" type="password" value={form.password} onChange={handleChange} minLength={6} required /></label>
        <label>
          Rol
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Administrador</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="doctor">Medico</option>
          </select>
        </label>
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
              <input name="dni" className="medix-input" placeholder="DNI" value={editingUser.dni} onChange={handleEditChange} minLength={8} maxLength={8} required />
              <input name="celular" className="medix-input" placeholder="Celular" value={editingUser.celular} onChange={handleEditChange} minLength={9} maxLength={9} required />
              <select name="role" className="medix-input" value={editingUser.role} onChange={handleEditChange}>
                <option value="admin">Administrador</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="doctor">Medico</option>
              </select>
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

export default UserManagement;
