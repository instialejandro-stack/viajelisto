import React, { useMemo, useState } from "react";
import { FileCheck2, FileText, FileUp, Ticket, Upload, UserRound } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DocumentCard from "../components/DocumentCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FilterPills from "../components/FilterPills.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const filters = ["Todos", "Billetes", "Reservas", "Entradas", "Seguro", "Identificación", "Gastos", "Pendientes"];
const initialForm = { name: "", type: "Reserva", status: "subido", related: "", relatedToType: "trip", relatedToId: "", date: "", size: "", file: null, notes: "" };

function fileToMeta(file) {
  if (!file) return null;
  return {
    fileName: file.name,
    fileType: file.type || "Archivo",
    fileSize: file.size,
    fileCategory: file.type?.startsWith("image/") ? "image" : "pdf",
  };
}

function fileLabel(file) {
  if (!file) return "";
  const size = file.fileSize ? `${Math.max(1, Math.round(file.fileSize / 1024))} KB` : "";
  return `${file.fileName}${size ? ` · ${size}` : ""}`;
}

export default function Documents() {
  const { documents, participants = [], transports, lodgings, itineraryDays, expenses, addDocument, updateDocument, deleteDocument } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const uploaded = documents.filter((document) => ["subido", "Añadido"].includes(document.status)).length;
  const pending = documents.length - uploaded;
  const reservations = documents.filter((document) => document.type === "Reserva").length;
  const tickets = documents.filter((document) => document.type === "Billete").length;
  const participantDocs = useMemo(() => participants.map((participant) => ({
    participant,
    documents: documents.filter((document) => document.relatedToType === "participant" && document.relatedToId === participant.id),
  })), [documents, participants]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function relatedOptions() {
    if (form.relatedToType === "participant") return participants.map((item) => [item.id, item.name]);
    if (form.relatedToType === "transport") return transports.map((item, index) => [`transport-${index}`, item.route]);
    if (form.relatedToType === "accommodation") return lodgings.map((item, index) => [`lodging-${index}`, item.name]);
    if (form.relatedToType === "activity") return itineraryDays.flatMap((day) => day.items.map((item, index) => [`${day.day}-${index}`, `${day.day}: ${item.name}`]));
    if (form.relatedToType === "expense") return expenses.map((item, index) => [`expense-${index}`, item.name]);
    return [];
  }

  function openCreate() {
    setEditingIndex(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(document, index) {
    setEditingIndex(index);
    setForm({
      id: document.id,
      name: document.name || "",
      type: document.type || "Reserva",
      status: document.status || "subido",
      related: document.related || "",
      relatedToType: document.relatedToType || "trip",
      relatedToId: document.relatedToId || "",
      date: document.date || "",
      size: document.size || "",
      file: document.file || null,
      notes: document.notes || "",
    });
    setError("");
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name || !form.type || !form.relatedToType) {
      setError("Completa nombre, tipo y relación del documento.");
      return;
    }
    const selectedLabel = relatedOptions().find(([id]) => id === form.relatedToId)?.[1];
    const payload = { ...form, related: selectedLabel || form.related || "Viaje completo", size: form.file ? fileLabel(form.file) : form.size };
    if (editingIndex !== null) updateDocument(editingIndex, payload);
    else addDocument(payload);
    setModalOpen(false);
    setEditingIndex(null);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Archivo del viaje" title="Documentos" subtitle="Organiza billetes, reservas, seguros y documentación por viajero o elemento del viaje." actionLabel="Subir documento" icon={Upload} onAction={openCreate} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileCheck2} label="Documentos añadidos" value={uploaded} hint="Listos para consultar" accent="emerald" />
        <StatCard icon={FileUp} label="Pendientes" value={pending} hint="Requieren acción" accent="amber" />
        <StatCard icon={UserRound} label="Por persona" value={documents.filter((document) => document.relatedToType === "participant").length} hint="Documentación personal" />
        <StatCard icon={Ticket} label="Billetes" value={tickets} hint="Transporte principal" accent="violet" />
      </div>

      <FilterPills filters={filters} />

      <SectionCard title="Documentos por persona">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {participantDocs.map(({ participant, documents: docs }) => (
            <div key={participant.id} className="rounded-3xl border border-line bg-white p-5">
              <h3 className="text-lg font-black text-ink">{participant.name}</h3>
              {docs.length ? (
                <ul className="mt-4 grid gap-2 text-sm">
                  {docs.map((document) => (
                    <li key={document.id || document.name} className="rounded-2xl bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      {document.name} · {document.status ? document.status.charAt(0).toUpperCase() + document.status.slice(1) : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Sin documentos personales todavía.</p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Todos los documentos">
        {documents.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document, index) => (
              <DocumentCard key={`${document.id || document.name}-${index}`} document={document} onEdit={() => openEdit(document, index)} onDelete={() => setDeletingIndex(index)} />
            ))}
          </div>
        ) : (
          <EmptyState title="Aún no hay documentos" description="Añade billetes, reservas, entradas, seguros o recibos para tenerlos localizados dentro de este viaje." actionLabel="Añadir documento" onAction={openCreate} icon={FileUp} />
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingIndex(null); }} title={editingIndex !== null ? "Editar documento" : "Añadir documento"} description="Registra documentos del viaje y asígnalos a una persona o parte del viaje.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Nombre" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Pasaporte Alejandro" />
            <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>
              {["Billete", "Reserva", "Entrada", "Seguro", "Identificación", "Pasaporte", "DNI", "Factura", "Ticket", "Recibo"].map((type) => <option key={type}>{type}</option>)}
            </FormSelect>
            <FormSelect label="Estado" value={form.status} onChange={(event) => update("status", event.target.value)}>
              <option value="subido">Subido</option>
              <option value="pendiente">Pendiente</option>
              <option value="Añadido">Añadido</option>
            </FormSelect>
            <FormSelect label="Asociado a" value={form.relatedToType} onChange={(event) => update("relatedToType", event.target.value)}>
              <option value="trip">Viaje completo</option>
              <option value="participant">Participante</option>
              <option value="transport">Transporte</option>
              <option value="accommodation">Alojamiento</option>
              <option value="activity">Actividad</option>
              <option value="expense">Gasto</option>
              <option value="other">Otro</option>
            </FormSelect>
            {relatedOptions().length ? (
              <FormSelect label="Elemento relacionado" value={form.relatedToId} onChange={(event) => update("relatedToId", event.target.value)}>
                <option value="">Seleccionar</option>
                {relatedOptions().map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </FormSelect>
            ) : (
              <FormInput label="Relacionado con" value={form.related} onChange={(event) => update("related", event.target.value)} placeholder="Viaje completo / Otro" />
            )}
            <FormInput label="Fecha" value={form.date} onChange={(event) => update("date", event.target.value)} placeholder="10 mayo" />
          </div>
          <label className="block text-sm font-black text-ink">
            Archivo
            <input type="file" accept=".pdf,image/*" onChange={(event) => update("file", fileToMeta(event.target.files?.[0]))} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-primary-700 hover:file:bg-primary-100" />
          </label>
          {form.file ? <p className="rounded-xl bg-primary-50 px-3 py-2 text-sm font-bold text-primary-800">{fileLabel(form.file)}</p> : null}
          <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingIndex(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingIndex !== null ? "Guardar cambios" : "Guardar documento"}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={deletingIndex !== null} title="Eliminar documento" description="Vas a eliminar este documento del viaje. Esta acción no se puede deshacer en la demo." onCancel={() => setDeletingIndex(null)} onConfirm={() => { deleteDocument(deletingIndex); setDeletingIndex(null); }} />
    </div>
  );
}
