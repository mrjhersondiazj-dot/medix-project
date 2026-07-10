/* EXPOSICION MEDIX
 * Archivo: RequisitoNoFuncional_ArranqueFrontend_RenderizadoAplicacion.jsx
 * Proposito: Punto de arranque frontend: monta React dentro del HTML principal.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import React from 'react'
import ReactDOM from 'react-dom/client'
// Explicacion: Importa una dependencia o modulo necesario para este archivo.
import App from './RequisitoFuncional_NavegacionPrincipal_RutasAcceso.jsx'
import './RequisitoNoFuncional_InterfazDisenoResponsivo_Usabilidad.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
