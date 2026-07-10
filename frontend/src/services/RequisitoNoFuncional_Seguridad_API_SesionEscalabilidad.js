/* EXPOSICION MEDIX
 * Archivo: RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad.js
 * Proposito: Cliente API: centraliza llamadas al backend, agrega token Bearer y limpia la sesion si el token falla.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import axios from "axios";
import demoApi from "./RequisitoNoFuncional_DemoPublica_Escalabilidad_LocalStorage";

// En GitHub Pages no existe backend real; esta bandera activa la API simulada local.
// Explicacion: Evalua una condicion para decidir el flujo que debe seguir el sistema.
if (import.meta.env.VITE_DEMO_MODE === "true") {
  console.info("MEDIX demo mode enabled: using local browser data.");
}

// Instancia unica de Axios: evita repetir la URL base en cada componente.
const api = axios.create({
  // En produccion puede cambiarse con VITE_API_URL sin modificar codigo.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

// Interceptor de salida: antes de cada request agrega el token si existe.
api.interceptors.request.use(

  (config) => {

    // El token se guarda al iniciar sesion y representa al usuario autenticado.
    const token =
      // Explicacion: Lee o modifica datos de sesion guardados en el navegador.
      localStorage.getItem(
        "medix_token"
      );

    // Explicacion: Evalua una condicion para decidir el flujo que debe seguir el sistema.
    if (token) {

      // Bearer Token es el formato estandar para APIs protegidas.
      config.headers.Authorization =
        `Bearer ${token}`;

    }

    // Explicacion: Devuelve el resultado calculado por la funcion.
    return config;

  },

  (error) => Promise.reject(error)

);

// Interceptor de entrada: revisa respuestas del backend antes de entregarlas a la UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend responde 401, se limpia la sesion para evitar acceso con token invalido.
    // Explicacion: Evalua una condicion para decidir el flujo que debe seguir el sistema.
    if (error.response?.status === 401) {
      localStorage.removeItem("medix_token");
      // Explicacion: Lee o modifica datos de sesion guardados en el navegador.
      localStorage.removeItem("medix_role");
      localStorage.removeItem("medix_demo_user_id");
    }

    // Explicacion: Devuelve el resultado calculado por la funcion.
    return Promise.reject(error);
  }
);

// En demo usa localStorage; en Docker/produccion usa Axios contra el backend real.
// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default import.meta.env.VITE_DEMO_MODE === "true" ? demoApi : api;
