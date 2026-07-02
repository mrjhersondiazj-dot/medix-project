import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "../components/ui/Icon";
import authService from "../services/authService";

function Login() {
  const [dni, setDni] = useState("12345678");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await authService.login({ dni, password });
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail ||
          "No pudimos iniciar sesion. Revisa tu DNI, contrasena y conexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-hero">
        <div className="brand">
          <div className="brand-mark"><span /><strong>+</strong></div>
          <div>
            <h1>MEDIX</h1>
            <p>Arequipa</p>
          </div>
        </div>
        <h1>Sistema hospitalario inteligente para atencion en tiempo real.</h1>
        <p>
          Administra admision, citas, cola de espera, atenciones medicas,
          historias clinicas, usuarios y auditoria desde una sola consola.
        </p>
      </section>

      <section className="login-panel">
        <div>
          <Icon name="shield" size={42} />
          <h2 className="mt-4 text-3xl font-black text-slate-900">Acceso seguro</h2>
          <p className="mt-2 text-slate-500">Ingresa con tu DNI institucional.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            DNI
            <input
              className="medix-input mt-2"
              maxLength={8}
              minLength={8}
              value={dni}
              onChange={(event) => setDni(event.target.value.replace(/\D/g, ""))}
              required
            />
          </label>

          <label>
            Contrasena
            <input
              className="medix-input mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="medix-button w-full" disabled={loading} type="submit">
            {loading ? "Ingresando..." : "Ingresar a MEDIX"}
          </button>
        </form>

        {errorMessage && (
          <div className="login-error" role="alert">
            <strong>No se pudo ingresar</strong>
            <p>{errorMessage}</p>
            <span>Usa el DNI institucional asignado o solicita al administrador validar tu usuario.</span>
          </div>
        )}

        <div className="login-demo">
          Demo admin: 12345678 / admin123<br />
          Demo medico: 11112222 / doctor123<br />
          Demo recepcion: 22223333 / recep123
        </div>
      </section>
    </main>
  );
}

export default Login;
