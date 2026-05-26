import React, { useState } from "react";
import { CheckCircle2, LayoutTemplate } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function Templates() {
  const { tripTemplates = [], applyTemplate } = useAppState();
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Plantillas" title="Crear desde plantilla" subtitle="Aplica elementos base al viaje activo sin borrar lo que ya tienes." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {tripTemplates.map((template) => (
          <button key={template.id} type="button" onClick={() => setSelected(template)} className="card p-5 text-left transition hover:-translate-y-1 hover:border-primary-200">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><LayoutTemplate size={22} /></span>
            <h2 className="mt-4 text-lg font-black text-ink">{template.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{template.type}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{template.bestFor}</p>
            <div className="mt-4 flex flex-wrap gap-2">{template.includes.map((item) => <span key={item} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">{item}</span>)}</div>
          </button>
        ))}
      </div>
      {selected && (
        <SectionCard title={`Incluye: ${selected.name}`}>
          <div className="grid gap-4 md:grid-cols-3">
            {["checklist", "packing", "documents", "preparation"].map((key) => (
              <div key={key} className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-black capitalize text-ink">{key}</h3>
                <ul className="mt-3 grid gap-2 text-sm text-slate-600">{selected[key].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={15} /> {item}</li>)}</ul>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      <ConfirmDialog open={Boolean(selected)} title="Aplicar plantilla" description="Esto añadirá elementos base sin borrar lo que ya tienes." confirmLabel="Aplicar plantilla" onCancel={() => setSelected(null)} onConfirm={() => { applyTemplate(selected.id); setSelected(null); }} />
    </div>
  );
}
