import React, { useMemo, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { title: "", type: "Alojamiento", rating: "5", notes: "", wouldRepeat: "sí" };

export default function Reviews() {
  const { reviews = [], addReview, deleteReview } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const average = useMemo(() => reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1) : "0.0", [reviews]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Escribe qué estás valorando.");
      return;
    }
    addReview(form);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Después del viaje" title="Valoraciones post-viaje" subtitle="Evalúa alojamientos, restaurantes, actividades y aprendizajes para futuros viajes." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Star} label="Valoraciones" value={reviews.length} hint="Guardadas" />
        <StatCard icon={Star} label="Media" value={average} hint="Sobre 5" accent="amber" />
        <StatCard icon={Star} label="Repetiría" value={reviews.filter((review) => review.wouldRepeat === "sí").length} hint="Experiencias recomendadas" accent="emerald" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Nueva valoración">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Título" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Hotel, restaurante, actividad..." />
            <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>{["Alojamiento", "Restaurante", "Actividad", "Transporte", "Lugar", "General"].map((type) => <option key={type}>{type}</option>)}</FormSelect>
            <FormSelect label="Puntuación" value={form.rating} onChange={(event) => update("rating", event.target.value)}>{["1", "2", "3", "4", "5"].map((score) => <option key={score}>{score}</option>)}</FormSelect>
            <FormSelect label="¿Repetirías?" value={form.wouldRepeat} onChange={(event) => update("wouldRepeat", event.target.value)}><option value="sí">sí</option><option value="no">no</option></FormSelect>
            <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
            <button className="primary-button justify-center"><Plus size={16} /> Guardar valoración</button>
          </form>
        </SectionCard>
        <SectionCard title="Valoraciones">
          {reviews.length ? <div className="grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="rounded-3xl border border-line bg-white p-5"><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-primary-700">{review.type}</p><h3 className="mt-1 text-lg font-black text-ink">{review.title}</h3></div><button onClick={() => deleteReview(review.id)} className="rounded-xl p-2 text-slate-400 hover:text-rose-600"><Trash2 size={17} /></button></div><p className="mt-3 text-2xl font-black text-amber-500">{"★".repeat(Number(review.rating || 0))}</p><p className="mt-2 text-sm text-slate-500">{review.notes}</p><p className="mt-3 text-xs font-black text-slate-400">Repetiría: {review.wouldRepeat}</p></article>)}</div> : <EmptyState title="Sin valoraciones" description="Al volver del viaje, guarda aprendizajes y recomendaciones." />}
        </SectionCard>
      </div>
    </div>
  );
}
