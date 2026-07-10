export const specialties = [
  "ADOLESCENTOLOGIA",
  "ANESTESIOLOGIA",
  "CARDIOLOGIA",
  "CARDIOLOGIA PEDIATRICA",
  "CERITSS",
  "CERTIFICADO DE INCAPACIDAD",
  "CIRUGIA DE CABEZA Y CUELLO",
  "CIRUGIA TORAX Y CARDIOVASCULAR",
  "CIRUGIA GENERAL",
  "CIRUGIA MAXILOFACIAL",
  "CIRUGIA PEDIATRICA",
  "CIRUGIA PLASTICA",
  "DERMATOLOGIA",
  "DIALISIS PERITONEAL",
  "ENDOCRINOLOGIA",
  "ENDOCRINOLOGIA PEDIATRICA",
  "GASTROENTEROLOGIA",
  "GASTROENTEROLOGIA PEDIATRICA",
  "GERIATRIA",
  "GINECOLOGIA",
  "HEMATOLOGIA",
  "HIGADO",
  "INFECTOLOGIA",
  "MEDICINA INTERNA",
  "MEDICINA ONCOLOGICA",
  "NEFROLOGIA",
  "NEFROLOGIA PEDIATRICA",
  "NEONATOLOGIA",
  "NEUMOLOGIA",
  "NEUMOLOGIA PEDIATRICA",
  "NEUROCIRUGIA",
  "NEUROLOGIA",
  "NEUROLOGIA PEDIATRICA",
  "NINO SANO",
  "OBSTETRICIA",
  "ODONTOLOGIA ENDODONCIA",
  "ODONTOLOGIA INTEGRAL",
  "ODONTOLOGIA ORTODONCIA",
  "ODONTOLOGIA PEDIATRICA",
  "ODONTOLOGIA PERIODONCIA",
  "OFTALMOLOGIA",
  "OFTALMOLOGIA PEDIATRICA",
  "ONCOLOGIA CLINICA",
  "ONCOLOGIA QUIRURGICA",
  "OTORRINOLARINGOLOGIA",
  "PEDIATRIA GENERAL",
  "PSICOLOGIA",
  "PSICOLOGIA PEDIATRICA",
  "PSIQUIATRIA",
  "REPRODUCCION HUMANA",
  "REUMATOLOGIA",
  "TRAUMATOLOGIA",
  "UROLOGIA",
];

export const serviceColors = [
  "#008f8c",
  "#2563eb",
  "#6554c0",
  "#10b981",
  "#f59e0b",
  "#dc2626",
  "#0f766e",
  "#4f46e5",
];

export const defaultSpecialtySettings = specialties.reduce((settings, specialty, index) => {
  settings[specialty] = {
    specialty,
    dailyLimit: ["MEDICINA INTERNA", "PEDIATRIA GENERAL", "TRAUMATOLOGIA"].includes(specialty) ? 22 : 12,
    morningStart: "08:00",
    morningEnd: "12:00",
    afternoonStart: "14:00",
    afternoonEnd: "18:00",
    slotMinutes: 20,
    color: serviceColors[index % serviceColors.length],
  };
  return settings;
}, {});

export const services = [
  { name: "MEDICINA INTERNA", total: 18, color: "#008f8c" },
  { name: "PEDIATRIA GENERAL", total: 14, color: "#2563eb" },
  { name: "TRAUMATOLOGIA", total: 12, color: "#6554c0" },
  { name: "GINECOLOGIA", total: 8, color: "#10b981" },
  { name: "CARDIOLOGIA", total: 7, color: "#f59e0b" },
];

export const auditEvents = [
  "Inicio de jornada asistencial",
  "Validacion de admision activada",
  "Sincronizacion con cola medica",
  "Reporte diario listo para auditoria",
];

export const formatSpecialty = (specialty) =>
  specialty
    ? specialty
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Todas las especialidades";

export const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
