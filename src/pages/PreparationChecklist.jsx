import React, { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, ListChecks, Plus, Trash2 } from "lucide-react";
import ChecklistSection from "../components/ChecklistSection.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { getTripCountdown } from "../utils/tripIntelligence.js";

const TABS = ["Checklist", "Timeline de preparación"];

const SECTION_LABELS = { document: "Documentos", transport: "Transporte", accommodation: "Alojamiento", activity: "Actividad", packing: "Maleta", expense: "Gastos", checklist: "Checklist" };

const phases = [
  ["30d", "30 días antes", ["Revisar documentación", "Reservar alojamiento", "Comprar vuelos/trenes", "Contratar seguro si aplica"]],
  ["14d", "14 días antes", ["Comprar entradas importantes", "Revisar requisitos del viaje", "Planificar itinerario básico"]],
  ["7d", "7 días antes", ["Descargar mapas offline", "Confirmar reservas", "Revisar maleta", "Comprobar gastos pendientes"]],
  ["48h", "48 horas antes", ["Hacer check-in online", "Revisar pasajes", "Cargar documentos en la app", "Preparar dinero/tarjetas"]],
  ["24h", "24 horas antes", ["Hacer maleta", "Confirmar transporte al aeropuerto", "Revisar horarios", "Cargar móvil/powerbank"]],
  ["day", "Día del viaje", ["Llevar DNI/pasaporte", "Llevar pasajes", "Revisar próxima actividad", "Salir con margen"]],
];

const checklistInitial = { title: "", group: "Antes del viaje", priority: "media", due: "", category: "", done: "pendiente" };
const prepInitial = { title: "", phase: "7d", priority: "Media", relatedSection: "checklist", notes: "" };

export default function PreparationChecklist() {
  const state = useAppState();
  const {
    activeTrip,
    checklist,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    preparationTasks = [],
    addPreparationTask,
    updatePreparationTask,
    togglePreparationTask,
    deletePreparationTask,
  } = state;

  const [tab, setTab] = useState(0);

  // Checklist state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [checklistError, setChecklistError] = useState("");
  const [checklistForm, setChecklistForm] = useState(checklistInitial);

  // Preparation state
  const [prepForm, setPrepForm] = useState(prepInitial);
  const [prepEditingId, setPrepEditingId] = useState(null);
  const [prepError, setPrepError] = useState("");

  // Checklist stats
  const allChecklistTasks = Object.values(checklist).flat();
  const checklistDone = allChecklistTasks.filter((t) => t.done).length;
  const checklistProgress = allChecklistTasks.length ? Math.round((checklistDone / allChecklistTasks.length) * 100) : 0;

  // Preparation stats
  const allPrepTasks = useMemo(() => {
    const generated = phases.flatMap(([phase, , titles]) =>
      titles.map((title, i) => ({
        id: `base-${phase}-${i}`,
        title,
        phase,
        completed: false,
        priority: "Media",
        relatedSection: "checklist",
        base: true,
      }))
    );
    const completedMap = Object.fromEntries(preparationTasks.map((t) => [t.id, t.completed]));
    return [
      ...generated.map((t) => ({ ...t, completed: completedMap[t.id] || false })),
      ...preparationTasks.filter((t) => !t.id?.startsWith("base-")),
    ];
  }, [preparationTasks]);

  const prepDone = allPrepTasks.filter((t) => t.completed).length;
  const prepProgress = allPrepTasks.length ? Math.round((prepDone / allPrepTasks.length) * 100) : 0;
  const countdown = activeTrip ? getTripCountdown(activeTrip) : null;

  function updateChecklistForm(field, value) {
    setChecklistForm((c) => ({ ...c, [field]: value }));
  }

  function openCreate() {
    setEditingTask(null);
    setChecklistForm(checklistInitial);
    setChecklistError("");
    setModalOpen(true);
  }

  function openEdit(group, index, task) {
    setEditingTask({ group, index });
    setChecklistForm({
      title: task.title,
      group,
      priority: task.priority || "media",
      due: task.due || "",
      category: task.category || "",
      done: task.done ? "completada" : "pendiente",
    });
    setChecklistError("");
    setModalOpen(true);
  }

  function handleRenameTask(group, index, newTitle) {
    const task = checklist[group]?.[index];
    if (!task) return;
    updateTask(group, index, group, { ...task, title: newTitle });
  }

  function submitChecklist(event) {
    event.preventDefault();
    if (!checklistForm.title || !checklistForm.category) {
      setChecklistError("Completa título y categoría.");
      return;
    }
    if (editingTask) updateTask(editingTask.group, editingTask.index, checklistForm.group, checklistForm);
    else addTask(checklistForm.group, checklistForm);
    setModalOpen(false);
    setEditingTask(null);
    setChecklistError("");
  }

  function updatePrepForm(field, value) {
    setPrepForm((c) => ({ ...c, [field]: value }));
  }

  function submitPrep(event) {
    event.preventDefault();
    if (!prepForm.title.trim()) {
      setPrepError("Escribe el título de la tarea.");
      return;
    }
    if (prepEditingId) updatePreparationTask(prepEditingId, prepForm);
    else addPreparationTask(prepForm);
    setPrepForm(prepInitial);
    setPrepEditingId(null);
    setPrepError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Antes de viajar"
        title="Preparación y checklist"
        subtitle="Gestiona tareas pendientes y sigue la línea temporal de preparación antes de salir."
        actionLabel={tab === 0 ? "Añadir tarea" : undefined}
        icon={tab === 0 ? Plus : undefined}
        onAction={tab === 0 ? openCreate : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ListChecks} label="Tareas checklist" value={allChecklistTasks.length} hint="Antes, durante y después" />
        <StatCard icon={CheckCircle2} label="Completadas" value={checklistDone} hint="Ya resueltas" accent="emerald" />
        <StatCard icon={Clock3} label="Pendientes" value={allChecklistTasks.length - checklistDone} hint="Por revisar" accent="amber" />
        <StatCard icon={CalendarClock} label="Cuenta atrás" value={countdown?.label || "Sin fecha"} hint="Estado calculado por fechas" accent="violet" />
      </div>

      <section className="card p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-ink">Checklist general</h3>
              <span className="text-sm font-black text-emerald-700">{checklistDone}/{allChecklistTasks.length} completadas</span>
            </div>
            <ProgressBar value={checklistProgress} label="Checklist" />
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-ink">Timeline de preparación</h3>
              <span className="text-sm font-black text-primary-700">{prepDone}/{allPrepTasks.length} hechas</span>
            </div>
            <ProgressBar value={prepProgress} label="Preparación" />
          </div>
        </div>
      </section>

      <div className="flex overflow-x-auto border-b border-line">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            className={`-mb-px shrink-0 border-b-2 px-5 py-3 text-sm font-bold transition ${
              tab === i ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            {Object.entries(checklist).map(([group, items]) => (
              <ChecklistSection
                key={group}
                title={group}
                items={items}
                group={group}
                onToggle={toggleTask}
                onEdit={openEdit}
                onDelete={(taskGroup, index, task) => setDeletingTask({ group: taskGroup, index, title: task.title })}
                onRename={handleRenameTask}
              />
            ))}
          </div>
          <SectionCard title="Recordatorios">
            <div className="grid gap-3">
              {[
                "Revisa las tareas críticas antes de viajar.",
                "Las reservas y documentos son lo más importante.",
                "Comprueba la validez del pasaporte/DNI.",
              ].map((copy) => (
                <div key={copy} className="rounded-2xl bg-primary-50 p-4 text-sm font-bold leading-6 text-primary-800">
                  {copy}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 1 && (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <SectionCard title={prepEditingId ? "Editar tarea" : "Añadir tarea manual"}>
            <form onSubmit={submitPrep} className="grid gap-4">
              {prepError && (
                <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{prepError}</div>
              )}
              <FormInput label="Título" value={prepForm.title} onChange={(e) => updatePrepForm("title", e.target.value)} placeholder="Ej. Descargar mapas offline" />
              <FormSelect label="Fase" value={prepForm.phase} onChange={(e) => updatePrepForm("phase", e.target.value)}>
                {phases.map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </FormSelect>
              <FormSelect label="Prioridad" value={prepForm.priority} onChange={(e) => updatePrepForm("priority", e.target.value)}>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </FormSelect>
              <FormSelect label="Relacionado con" value={prepForm.relatedSection} onChange={(e) => updatePrepForm("relatedSection", e.target.value)}>
                {[["document","Documentos"],["transport","Transporte"],["accommodation","Alojamiento"],["activity","Actividad"],["packing","Maleta"],["expense","Gastos"],["checklist","Checklist"]].map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </FormSelect>
              <FormTextarea label="Notas" value={prepForm.notes} onChange={(e) => updatePrepForm("notes", e.target.value)} />
              <div className="flex gap-3">
                {prepEditingId && (
                  <button
                    type="button"
                    className="secondary-button flex-1 justify-center"
                    onClick={() => { setPrepEditingId(null); setPrepForm(prepInitial); }}
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="primary-button flex-1 justify-center">
                  <Plus size={16} /> {prepEditingId ? "Guardar" : "Añadir"}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Timeline de preparación">
            <div className="grid gap-5">
              {phases.map(([phase, label]) => {
                const tasks = allPrepTasks.filter((t) => t.phase === phase);
                const phaseDone = tasks.filter((t) => t.completed).length;
                return (
                  <div key={phase} className="rounded-3xl border border-line bg-white p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-ink">{label}</h3>
                      <span className={`rounded-full px-3 py-1 text-sm font-black ${phaseDone === tasks.length && tasks.length > 0 ? "bg-emerald-50 text-emerald-700" : "bg-primary-50 text-primary-700"}`}>
                        {phaseDone}/{tasks.length}
                      </span>
                    </div>
                    {tasks.length ? (
                      <div className="grid gap-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                            <label className="flex min-w-0 cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                className="mt-1 h-5 w-5 rounded border-line text-primary-600"
                                checked={task.completed}
                                onChange={() => togglePreparationTask(task.id)}
                              />
                              <span>
                                <span className={`block font-black ${task.completed ? "text-slate-400 line-through" : "text-ink"}`}>
                                  {task.title}
                                </span>
                                <span className="mt-1 block text-xs font-bold text-slate-500">
                                  {task.priority} · {SECTION_LABELS[task.relatedSection] || task.relatedSection}
                                </span>
                              </span>
                            </label>
                            {!task.base && (
                              <div className="flex shrink-0 gap-1">
                                <button
                                  className="secondary-button px-2 py-1 text-xs"
                                  onClick={() => { setPrepEditingId(task.id); setPrepForm(task); }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="rounded-xl p-2 text-slate-400 hover:text-rose-600"
                                  onClick={() => deletePreparationTask(task.id)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="Sin tareas" description="Añade tareas a esta fase." />
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        title={editingTask ? "Editar tarea" : "Añadir tarea"}
        description="Organiza tareas antes, durante o después del viaje."
      >
        <form onSubmit={submitChecklist} className="grid gap-4">
          <FormError>{checklistError}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Título" value={checklistForm.title} onChange={(e) => updateChecklistForm("title", e.target.value)} placeholder="Comprar entradas" />
            <FormSelect label="Sección" value={checklistForm.group} onChange={(e) => updateChecklistForm("group", e.target.value)}>
              {Object.keys(checklist).map((g) => <option key={g}>{g}</option>)}
            </FormSelect>
            <FormSelect label="Prioridad" value={checklistForm.priority} onChange={(e) => updateChecklistForm("priority", e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </FormSelect>
            <FormInput label="Fecha límite" value={checklistForm.due} onChange={(e) => updateChecklistForm("due", e.target.value)} placeholder="Antes del 8 mayo" />
            <FormInput label="Categoría" value={checklistForm.category} onChange={(e) => updateChecklistForm("category", e.target.value)} placeholder="Documentos" />
            <FormSelect label="Estado" value={checklistForm.done} onChange={(e) => updateChecklistForm("done", e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
            </FormSelect>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingTask(null); }}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {editingTask ? "Guardar cambios" : "Guardar tarea"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Eliminar tarea"
        description={`Vas a eliminar "${deletingTask?.title || "esta tarea"}". Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingTask(null)}
        onConfirm={() => { deleteTask(deletingTask.group, deletingTask.index); setDeletingTask(null); }}
      />
    </div>
  );
}
