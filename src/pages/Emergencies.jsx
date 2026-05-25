import React, { useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { title: "", type: "Salud", value: "", priority: "alta", notes: "" };

export default function Emergencies() {
  const { emergencyInfo = [], contacts = [], addEmergencyInfo, deleteEmergencyInfo } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const emergencyContacts = contacts.filter((contact) => contact.emergency);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.value.trim()) {
      setError("Completa título y dato importante.");
      return;
    }
    addEmergencyInfo(form);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Seguridad" title="Emergencias" subtitle="Guarda datos críticos del viaje para consultarlos rápido si algo ocurre." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={AlertTriangle} label="Datos importantes" value={emergencyInfo.length} hint="Guardados" accent="amber" />
        <StatCard icon={AlertTriangle} label="Contactos emergencia" value={emergencyContacts.length} hint="Desde agenda" />
        <StatCard icon={AlertTriangle} label="Alta prioridad" value={emergencyInfo.filter((item) => item.priority === "alta").length} hint="Revisar antes de salir" accent="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Añadir dato">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Título" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Seguro, alergia, embajada..." />
            <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>{["Salud", "Seguro", "Documentación", "Embajada", "Dinero", "Otro"].map((type) => <option key={type}>{type}</option>)}</FormSelect>
            <FormInput label="Dato importante" value={form.value} onChange={(event) => update("value", event.target.value)} />
            <FormSelect label="Prioridad" value={form.priority} onChange={(event) => update("priority", event.target.value)}><option value="alta">alta</option><option value="media">media</option><option value="baja">baja</option></FormSelect>
            <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
            <button className="primary-button justify-center"><Plus size={16} /> Guardar</button>
          </form>
        </SectionCard>
        <SectionCard title="Datos de emergencia">
          {emergencyInfo.length || emergencyContacts.length ? <div className="grid gap-4 md:grid-cols-2">
            {emergencyInfo.map((item) => <article key={item.id} className="rounded-3xl border border-line bg-white p-5"><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-amber-700">{item.type} · {item.priority}</p><h3 className="mt-1 text-lg font-black text-ink">{item.title}</h3></div><button onClick={() => deleteEmergencyInfo(item.id)} className="rounded-xl p-2 text-slate-400 hover:text-rose-600"><Trash2 size={17} /></button></div><p className="mt-4 rounded-2xl bg-amber-50 p-3 font-black text-amber-900">{item.value}</p><p className="mt-3 text-sm text-slate-500">{item.notes}</p></article>)}
            {emergencyContacts.map((contact) => <article key={contact.id} className="rounded-3xl border border-amber-100 bg-amber-50 p-5"><p className="text-sm font-black text-amber-700">Contacto de emergencia</p><h3 className="mt-1 text-lg font-black text-ink">{contact.name}</h3><p className="mt-3 font-black text-amber-900">{contact.phone || contact.email}</p></article>)}
          </div> : <EmptyState title="Sin datos de emergencia" description="Añade seguros, teléfonos, alergias o datos importantes." />}
        </SectionCard>
      </div>
    </div>
  );
}
