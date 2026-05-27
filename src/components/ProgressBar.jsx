import React from "react";

export default function ProgressBar({ value, label, accent = "primary" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  const fills = {
    primary: "from-primary-500 to-cyan-400",
    emerald: "from-emerald-500 to-teal-400",
    amber: "from-amber-500 to-orange-400",
    violet: "from-violet-500 to-purple-400",
  };

  const fill = fills[accent] || fills.primary;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{label || "Progreso"}</span>
        <span className="font-semibold text-slate-700">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${fill}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
