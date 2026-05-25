import React, { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";

const steps = [
  {
    title: "Crea un viaje o abre el viaje de ejemplo",
    text: "Empieza desde el Dashboard. Puedes usar los datos de ejemplo o crear un viaje propio con fechas, personas y presupuesto.",
  },
  {
    title: "Añade transporte, alojamiento y lugares",
    text: "Guarda vuelos, hoteles, restaurantes y puntos de interés para tener toda la logística controlada.",
  },
  {
    title: "Organiza cada día desde el itinerario",
    text: "Planifica actividades por hora, añade costes y tiempos de traslado para entender mejor cada jornada.",
  },
  {
    title: "Guarda documentos, gastos y justificantes",
    text: "Centraliza reservas, entradas, seguros, tickets y gastos compartidos dentro del viaje activo.",
  },
  {
    title: "Revisa el comprobador final antes de salir",
    text: "Comprueba avisos importantes, tareas pendientes, documentos y noches de alojamiento antes del viaje.",
  },
];

export default function GuidedDemoModal({ open, onClose, onDontShowAgain }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  if (!open) return null;

  function finish(skip = false) {
    if (skip && onDontShowAgain) onDontShowAgain();
    setIndex(0);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_30px_90px_rgba(24,39,75,0.22)]">
        <header className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="text-sm font-black uppercase text-primary-700">Demo guiada</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Cómo enseñar ViajeListo</h2>
          </div>
          <button type="button" className="icon-button" onClick={() => finish(false)} aria-label="Cerrar demo guiada">
            <X size={18} />
          </button>
        </header>
        <div className="p-6">
          <div className="mb-5 flex gap-2">
            {steps.map((item, stepIndex) => (
              <span key={item.title} className={`h-2 flex-1 rounded-full ${stepIndex <= index ? "bg-primary-600" : "bg-slate-100"}`} />
            ))}
          </div>
          <div className="rounded-3xl bg-primary-50 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
              <CheckCircle2 size={22} />
            </span>
            <p className="mt-5 text-sm font-black uppercase text-primary-700">Paso {index + 1} de {steps.length}</p>
            <h3 className="mt-2 text-2xl font-black text-ink">{step.title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="text-sm font-black text-slate-500 hover:text-ink" onClick={() => finish(true)}>
              No volver a mostrar
            </button>
            <div className="flex gap-2">
              <button type="button" className="secondary-button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>
                <ChevronLeft size={16} /> Anterior
              </button>
              {index === steps.length - 1 ? (
                <button type="button" className="primary-button" onClick={() => finish(false)}>
                  Finalizar
                </button>
              ) : (
                <button type="button" className="primary-button" onClick={() => setIndex((current) => Math.min(steps.length - 1, current + 1))}>
                  Siguiente <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
