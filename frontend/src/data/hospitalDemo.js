export const services = [
  { name: "Medicina Interna", total: 18, color: "#0f8f8c" },
  { name: "Pediatria", total: 14, color: "#3467c8" },
  { name: "Traumatologia", total: 12, color: "#5559c9" },
  { name: "Ginecologia", total: 8, color: "#57c8b7" },
  { name: "Otros", total: 12, color: "#c7c9cc" },
];

export const demoQueue = [
  ["08:00", "Maria Elena Quispe Mamani", "29657841", "Medicina Interna", "MI-03", "atendida", "validacion", "-"],
  ["08:20", "Jose Luis Condori Apaza", "30456123", "Traumatologia", "TRA-02", "atendida", "validacion", "-"],
  ["08:40", "Rosa Mendoza Flores", "40781236", "Pediatria", "PED-01", "en atencion", "atencion", "-"],
  ["09:00", "Carlos Alberto Diaz Cruz", "29664123", "Medicina Interna", "MI-01", "en cola", "cola", "18 min"],
  ["09:20", "Sandra Milagros Vargas Tito", "46874512", "Ginecologia", "GIN-02", "en cola", "cola", "22 min"],
  ["09:40", "Wilber Paco Huanca", "23987456", "Cardiologia", "CAR-01", "llegado", "llegada", "-"],
  ["10:00", "Lucia Nina Huamani", "30324987", "Oftalmologia", "OFT-01", "llegado", "llegada", "-"],
  ["10:20", "Edgar Alancoa Quispe", "70896321", "Traumatologia", "TRA-01", "pendiente", "cita", "-"],
];

export const auditEvents = [
  "Inicio de jornada asistencial",
  "Validacion de admision activada",
  "Sincronizacion con cola medica",
  "Reporte diario listo para auditoria",
];
