import React, { useState } from "react";
import { Printer } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const sections = [
  ["itinerary", "Itinerario"],
  ["budget", "Presupuesto"],
  ["documents", "Documentos"],
  ["packing", "Maleta"],
  ["reservations", "Reservas"],
];

export default function Exports() {
  const state = useAppState();
  const [selected, setSelected] = useState(sections.map(([key]) => key));
  const show = (key) => selected.includes(key);
  const toggle = (key) => setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Exportación" title="Exportaciones específicas" subtitle="Elige qué partes del viaje imprimir o guardar como PDF desde el navegador." actionLabel="Imprimir selección" icon={Printer} onAction={() => window.print()} />
      <section className="card flex flex-wrap gap-2 p-4 print:hidden">
        {sections.map(([key, label]) => (
          <button key={key} type="button" onClick={() => toggle(key)} className={`rounded-xl px-4 py-2 text-sm font-black ${show(key) ? "bg-ink text-white" : "bg-slate-100 text-slate-500"}`}>{label}</button>
        ))}
      </section>
      <div className="grid gap-5 rounded-[2rem] bg-white p-6 shadow-soft print:shadow-none">
        <header className="border-b border-line pb-4">
          <p className="text-sm font-black uppercase text-primary-700">ViajeListo</p>
          <h1 className="mt-1 text-3xl font-black text-ink">{state.activeTrip?.name}</h1>
          <p className="mt-1 text-slate-500">{state.activeTrip?.dates}</p>
        </header>
        {show("itinerary") && <SectionCard title="Itinerario">{(state.itineraryDays || []).map((day) => <p key={day.day} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{day.day}</strong> · {day.title} · {day.items.length} actividades</p>)}</SectionCard>}
        {show("budget") && <SectionCard title="Presupuesto">{(state.expenses || []).map((expense) => <p key={expense.id || expense.name} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{expense.name}</strong> · {expense.amount} € · {expense.status}</p>)}</SectionCard>}
        {show("documents") && <SectionCard title="Documentos">{(state.documents || []).map((document) => <p key={document.id || document.name} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{document.name}</strong> · {document.type} · {document.status}</p>)}</SectionCard>}
        {show("packing") && <SectionCard title="Maleta">{(state.packingItems || []).map((item) => <p key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{item.name}</strong> · {item.packed ? "Preparado" : "Pendiente"}</p>)}</SectionCard>}
        {show("reservations") && <SectionCard title="Reservas">{[...(state.transports || []), ...(state.lodgings || [])].map((item, index) => <p key={index} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{item.name || item.route}</strong> · {item.status}</p>)}</SectionCard>}
        <footer className="border-t border-line pt-4 text-center text-sm font-bold text-slate-500">Generado con ViajeListo</footer>
      </div>
    </div>
  );
}
