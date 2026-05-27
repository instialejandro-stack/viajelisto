import React from "react";

const styles = {
  Idea: "bg-slate-100 text-slate-600 ring-slate-200/70",
  "En planificación": "bg-cyan-50 text-cyan-700 ring-cyan-200/70",
  Confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  Finalizado: "bg-violet-50 text-violet-700 ring-violet-200/70",
  Archivado: "bg-slate-100 text-slate-500 ring-slate-200/70",
  pendiente: "bg-amber-50 text-amber-700 ring-amber-200/70",
  comprado: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  reservado: "bg-cyan-50 text-cyan-700 ring-cyan-200/70",
  subido: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  completado: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  pagado: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  Alta: "bg-rose-50 text-rose-700 ring-rose-200/70",
  Media: "bg-amber-50 text-amber-700 ring-amber-200/70",
  Baja: "bg-slate-100 text-slate-600 ring-slate-200/70",
  Transporte: "bg-sky-50 text-sky-700 ring-sky-200/70",
  Visita: "bg-violet-50 text-violet-700 ring-violet-200/70",
  Comida: "bg-amber-50 text-amber-700 ring-amber-200/70",
  Alojamiento: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  Experiencia: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70",
  Correcto: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  Aviso: "bg-amber-50 text-amber-700 ring-amber-200/70",
  Recomendación: "bg-primary-50 text-primary-700 ring-primary-200/70",
  Sugerencia: "bg-cyan-50 text-cyan-700 ring-cyan-200/70",
  Regla: "bg-slate-100 text-slate-600 ring-slate-200/70",
  Ejemplo: "bg-violet-50 text-violet-700 ring-violet-200/70",
};

const dots = {
  "En planificación": "bg-cyan-500",
  Confirmado: "bg-emerald-500",
  Finalizado: "bg-violet-500",
  pendiente: "bg-amber-500",
  comprado: "bg-emerald-500",
  confirmado: "bg-emerald-500",
  reservado: "bg-cyan-500",
  subido: "bg-emerald-500",
  completado: "bg-emerald-500",
  pagado: "bg-emerald-500",
  Alta: "bg-rose-500",
  Media: "bg-amber-500",
};

export default function Badge({ children, dot = false }) {
  const display =
    typeof children === "string" && children
      ? children.charAt(0).toUpperCase() + children.slice(1)
      : children;

  const dotColor = dots[children];

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ring-1 ${
        styles[children] || "bg-slate-100 text-slate-600 ring-slate-200/70"
      }`}
    >
      {(dot || dotColor) && dotColor && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
      )}
      {display}
    </span>
  );
}
