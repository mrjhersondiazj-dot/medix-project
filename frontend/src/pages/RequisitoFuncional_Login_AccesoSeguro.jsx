/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Login_AccesoSeguro.jsx
 * Proposito: Pantalla de login: permite ingresar con DNI y contrasena, muestra mensajes claros de error y dirige al usuario al dashboard.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import Icon from "../components/ui/RequisitoNoFuncional_Interfaz_IconografiaUsabilidad";
import authService from "../services/RequisitoFuncional_Login_AutenticacionRolesSesion";

// Explicacion: Define un componente o funcion reutilizable del sistema.
function Login() {
  // Estado controlado del DNI: queda vacio para no exponer accesos al abrir la pagina.
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [dni, setDni] = useState("");
  // Estado controlado de la contrasena: nunca se precarga por seguridad.
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Loading evita doble envio mientras el sistema valida credenciales.
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [loading, setLoading] = useState(false);
  // Guarda el mensaje amigable que se muestra si el acceso falla.
  // Explicacion: Declara un estado de React para guardar informacion que cambia en pantalla.
  const [errorMessage, setErrorMessage] = useState("");
  // Hook de React Router usado para enviar al usuario al dashboard tras login correcto.
  const navigate = useNavigate();

  // Explicacion: Define una funcion o constante usada en la logica del modulo.
  const handleSubmit = async (event) => {
    // Evita que el formulario recargue la pagina; React maneja el flujo.
    event.preventDefault();
    // Activa estado visual de carga en el boton.
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setLoading(true);
    // Limpia errores anteriores antes de un nuevo intento.
    // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
    setErrorMessage("");

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      // Envia DNI y contrasena al servicio centralizado de autenticacion.
      // Explicacion: Ejecuta una accion de autenticacion o sesion del usuario.
      await authService.login({ dni, password });
      // Si el backend/demo responde bien, se abre el panel principal.
      navigate("/dashboard");
    } catch (error) {
      // Muestra un mensaje entendible sin revelar detalles tecnicos internos.
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setErrorMessage(
        error.response?.status === 401
          ? "No se pudo validar el acceso. Revisa que el DNI y la contrasena correspondan a tu usuario institucional."
          : error.response?.data?.detail ||
              "No pudimos iniciar sesion. Verifica tu conexion o intenta nuevamente en unos segundos."
      );
    } finally {
      // Siempre se desactiva loading, incluso si hubo error.
      // Explicacion: Actualiza el estado para refrescar la interfaz con informacion nueva.
      setLoading(false);
    }
  };

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
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
          historias clinicas, incidencias y auditoria desde una sola consola.
        </p>
        <div className="login-security-strip">
          <span><Icon name="lock" size={17} /> Acceso por rol</span>
          <span><Icon name="shield" size={17} /> Sesion protegida</span>
          <span><Icon name="activity" size={17} /> Trazabilidad activa</span>
        </div>
      </section>

      <section className="login-panel">
        <div>
          <Icon name="shield" size={42} />
          <h2 className="login-title">Acceso seguro</h2>
          <p className="login-subtitle">Ingresa con tu DNI institucional y clave asignada.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            DNI
            {/* Este campo solo permite numeros porque el DNI institucional debe ser numerico. */}
            <input
              className="medix-input mt-2"
              maxLength={8}
              minLength={8}
              placeholder="Ej. 12345678"
              value={dni}
              onChange={(event) => setDni(event.target.value.replace(/\D/g, ""))}
              required
            />
          </label>

          <label>
            Contrasena
            <div className="password-field">
              <input
                className="medix-input mt-2"
                type={showPassword ? "text" : "password"}
                placeholder="Clave institucional"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                aria-label={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
                onClick={() => setShowPassword((value) => !value)}
                title={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
                type="button"
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
              </button>
            </div>
          </label>

          <button className="medix-button w-full" disabled={loading} type="submit">
            {loading ? "Ingresando..." : "Ingresar a MEDIX"}
          </button>
        </form>

        {errorMessage && (
          // Bloque visible de error: orienta al usuario sin exponer informacion sensible.
          <div className="login-error" role="alert">
            <strong>No se pudo ingresar</strong>
            <p>{errorMessage}</p>
            <span>Usa el DNI institucional asignado o solicita al administrador validar tu usuario.</span>
          </div>
        )}

        <details className="login-demo">
          <summary>Accesos de demostracion para sustentacion</summary>
          <div>
            <button type="button" onClick={() => setDni("12345678")}>Administrador</button>
            <button type="button" onClick={() => setDni("11112222")}>Medico</button>
            <button type="button" onClick={() => setDni("22223333")}>Recepcion</button>
          </div>
          <p>Las claves demo no se precargan. Usalas solo en ambiente academico.</p>
        </details>
      </section>
    </main>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default Login;
