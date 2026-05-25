import React, { useState } from "react";
import { Image, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { title: "", date: "", caption: "", file: null };
const fileMeta = (file) => file ? {
  fileName: file.name,
  fileType: file.type || "image/*",
  fileSize: file.size,
  fileCategory: "image",
} : null;

export default function Memories() {
  const { memories = [], addMemory, deleteMemory } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Escribe un título para el recuerdo.");
      return;
    }
    addMemory(form);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Recuerdos" title="Galería de recuerdos" subtitle="Guarda referencias de fotos o momentos especiales sin subir archivos a ningún servidor." />
      <StatCard icon={Image} label="Recuerdos" value={memories.length} hint="En este viaje" />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Añadir recuerdo">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Título" value={form.title} onChange={(event) => update("title", event.target.value)} />
            <FormInput label="Fecha" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
            <label className="block text-sm font-black text-ink">Foto o imagen<input type="file" accept="image/*" onChange={(event) => update("file", fileMeta(event.target.files?.[0]))} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-primary-700" /></label>
            {form.file ? <p className="rounded-xl bg-primary-50 px-3 py-2 text-sm font-bold text-primary-800">{form.file.fileName}</p> : null}
            <FormTextarea label="Descripción" value={form.caption} onChange={(event) => update("caption", event.target.value)} />
            <button className="primary-button justify-center"><Plus size={16} /> Guardar recuerdo</button>
          </form>
        </SectionCard>
        <SectionCard title="Galería">
          {memories.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{memories.map((memory) => <article key={memory.id} className="overflow-hidden rounded-3xl border border-line bg-white"><div className="flex aspect-video items-center justify-center bg-primary-50 text-primary-700"><Image size={34} /></div><div className="p-4"><div className="flex justify-between gap-3"><div><p className="text-xs font-black text-primary-700">{memory.date || "Sin fecha"}</p><h3 className="mt-1 font-black text-ink">{memory.title}</h3></div><button onClick={() => deleteMemory(memory.id)} className="rounded-xl p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button></div><p className="mt-2 text-sm text-slate-500">{memory.caption}</p><p className="mt-2 text-xs font-bold text-slate-400">{memory.file?.fileName || memory.file?.name || "Sin archivo"}</p></div></article>)}</div> : <EmptyState title="Sin recuerdos" description="Añade fotos o momentos destacados del viaje." />}
        </SectionCard>
      </div>
    </div>
  );
}
