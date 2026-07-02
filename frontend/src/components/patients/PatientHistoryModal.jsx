import { useEffect, useState } from "react";

import api from "../../services/api";

function PatientHistoryModal({ patient, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get(`/medical-records/patient/${patient.id}`);
        setRecords(response.data);
      } catch (error) {
        alert(error.response?.data?.detail || "No se pudo cargar el historial clinico.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [patient.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Historial clinico</h2>
            <p className="mt-1 text-slate-600">{patient.nombres} {patient.apellidos} | DNI {patient.dni}</p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2 font-bold" type="button">
            Cerrar
          </button>
        </div>

        {loading && <p className="mt-6 text-slate-600">Cargando historial...</p>}

        {!loading && records.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <p className="text-slate-600">El paciente aun no cuenta con registros medicos en el sistema.</p>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="mt-6 space-y-4">
            {records.map((record) => (
              <article key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-teal-700">Atencion medica</h3>
                    <p className="text-sm text-slate-500">Fecha: {new Date(record.fecha_registro).toLocaleString()}</p>
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700">
                    Doctor DNI/Codigo: {record.doctor?.dni || "-"}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Motivo" value={record.motivo_consulta} />
                  <Field label="Sintomas" value={record.sintomas} />
                  <Field label="Diagnostico" value={record.diagnostico} />
                  <Field label="Tratamiento" value={record.tratamiento_recetado} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-slate-800">{value}</p>
    </div>
  );
}

export default PatientHistoryModal;
