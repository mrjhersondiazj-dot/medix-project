/* EXPOSICION MEDIX
 * Archivo: RequisitoFuncional_NavegacionPrincipal_RutasAcceso.jsx
 * Proposito: Navegacion principal: define rutas publicas, privadas y compatibilidad con GitHub Pages.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import Dashboard from "./pages/RequisitoFuncional_Dashboard_GestionHospitalaria_TrazabilidadReportes";
import Login from "./pages/RequisitoFuncional_Login_AccesoSeguro";
// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import PrivateRoute from "./routes/RequisitoNoFuncional_Seguridad_RutaPrivada_ControlAcceso";

// Explicacion: Define un componente o funcion reutilizable del sistema.
function App() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  const Router = isDemoMode ? HashRouter : BrowserRouter;

  // Explicacion: Inicia el bloque visual que React renderiza en pantalla.
  return (
    <Router basename={isDemoMode ? undefined : import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default App;
