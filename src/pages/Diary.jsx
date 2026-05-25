import React, { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { title: "", date: "", mood: "Genial", content: "" };

export default function Diary() {
  const { diaryEntries = [], addDiaryEntry, deleteDiaryEntry } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Completa título y texto del diario.");
      return;
    }
    addDiaryEntry(form);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Recuerdos" title="Diario del viaje" subtitle="Escribe lo que pasa cada día y conserva pequeños momentos del viaje." />
      <StatCard icon={BookOpen} label="Entradas" value={diaryEntries.length} hint="Guardadas en este viaje" />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Nueva entrada">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Título" value={form.title} onChange={(event) => update("title", event.target.value)} />
            <FormInput label="Fecha" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
            <FormSelect label="Sensación" value={form.mood} onChange={(event) => update("mood", event.target.value)}><option>Genial</option><option>Tranquilo</option><option>Cansado</option><option>Sorpresa</option><option>Mejorable</option></FormSelect>
            <FormTextarea label="Texto" value={form.content} onChange={(event) => update("content", event.target.value)} />
            <button className="primary-button justify-center"><Plus size={16} /> Guardar entrada</button>
          </form>
        </SectionCard>
        <SectionCard title="Entradas del diario">
          {diaryEntries.length ? <div className="grid gap-4">{diaryEntries.map((entry) => <article key={entry.id} className="rounded-3xl border border-line bg-white p-5"><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-primary-700">{entry.date} · {entry.mood}</p><h3 className="mt-1 text-xl font-black text-ink">{entry.title}</h3></div><button onClick={() => deleteDiaryEntry(entry.id)} className="rounded-xl p-2 text-slate-400 hover:text-rose-600"><Trash2 size={17} /></button></div><p className="mt-4 leading-7 text-slate-600">{entry.content}</p></article>)}</div> : <EmptyState title="Sin entradas" description="Escribe la primera nota del diario cuando empiece el viaje." />}
        </SectionCard>
      </div>
    </div>
  );
}
