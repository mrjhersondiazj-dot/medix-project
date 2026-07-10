/* EXPOSICION MEDIX
 * Archivo: RequisitoNoFuncional_Interfaz_IconografiaUsabilidad.jsx
 * Proposito: Iconografia reusable: centraliza iconos para mantener consistencia visual.
 * Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
 */

const paths = {
  activity: "M22 12h-4l-3 7-6-14-3 7H2",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.7-1 1.7 1 8.2 14.2A2 2 0 0 1 20 21H4a2 2 0 0 1-1.7-3.1L10.3 3.9Z",
  alertTriangle: "M12 9v4M12 17h.01M10.2 4.1 1.8-1.1 1.8 1.1 8.1 14.1A2 2 0 0 1 20.2 21H3.8a2 2 0 0 1-1.7-3L10.2 4.1Z",
  bot: "M12 8V4M8 4h8M6 11a6 6 0 0 1 12 0v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-5ZM9 13h.01M15 13h.01M9 17h6M4 14H2M22 14h-2",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  calendarPlus: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM15.5 14.5v5M13 17h5",
  chart: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8",
  check: "m4 12 5 5L20 6",
  chevron: "m9 18 6-6-6-6",
  chevronDown: "m6 9 6 6 6-6",
  clipboard: "M9 4h6M9 4a3 3 0 0 1 6 0M9 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 12h6M9 16h6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  edit: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13 7l4 4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "eye-off": "M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M9.9 5.2A10.8 10.8 0 0 1 12 5c6 0 10 7 10 7a16.5 16.5 0 0 1-3.1 3.9M6.1 6.1C3.5 7.9 2 12 2 12s4 7 10 7c1.3 0 2.5-.3 3.6-.8",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2ZM14 2v6h6M8 13h8M8 17h5",
  filter: "M3 5h18M6 12h12M10 19h4",
  home: "M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10",
  hospital: "M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M9 21v-6h6v6M9 8h6M12 5v6M4 21h16",
  image: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 9h.01M21 16l-5-5L5 22",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11ZM12 15v2",
  logout: "M10 17l5-5-5-5M15 12H3M21 3v18",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  medicalPlus: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM12 11v6M9 14h6",
  menu: "M4 6h16M4 12h16M4 18h16",
  mic: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3ZM5 11a7 7 0 0 0 14 0M12 18v4M8 22h8",
  notification: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  paperclip: "M21 12.5 12 21a6 6 0 0 1-8.5-8.5L13 3a4 4 0 0 1 5.7 5.7L9.2 18.2a2 2 0 1 1-2.8-2.8L15 6.8",
  plus: "M12 5v14M5 12h14",
  refresh: "M20 6v5h-5M4 18v-5h5M18 9a7 7 0 0 0-11.8-3M6 15a7 7 0 0 0 11.8 3",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4",
  settings: "M4 7h16M4 17h16M8 4v6M16 14v6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  specialty: "M4 5h6v6H4V5ZM14 5h6v6h-6V5ZM4 15h6v4H4v-4ZM14 15h6v4h-6v-4ZM7 8h.01M17 8h.01M7 17h.01M17 17h.01",
  stethoscope: "M6 3v5a4 4 0 0 0 8 0V3M6 3H4M14 3h2M10 12v3a5 5 0 0 0 10 0v-2M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 16h10l1-16M10 11v6M14 11v6",
  user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  userCheck: "M16 21a6 6 0 0 0-12 0M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM15 15l2 2 4-5",
  users: "M17 21a6 6 0 0 0-12 0M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21a5 5 0 0 0-6-4.9M17 3.5a3.5 3.5 0 0 1 0 7",
};

// Explicacion: Define un componente o funcion reutilizable del sistema.
function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={paths[name] || paths.activity} />
    </svg>
  );
}

// Explicacion: Exporta este modulo para que pueda usarse desde otros archivos.
export default Icon;
