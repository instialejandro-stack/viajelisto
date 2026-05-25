import React from "react";
import ProgressBar from "./ProgressBar.jsx";

export default function BudgetCategoryCard({ row }) {
  const percent = Math.min(100, Math.round((row.spent / row.estimated) * 100));

  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-ink">{row.category}</h3>
          <p className="mt-1 text-sm text-slate-500">Estimado {row.estimated} €</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">{percent}%</span>
      </div>
      <ProgressBar value={percent} label="Gastado" />
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-500">Gastado</span>
        <strong className="text-ink">{row.spent} €</strong>
      </div>
    </article>
  );
}
