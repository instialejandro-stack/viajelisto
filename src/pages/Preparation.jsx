import React, { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { getFinalReadiness, getTripCountdown } from "../utils/tripIntelligence.js";

const phases = [
  ["30d", "30 días antes", ["Revisar documentación", "Reservar alojamiento", "Comprar vuelos/trenes", "Contratar seguro si aplica"]],
  ["14d", "14 días antes", ["Comprar entradas importantes", "Revisar requisitos del viaje", "Planificar itinerario básico"]],
  ["7d", "7 días antes", ["Descargar mapas offline", "Confirmar reservas", "Revisar maleta", "Comprobar gastos pendientes"]],
  ["48h", "48 horas antes", ["Hacer check-in online", "Revisar pasajes", "Cargar documentos en la app", "Preparar dinero/tarjetas"]],
  ["24h", "24 horas antes", ["Hacer maleta", "Confirmar transporte al aeropuerto", "Revisar horarios", "Cargar móvil/powerbank"]],
  ["day", "Día del viaje", ["Llevar DNI/pasaporte", "Llevar pasajes", "Revisar próxima actividad", "Salir con margen"]],
];
const initialForm = { title: "", phase: "7d", priority: "Media", relatedSection: "checklist", notes: "" };

export default function Preparation() {
  const state = useAppState();
  const { activeTrip, preparationTasks = [], addPreparationTask, updatePreparationTask, togglePreparationTask, deletePreparationTask } = state;
  const [simulatedDays, setSimulatedDays] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const start = activeTrip?.startDate ? new Date(`${activeTrip.startDate}T00:00:00`) : null;
  const realDays = start ? Math.ceil((start - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const daysLeft = simulatedDays === "" ? realDays : Number(simulatedDays);
  const allTasks = useMemo(() => {
    const generated = phases.flatMap(([phase, , titles]) => titles.map((title, index) => ({ id: `base-${phase}-${index}`, title, phase, completed: false, priority: "Media", relatedSection: "checklist", base: true })));
    const completedMap = Object.fromEntries(preparationTasks.map((task) => [task.id, task.completed]));
    return [...generated.map((task) => ({ ...task, completed: completedMap[task.id] || false })), ...preparationTasks.filter((task) => !task.id?.startsWith("base-"))];
  }, [preparationTasks]);
  const completed = allTasks.filter((task) => task.completed).length;
  const progress = allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0;
  const countdown = activeTrip ? getTripCountdown(activeTrip) : null;
  const readiness = activeTrip ? getFinalReadiness(activeTrip, state.activeTripData) : null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Escribe el título de la tarea.");
      return;
    }
    if (editingId) updatePreparationTask(editingId, form);
    else addPreparationTask(form);
    setForm(initialForm);
    setEditingId(null);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Antes de viajar" title="Preparación" subtitle="Línea temporal visual con tareas recomendadas según los días que faltan." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarClock} label="Cuenta atrás" value={countdown?.label || daysLeft || "Sin fecha"} hint="Estado calculado por fechas" />
        <StatCard icon={CheckCircle2} label="Progreso" value={`${progress}%`} hint={`${completed}/${allTasks.length} tareas`} accent="emerald" />
        <StatCard icon={CalendarClock} label="Comprobador final" value={`${readiness?.score ?? 0}%`} hint={readiness?.label || "Sin viaje"} accent="violet" />
      </div>
      <section className="card grid gap-4 p-5 sm:grid-cols-[1fr_220px] sm:items-end">
        <div>
          <h2 className="text-lg font-black text-ink">Progreso total</h2>
          <p className="mt-1 text-sm text-slate-500">Marca tareas completadas para preparar el viaje con calma.</p>
          <div className="mt-4"><ProgressBar value={progress} label="Preparación" /></div>
        </div>
        <FormSelect label="Simular días antes" value={simulatedDays} onChange={(event) => setSimulatedDays(event.target.value)}>
          <option value="">Fecha real</option><option value="30">30 días</option><option value="14">14 días</option><option value="7">7 días</option><option value="2">48 horas</option><option value="1">24 horas</option><option value="0">Día del viaje</option>
        </FormSelect>
      </section>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title={editingId ? "Editar tarea" : "Añadir tarea manual"}>
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Título" value={form.title} onChange={(event) => update("title", event.target.value)} />
            <FormSelect label="Fase" value={form.phase} onChange={(event) => update("phase", event.target.value)}>{phases.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</FormSelect>
            <FormSelect label="Prioridad" value={form.priority} onChange={(event) => update("priority", event.target.value)}><option>Alta</option><option>Media</option><option>Baja</option></FormSelect>
            <FormSelect label="Relacionado con" value={form.relatedSection} onChange={(event) => update("relatedSection", event.target.value)}>{["document", "transport", "accommodation", "activity", "packing", "expense", "checklist"].map((section) => <option key={section}>{section}</option>)}</FormSelect>
            <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
            <button type="submit" className="primary-button justify-center"><Plus size={16} /> {editingId ? "Guardar" : "Añadir"}</button>
          </form>
        </SectionCard>
        <SectionCard title="Timeline de preparación">
          <div className="grid gap-5">
            {phases.map(([phase, label]) => {
              const tasks = allTasks.filter((task) => task.phase === phase);
              const phaseDone = tasks.filter((task) => task.completed).length;
              return (
                <div key={phase} className="rounded-3xl border border-line bg-white p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-ink">{label}</h3>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-black text-primary-700">{phaseDone}/{tasks.length}</span>
                  </div>
                  {tasks.length ? <div className="grid gap-2">{tasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                      <label className="flex min-w-0 cursor-pointer items-start gap-3">
                        <input type="checkbox" className="mt-1 h-5 w-5 rounded border-line text-primary-600" checked={task.completed} onChange={() => task.base ? updatePreparationTask(task.id, task) : togglePreparationTask(task.id)} />
                        <span><span className={`font-black ${task.completed ? "text-slate-400 line-through" : "text-ink"}`}>{task.title}</span><span className="mt-1 block text-xs font-bold text-slate-500">{task.priority} · {task.relatedSection}</span></span>
                      </label>
                      {!task.base && <div className="flex gap-1"><button className="secondary-button px-2 py-1 text-xs" onClick={() => { setEditingId(task.id); setForm(task); }}>Editar</button><button className="rounded-xl p-2 text-slate-400 hover:text-rose-600" onClick={() => deletePreparationTask(task.id)}><Trash2 size={15} /></button></div>}
                    </div>
                  ))}</div> : <EmptyState title="Sin tareas" description="Añade tareas a esta fase." />}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
