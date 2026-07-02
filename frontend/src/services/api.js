import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

api.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem(
        "medix_token"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },

  (error) => Promise.reject(error)

);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("medix_token");
      localStorage.removeItem("medix_role");
    }

    return Promise.reject(error);
  }
);

export default api;
