import api from "./api";

const authService = {

  async login(credentials) {

    try {
      const response = await api.post(
        "/auth/login",
        credentials
      );

      localStorage.setItem(
        "medix_token",
        response.data.access_token
      );

      localStorage.setItem(
        "medix_role",
        response.data.role
      );

      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }

  },

  logout() {

    localStorage.removeItem(
      "medix_token"
    );

    localStorage.removeItem(
      "medix_role"
    );

  },

  isAuthenticated() {

    return !!localStorage.getItem(
      "medix_token"
    );

  },

  getRole() {

    return localStorage.getItem(
      "medix_role"
    );

  },

};

export default authService;
