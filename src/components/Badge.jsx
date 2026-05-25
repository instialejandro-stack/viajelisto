import React from "react";

const styles = {
  Idea: "bg-slate-100 text-slate-700 ring-slate-200",
  "En planificación": "bg-cyan-50 text-cyan-700 ring-cyan-100",
  Confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Finalizado: "bg-violet-50 text-violet-700 ring-violet-100",
  Archivado: "bg-slate-100 text-slate-600 ring-slate-200",
  pendiente: "bg-amber-50 text-amber-700 ring-amber-100",
  comprado: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  reservado: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  subido: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  completado: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  pagado: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Alta: "bg-rose-50 text-rose-700 ring-rose-100",
  Media: "bg-amber-50 text-amber-700 ring-amber-100",
  Baja: "bg-slate-100 text-slate-700 ring-slate-200",
  Transporte: "bg-sky-50 text-sky-700 ring-sky-100",
  Visita: "bg-violet-50 text-violet-700 ring-violet-100",
  Comida: "bg-amber-50 text-amber-700 ring-amber-100",
  Alojamiento: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Experiencia: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
  Correcto: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Aviso: "bg-amber-50 text-amber-700 ring-amber-100",
  Recomendación: "bg-primary-50 text-primary-700 ring-primary-100",
  Sugerencia: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  Regla: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function Badge({ children }) {
  const display = typeof children === "string" && children ? children.charAt(0).toUpperCase() + children.slice(1) : children;
  return (
    <span className={`inline-flex w-fit max-w-full items-center rounded-full px-2.5 py-1 text-xs font-black leading-none ring-1 ${styles[children] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>
      {display}
    </span>
  );
}
