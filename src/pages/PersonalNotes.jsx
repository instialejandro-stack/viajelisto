import React, { useState } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { title: "", content: "", category: "Nota" };

export default function PersonalNotes() {
  const { personalNotes = [], addPersonalNote, updatePersonalNote, deletePersonalNote } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Completa título y contenido.");
      return;
    }
    if (editingId) updatePersonalNote(editingId, form);
    else addPersonalNote(form);
    setForm(initialForm);
    setEditingId(null);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Notas" title="Notas y recomendaciones personales" subtitle="Guarda consejos, ideas y recordatorios propios para este viaje." />
      <StatCard icon={NotebookPen} label="Notas guardadas" value={personalNotes.length} hint="Solo en este viaje" />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title={editingId ? "Editar nota" : "Nueva nota"}>
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Título" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <FormSelect label="Categoría" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}><option>Nota</option><option>Recomendación</option><option>Idea</option><option>Recordatorio</option></FormSelect>
            <FormTextarea label="Contenido" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
            <button type="submit" className="primary-button justify-center"><Plus size={16} /> Guardar</button>
          </form>
        </SectionCard>
        <SectionCard title="Notas del viaje">
          {personalNotes.length ? <div className="grid gap-4 md:grid-cols-2">{personalNotes.map((note) => (
            <article key={note.id} className="rounded-3xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-primary-700">{note.category}</p><h3 className="mt-1 text-lg font-black text-ink">{note.title}</h3></div><button className="rounded-xl p-2 text-slate-400 hover:text-rose-600" onClick={() => deletePersonalNote(note.id)}><Trash2 size={17} /></button></div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{note.content}</p>
              <button className="secondary-button mt-4 px-3 py-2 text-xs" onClick={() => { setEditingId(note.id); setForm(note); }}>Editar</button>
            </article>
          ))}</div> : <EmptyState title="Sin notas personales" description="Añade recomendaciones o recordatorios propios del viaje." />}
        </SectionCard>
      </div>
    </div>
  );
}
