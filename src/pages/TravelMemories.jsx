import React, { useState } from "react";
import { BookOpen, Image, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const TABS = ["Diario del viaje", "Galería de fotos"];
const diaryInitial = { title: "", date: "", mood: "Genial", content: "" };
const memoryInitial = { title: "", date: "", caption: "", file: null };
const fileMeta = (file) =>
  file ? { fileName: file.name, fileType: file.type || "image/*", fileSize: file.size, fileCategory: "image" } : null;

const MOOD_COLORS = {
  Genial: "bg-emerald-50 text-emerald-700",
  Tranquilo: "bg-sky-50 text-sky-700",
  Cansado: "bg-slate-100 text-slate-600",
  Sorpresa: "bg-amber-50 text-amber-700",
  Mejorable: "bg-rose-50 text-rose-700",
};

export default function TravelMemories() {
  const { diaryEntries = [], memories = [], addDiaryEntry, deleteDiaryEntry, addMemory, deleteMemory } = useAppState();
  const [tab, setTab] = useState(0);
  const [diaryForm, setDiaryForm] = useState(diaryInitial);
  const [memoryForm, setMemoryForm] = useState(memoryInitial);
  const [diaryError, setDiaryError] = useState("");
  const [memoryError, setMemoryError] = useState("");

  function updateDiary(field, value) {
    setDiaryForm((c) => ({ ...c, [field]: value }));
  }

  function updateMemory(field, value) {
    setMemoryForm((c) => ({ ...c, [field]: value }));
  }

  function submitDiary(event) {
    event.preventDefault();
    if (!diaryForm.title.trim() || !diaryForm.content.trim()) {
      setDiaryError("Completa título y texto del diario.");
      return;
    }
    addDiaryEntry(diaryForm);
    setDiaryForm(diaryInitial);
    setDiaryError("");
  }

  function submitMemory(event) {
    event.preventDefault();
    if (!memoryForm.title.trim()) {
      setMemoryError("Escribe un título para el recuerdo.");
      return;
    }
    addMemory(memoryForm);
    setMemoryForm(memoryInitial);
    setMemoryError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Recuerdos del viaje"
        title="Diario y galería"
        subtitle="Escribe lo que viviste cada día y guarda referencias de tus fotos favoritas."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={BookOpen} label="Entradas de diario" value={diaryEntries.length} hint="Guardadas en este viaje" />
        <StatCard icon={Image} label="Fotos y recuerdos" value={memories.length} hint="Referencias guardadas" accent="violet" />
      </div>

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
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <SectionCard title="Nueva entrada">
            <form onSubmit={submitDiary} className="grid gap-4">
              <FormError>{diaryError}</FormError>
              <FormInput label="Título" value={diaryForm.title} onChange={(e) => updateDiary("title", e.target.value)} placeholder="¿Qué pasó hoy?" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Fecha" type="date" value={diaryForm.date} onChange={(e) => updateDiary("date", e.target.value)} />
                <FormSelect label="Sensación del día" value={diaryForm.mood} onChange={(e) => updateDiary("mood", e.target.value)}>
                  <option>Genial</option>
                  <option>Tranquilo</option>
                  <option>Cansado</option>
                  <option>Sorpresa</option>
                  <option>Mejorable</option>
                </FormSelect>
              </div>
              <FormTextarea label="¿Qué recuerdas de este día?" value={diaryForm.content} onChange={(e) => updateDiary("content", e.target.value)} />
              <button className="primary-button justify-center">
                <Plus size={16} /> Guardar entrada
              </button>
            </form>
          </SectionCard>

          <SectionCard title={`Entradas del diario (${diaryEntries.length})`}>
            {diaryEntries.length ? (
              <div className="grid gap-4">
                {diaryEntries.map((entry) => (
                  <article key={entry.id} className="rounded-3xl border border-line bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {entry.date && <p className="text-sm font-bold text-slate-500">{entry.date}</p>}
                          {entry.mood && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${MOOD_COLORS[entry.mood] || "bg-slate-100 text-slate-600"}`}>
                              {entry.mood}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-xl font-black text-ink">{entry.title}</h3>
                      </div>
                      <button onClick={() => deleteDiaryEntry(entry.id)} className="rounded-xl p-2 text-slate-400 hover:text-rose-600">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <p className="mt-4 leading-7 text-slate-600">{entry.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin entradas" description="Escribe la primera nota del diario cuando empiece el viaje." />
            )}
          </SectionCard>
        </div>
      )}

      {tab === 1 && (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <SectionCard title="Añadir recuerdo">
            <form onSubmit={submitMemory} className="grid gap-4">
              <FormError>{memoryError}</FormError>
              <FormInput label="Título" value={memoryForm.title} onChange={(e) => updateMemory("title", e.target.value)} placeholder="Puesta de sol en el Foro..." />
              <FormInput label="Fecha" type="date" value={memoryForm.date} onChange={(e) => updateMemory("date", e.target.value)} />
              <label className="block text-sm font-black text-ink">
                Foto o imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateMemory("file", fileMeta(e.target.files?.[0]))}
                  className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-primary-700"
                />
              </label>
              {memoryForm.file && (
                <p className="rounded-xl bg-primary-50 px-3 py-2 text-sm font-bold text-primary-800">{memoryForm.file.fileName}</p>
              )}
              <FormTextarea label="Descripción" value={memoryForm.caption} onChange={(e) => updateMemory("caption", e.target.value)} />
              <button className="primary-button justify-center">
                <Plus size={16} /> Guardar recuerdo
              </button>
            </form>
          </SectionCard>

          <SectionCard title={`Galería (${memories.length})`}>
            {memories.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {memories.map((memory) => (
                  <article key={memory.id} className="overflow-hidden rounded-3xl border border-line bg-white">
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-primary-400">
                      <Image size={36} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {memory.date && <p className="text-xs font-black text-primary-700">{memory.date}</p>}
                          <h3 className="mt-0.5 font-black text-ink">{memory.title}</h3>
                        </div>
                        <button onClick={() => deleteMemory(memory.id)} className="rounded-xl p-2 text-slate-400 hover:text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {memory.caption && <p className="mt-2 text-sm leading-6 text-slate-500">{memory.caption}</p>}
                      {(memory.file?.fileName || memory.file?.name) && (
                        <p className="mt-2 truncate text-xs font-bold text-slate-400">
                          {memory.file.fileName || memory.file.name}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin recuerdos" description="Añade fotos o momentos destacados del viaje." />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
