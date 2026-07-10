/* EXPOSICION MEDIX
 * Archivo: RequisitoNoFuncional_Seguridad_RutaPrivada_ControlAcceso.jsx
 * Proposito: Ruta privada: evita que usuarios sin sesion entren al sistema interno.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import { Navigate } from "react-router-dom";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import authService from "../services/RequisitoFuncional_Login_AutenticacionRolesSesion";

// Explicacion: Define un componente o funcion reutilizable del sistema.
function PrivateRoute({ children }) {

  const isAuthenticated =
    authService.isAuthenticated();

  // Explicacion: Evalua una condicion para decidir el flujo que debe seguir el sistema.
  if (!isAuthenticated) {

    // Explicacion: Devuelve el resultado calculado por la funcion.
    return <Navigate to="/login" replace />;

  }

  // Explicacion: Devuelve el resultado calculado por la funcion.
  return children;

}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default PrivateRoute;
