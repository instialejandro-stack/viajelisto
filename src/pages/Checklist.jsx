import React, { useState } from "react";
import { CheckCircle2, Clock3, ListChecks, Plus, ShieldCheck } from "lucide-react";
import ChecklistSection from "../components/ChecklistSection.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { FormError, FormInput, FormSelect } from "../components/FormControls.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function Checklist() {
  const { checklist, toggleTask, addTask, updateTask, deleteTask } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", group: "Antes del viaje", priority: "media", due: "", category: "", done: "pendiente" });
  const allTasks = Object.values(checklist).flat();
  const completed = allTasks.filter((task) => task.done).length;
  const pending = allTasks.length - completed;
  const progress = allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreate() {
    setEditingTask(null);
    setForm({ title: "", group: "Antes del viaje", priority: "media", due: "", category: "", done: "pendiente" });
    setError("");
    setModalOpen(true);
  }

  function handleRenameTask(group, index, newTitle) {
    const task = checklist[group]?.[index];
    if (!task) return;
    updateTask(group, index, group, { ...task, title: newTitle });
  }
  function openEdit(group, index, task) {
    setEditingTask({ group, index });
    setForm({
      title: task.title,
      group,
      priority: task.priority || "media",
      due: task.due || "",
      category: task.category || "",
      done: task.done ? "completada" : "pendiente",
    });
    setError("");
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title || !form.category) {
      setError("Completa título y categoría.");
      return;
    }
    if (editingTask) updateTask(editingTask.group, editingTask.index, form.group, form);
    else addTask(form.group, form);
    setModalOpen(false);
    setEditingTask(null);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Tareas del viaje"
        title="Checklist"
        subtitle="Revisa tareas importantes y evita olvidos antes de salir."
        actionLabel="Añadir tarea"
        icon={Plus}
        onAction={openCreate}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ListChecks} label="Tareas totales" value={allTasks.length} hint="Antes, durante y después" />
        <StatCard icon={CheckCircle2} label="Completadas" value={completed} hint="Ya resueltas" accent="emerald" />
        <StatCard icon={Clock3} label="Pendientes" value={pending} hint="Por revisar" accent="amber" />
        <StatCard icon={ShieldCheck} label="Progreso general" value={`${progress}%`} hint="Preparación práctica" accent="violet" />
      </div>

      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-black text-ink">Progreso de tareas</h2>
            <p className="mt-1 text-sm text-slate-500">Ya tienes la mayoría del viaje organizado.</p>
          </div>
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">{completed}/{allTasks.length} completadas</span>
        </div>
        <ProgressBar value={progress} label="Checklist general" />
      </section>

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

        <SectionCard title="Notas útiles">
          <div className="grid gap-3">
            {[
              "Ya tienes la mayoría del viaje organizado.",
              "Revisa las tareas críticas antes de viajar.",
              "Las reservas y documentos son lo más importante.",
            ].map((copy) => (
              <div key={copy} className="rounded-2xl bg-primary-50 p-4 text-sm font-bold leading-6 text-primary-800">
                {copy}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingTask(null); }} title={editingTask ? "Editar tarea" : "Añadir tarea"} description="Organiza tareas antes, durante o después del viaje.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Título" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Comprar entradas" />
            <FormSelect label="Sección" value={form.group} onChange={(event) => update("group", event.target.value)}>
              {Object.keys(checklist).map((group) => <option key={group}>{group}</option>)}
            </FormSelect>
            <FormSelect label="Prioridad" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              <option value="alta">alta</option>
              <option value="media">media</option>
              <option value="baja">baja</option>
            </FormSelect>
            <FormInput label="Fecha límite" value={form.due} onChange={(event) => update("due", event.target.value)} placeholder="Antes del 8 mayo" />
            <FormInput label="Categoría" value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Documentos" />
            <FormSelect label="Estado" value={form.done} onChange={(event) => update("done", event.target.value)}>
              <option value="pendiente">pendiente</option>
              <option value="completada">completada</option>
            </FormSelect>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingTask(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingTask ? "Guardar cambios" : "Guardar tarea"}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Eliminar tarea"
        description={`Vas a eliminar ${deletingTask?.title || "esta tarea"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingTask(null)}
        onConfirm={() => {
          deleteTask(deletingTask.group, deletingTask.index);
          setDeletingTask(null);
        }}
      />
    </div>
  );
}
