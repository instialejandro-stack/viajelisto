import React, { useState } from "react";
import { Plus, Trash2, Vote } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { question: "", options: "" };

export default function GroupVotes() {
  const { polls = [], participants = [], addPoll, votePoll, deletePoll } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!form.question.trim() || form.options.split("\n").filter(Boolean).length < 2) {
      setError("Escribe una pregunta y al menos dos opciones, una por línea.");
      return;
    }
    addPoll(form);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Grupo" title="Votaciones" subtitle="Decidid planes, restaurantes o prioridades del viaje con votaciones locales." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Vote} label="Votaciones" value={polls.length} hint="En este viaje" />
        <StatCard icon={Vote} label="Participantes" value={participants.length} hint="Pueden votar" accent="emerald" />
        <StatCard icon={Vote} label="Opciones" value={polls.reduce((sum, poll) => sum + poll.options.length, 0)} hint="En total" accent="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title="Nueva votación">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Pregunta" value={form.question} onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))} placeholder="¿Dónde cenamos el Día 2?" />
            <FormTextarea label="Opciones" value={form.options} onChange={(event) => setForm((current) => ({ ...current, options: event.target.value }))} placeholder={"Tonnarello\nRoscioli\nTrattoria cerca del hotel"} />
            <button type="submit" className="primary-button justify-center"><Plus size={16} /> Crear votación</button>
          </form>
        </SectionCard>
        <SectionCard title="Votaciones del viaje">
          {polls.length ? (
            <div className="grid gap-5">
              {polls.map((poll) => {
                const maxVotes = Math.max(1, ...poll.options.map((option) => option.votes?.length || 0));
                return (
                  <article key={poll.id} className="rounded-3xl border border-line bg-white p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-black text-ink">{poll.question}</h3>
                      <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => deletePoll(poll.id)}><Trash2 size={17} /></button>
                    </div>
                    <div className="grid gap-3">
                      {poll.options.map((option) => {
                        const votes = option.votes || [];
                        const percent = Math.round((votes.length / maxVotes) * 100);
                        return (
                          <div key={option.id} className="rounded-2xl bg-slate-50 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-black text-ink">{option.text}</p>
                              <p className="text-sm font-bold text-slate-500">{votes.length} votos</p>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                              <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {participants.map((participant) => (
                                <button key={participant.id} type="button" className={`rounded-xl px-3 py-1.5 text-xs font-black ${votes.includes(participant.id) ? "bg-primary-600 text-white" : "bg-white text-slate-500"}`} onClick={() => votePoll(poll.id, option.id, participant.id)}>
                                  {participant.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <EmptyState title="No hay votaciones" description="Crea una votación para decidir planes con el grupo." />}
        </SectionCard>
      </div>
    </div>
  );
}
