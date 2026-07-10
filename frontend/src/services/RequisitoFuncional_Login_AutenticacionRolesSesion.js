/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_Login_AutenticacionRolesSesion.js
 * Proposito: Servicio de autenticacion: maneja login, logout, token y rol del usuario activo.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import api from "./RequisitoNoFuncional_Seguridad_API_SesionEscalabilidad";

const authService = {

  // Explicacion: Define una funcion asincrona para comunicarse con API o procesar datos.
  async login(credentials) {

    // Explicacion: Inicia manejo seguro de errores para evitar que la interfaz se rompa.
    try {
      const response = await api.post(
        "/auth/login",
        credentials
      );

      // Explicacion: Lee o modifica datos de sesion guardados en el navegador.
      localStorage.setItem(
        "medix_token",
        response.data.access_token
      );

      // Explicacion: Lee o modifica datos de sesion guardados en el navegador.
      localStorage.setItem(
        "medix_role",
        response.data.role
      );

      // Explicacion: Devuelve el resultado calculado por la funcion.
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }

  },

  logout() {

    // Explicacion: Lee o modifica datos de sesion guardados en el navegador.
    localStorage.removeItem(
      "medix_token"
    );

    // Explicacion: Lee o modifica datos de sesion guardados en el navegador.
    localStorage.removeItem(
      "medix_role"
    );

    // En modo demo tambien se limpia el identificador del usuario activo.
    localStorage.removeItem(
      "medix_demo_user_id"
    );

  },

  isAuthenticated() {

    // Explicacion: Devuelve el resultado calculado por la funcion.
    return !!localStorage.getItem(
      "medix_token"
    );

  },

  getRole() {

    // Explicacion: Devuelve el resultado calculado por la funcion.
    return localStorage.getItem(
      "medix_role"
    );

  },

};

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default authService;
