import React from "react";

export default function ProgressBar({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{label || "Progreso"}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
