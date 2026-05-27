import React, { useMemo, useState } from "react";
import { Plus, ReceiptText, Trash2, UserRound, UsersRound } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function Participants() {
  const {
    participants = [],
    expenses = [],
    documents = [],
    addParticipant,
    updateParticipant,
    deleteParticipant,
  } = useAppState();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const statsByParticipant = useMemo(() => Object.fromEntries(participants.map((participant) => {
    const linkedExpenses = expenses.filter((expense) => expense.paidBy === participant.id || expense.splitWith?.includes(participant.id));
    const linkedDocuments = documents.filter((document) => document.relatedToType === "participant" && document.relatedToId === participant.id);
    return [participant.id, { expenses: linkedExpenses.length, documents: linkedDocuments.length }];
  })), [documents, expenses, participants]);

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Escribe el nombre de la persona.");
      return;
    }
    addParticipant(name.trim());
    setName("");
    setError("");
  }

  function startEdit(participant) {
    setEditingId(participant.id);
    setEditingName(participant.name);
    setError("");
  }

  function saveEdit(event) {
    event.preventDefault();
    if (!editingName.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }
    updateParticipant(editingId, editingName.trim());
    setEditingId("");
    setEditingName("");
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Grupo"
        title="Participantes"
        subtitle="Edita las personas del viaje para repartir gastos, vincular documentos y preparar tareas por viajero."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={UsersRound} label="Personas" value={participants.length} hint="Viajeros del grupo" />
        <StatCard icon={ReceiptText} label="Gastos vinculados" value={expenses.length} hint="Compartidos o individuales" accent="violet" />
        <StatCard icon={UserRound} label="Documentos personales" value={documents.filter((doc) => doc.relatedToType === "participant").length} hint="Asignados a personas" accent="emerald" />
      </div>

      <SectionCard title="Añadir persona">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <FormError>{error}</FormError>
          <FormInput label="Nombre" value={name} onChange={(event) => setName(event.target.value)} placeholder="Marta" />
          <button type="submit" className="primary-button">
            <Plus size={16} /> Añadir
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Personas del viaje">
        {participants.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {participants.map((participant) => {
              const stats = statsByParticipant[participant.id] || { expenses: 0, documents: 0 };
              const editing = editingId === participant.id;
              return (
                <article key={participant.id} className="rounded-3xl border border-line bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  {editing ? (
                    <form onSubmit={saveEdit} className="grid gap-3">
                      <FormInput label="Nombre" value={editingName} onChange={(event) => setEditingName(event.target.value)} />
                      <div className="flex gap-2">
                        <button type="button" className="secondary-button flex-1" onClick={() => setEditingId("")}>Cancelar</button>
                        <button type="submit" className="primary-button flex-1">Guardar</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                            <UserRound size={20} />
                          </span>
                          <div>
                            <h2 className="font-black text-ink dark:text-white">{participant.name}</h2>
                            <p className="text-sm text-slate-500">Participante del viaje</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="icon-button text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          disabled={participants.length <= 1}
                          onClick={() => setDeleting(participant)}
                          aria-label={`Eliminar ${participant.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/50">
                          <p className="font-black text-ink dark:text-white">{stats.expenses}</p>
                          <p className="text-xs font-bold text-slate-500">Gastos</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/50">
                          <p className="font-black text-ink dark:text-white">{stats.documents}</p>
                          <p className="text-xs font-bold text-slate-500">Documentos</p>
                        </div>
                      </div>
                      <button type="button" className="secondary-button mt-4 w-full" onClick={() => startEdit(participant)}>
                        Editar nombre
                      </button>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sin participantes" description="Añade las personas del viaje para repartir gastos y documentos." icon={UsersRound} />
        )}
      </SectionCard>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar participante"
        description={`Vas a eliminar a ${deleting?.name || "esta persona"}. Sus gastos se reasignarán para no romper los balances.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteParticipant(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
