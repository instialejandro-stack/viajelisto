import React, { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, Plane, Star, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FilterPills from "../components/FilterPills.jsx";
import { FormError, FormInput, FormTextarea } from "../components/FormControls.jsx";
import ItemActions from "../components/ItemActions.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const FILTERS = ["Todos", "Cultural", "Escapada urbana", "Gastronomía", "Mejor puntuación"];

function parseBudgetNum(value) {
  return Number.parseInt(String(value || "0").replace(/[^\d]/g, ""), 10) || 0;
}

function scoreColor(score) {
  const n = Number.parseFloat(score) || 0;
  if (n >= 8) return "bg-emerald-600";
  if (n >= 6) return "bg-primary-600";
  return "bg-slate-500";
}

export default function Ideas() {
  const navigate = useNavigate();
  const { ideas, addIdea, updateIdea, deleteIdea, chooseIdea } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [form, setForm] = useState({ destination: "", dates: "", budget: "", type: "", pros: "", cons: "", score: "" });

  const bestScore = useMemo(
    () => ideas.reduce((best, idea) => Math.max(best, Number.parseFloat(idea.score) || 0), 0).toFixed(1),
    [ideas]
  );
  const avgBudget = useMemo(() => {
    const nums = ideas.map((i) => parseBudgetNum(i.budget)).filter((n) => n > 0);
    if (!nums.length) return "—";
    return `${Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)} €`;
  }, [ideas]);
  const viableCount = useMemo(
    () => ideas.filter((i) => Number.parseFloat(i.score) >= 7).length,
    [ideas]
  );
  const filteredIdeas = useMemo(() => {
    if (activeFilter === "Mejor puntuación") {
      return [...ideas].sort((a, b) => (Number.parseFloat(b.score) || 0) - (Number.parseFloat(a.score) || 0));
    }
    if (activeFilter !== "Todos") {
      return ideas.filter((i) => i.type?.toLowerCase().includes(activeFilter.toLowerCase()));
    }
    return ideas;
  }, [ideas, activeFilter]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ destination: "", dates: "", budget: "", type: "", pros: "", cons: "", score: "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(idea) {
    setEditingId(idea.id);
    setForm({
      destination: idea.destination || "",
      dates: idea.dates || "",
      budget: String(idea.budget || "").replace(/[^\d]/g, ""),
      type: idea.type || "",
      pros: (idea.pros || []).join(", "),
      cons: (idea.cons || []).join(", "),
      score: idea.score || "",
    });
    setError("");
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.destination || !form.dates || !form.budget || !form.type || !form.score) {
      setError("Completa destino, fechas, presupuesto, tipo y puntuación.");
      return;
    }
    if (editingId !== null) updateIdea(editingId, form);
    else addIdea(form);
    setForm({ destination: "", dates: "", budget: "", type: "", pros: "", cons: "", score: "" });
    setError("");
    setEditingId(null);
    setModalOpen(false);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Exploración"
        title="Ideas de viaje"
        subtitle="Compara posibles destinos antes de comprometer fechas, vuelos y presupuesto."
        actionLabel="Añadir idea"
        icon={Lightbulb}
        onAction={openCreate}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Lightbulb} label="Ideas guardadas" value={ideas.length} hint="Destinos en comparación" />
        <StatCard icon={Star} label="Mejor puntuación" value={bestScore} hint="Destino mejor valorado" accent="amber" />
        <StatCard icon={WalletCards} label="Presupuesto medio" value={avgBudget} hint="Estimación orientativa" accent="violet" />
        <StatCard icon={Plane} label="Opciones viables" value={viableCount} hint="Puntuación ≥ 7" accent="emerald" />
      </div>

      <FilterPills filters={FILTERS} activeFilter={activeFilter} onFilter={setActiveFilter} />

      <SectionCard title={activeFilter !== "Todos" ? `Destinos · ${activeFilter}` : "Comparativa de destinos"}>
        {filteredIdeas.length ? (
          <div className="grid gap-5 xl:grid-cols-3">
            {filteredIdeas.map((idea, index) => (
              <article key={`${idea.destination}-${index}`} className="card p-5 transition hover:-translate-y-1 hover:border-primary-200">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-ink dark:text-white">{idea.destination}</h2>
                    <p className="mt-1 text-sm text-slate-500">{idea.dates} · {idea.type}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={`rounded-2xl px-3 py-2 text-sm font-black text-white ${scoreColor(idea.score)}`}>
                      {idea.score}/10
                    </span>
                    <ItemActions onEdit={() => openEdit(idea)} onDelete={() => setDeletingId(idea.id)} />
                  </div>
                </div>
                <div className="my-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
                  <p className="text-xs font-black uppercase text-slate-400">Presupuesto estimado</p>
                  <p className="mt-1 text-3xl font-black text-ink dark:text-white">{idea.budget}</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <p className="mb-2 text-sm font-black text-ink dark:text-white">Pros</p>
                    <div className="flex flex-wrap gap-2">
                      {idea.pros.map((pro) => <Badge key={pro}>{pro}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-black text-ink dark:text-white">Contras</p>
                    <p className="text-sm leading-6 text-slate-500">{idea.cons.join(", ")}</p>
                  </div>
                </div>
                <button
                  className="primary-button mt-5 w-full"
                  onClick={() => {
                    chooseIdea(idea);
                    navigate(`/trips/${idea.id}/summary`);
                  }}
                >
                  <CheckCircle2 size={17} /> Elegir este viaje
                </button>
              </article>
            ))}
          </div>
        ) : ideas.length ? (
          <EmptyState
            title={`Sin destinos de tipo "${activeFilter}"`}
            description="Prueba otro filtro o añade ideas con ese tipo de viaje."
          />
        ) : (
          <EmptyState
            title="No hay ideas guardadas"
            description="Añade un destino para empezar a comparar opciones."
          />
        )}
      </SectionCard>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null); }}
        title={editingId !== null ? "Editar idea de viaje" : "Añadir idea de viaje"}
        description="Guarda una opción para compararla antes de convertirla en viaje."
      >
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Destino" value={form.destination} onChange={(event) => update("destination", event.target.value)} placeholder="Roma" />
            <FormInput label="Fechas aproximadas" value={form.dates} onChange={(event) => update("dates", event.target.value)} placeholder="Mayo 2026" />
            <FormInput label="Presupuesto estimado" value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="700" />
            <FormInput label="Tipo de viaje" value={form.type} onChange={(event) => update("type", event.target.value)} placeholder="Cultural / gastronómico" />
            <FormInput label="Puntuación" value={form.score} onChange={(event) => update("score", event.target.value)} placeholder="8.5" />
          </div>
          <FormTextarea label="Pros separados por coma" value={form.pros} onChange={(event) => update("pros", event.target.value)} placeholder="Historia, comida, vuelos baratos" />
          <FormTextarea label="Contras separados por coma" value={form.cons} onChange={(event) => update("cons", event.target.value)} placeholder="Mucho turismo" />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingId(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingId !== null ? "Guardar cambios" : "Guardar idea"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingId !== null}
        title="Eliminar idea"
        description="Vas a eliminar esta idea de viaje. Esta acción no se puede deshacer en la demo."
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          deleteIdea(deletingId);
          setDeletingId(null);
        }}
      />
    </div>
  );
}
