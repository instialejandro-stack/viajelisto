import React from "react";

export default function StatCard({ icon: Icon, label, value, hint, accent = "primary" }) {
  const accents = {
    primary: "bg-primary-50 text-primary-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:border-primary-200">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${accents[accent] || accents.primary}`}>
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
