import React from "react";
import { ArrowRight, CheckCircle2, Info, Lightbulb, TriangleAlert } from "lucide-react";

const config = {
  recomendacion: { icon: Lightbulb, style: "bg-primary-50 text-primary-700" },
  correcto: { icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700" },
  aviso: { icon: TriangleAlert, style: "bg-amber-50 text-amber-700" },
  info: { icon: Info, style: "bg-slate-100 text-slate-700" },
};

export default function SuggestionCard({ title, description, type = "recomendacion", action }) {
  const item = config[type] || config.recomendacion;
  const Icon = item.icon;

  return (
    <article className="card p-5 transition hover:-translate-y-0.5 hover:border-primary-200">
      <div className="mb-4 flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.style}`}>
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="font-black text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {action && (
        <p className="flex items-center gap-2 text-sm font-black text-primary-700">
          {action} <ArrowRight size={15} />
        </p>
      )}
    </article>
  );
}
