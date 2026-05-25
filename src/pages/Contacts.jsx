import React, { useState } from "react";
import { Phone, Plus, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { name: "", type: "Alojamiento", phone: "", email: "", address: "", relatedToType: "other", relatedToId: "", emergency: "no", notes: "" };

export default function Contacts() {
  const { contacts = [], addContact, deleteContact } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const emergencyCount = contacts.filter((contact) => contact.emergency).length;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.type) {
      setError("Completa nombre y tipo de contacto.");
      return;
    }
    addContact(form);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Datos útiles" title="Contactos" subtitle="Guarda teléfonos, emails y direcciones importantes relacionados con el viaje." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Phone} label="Contactos" value={contacts.length} hint="Guardados" />
        <StatCard icon={Phone} label="Emergencia" value={emergencyCount} hint="Marcados como críticos" accent="amber" />
        <StatCard icon={Phone} label="Tipos" value={new Set(contacts.map((contact) => contact.type)).size} hint="Categorías" accent="emerald" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard title="Añadir contacto">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput label="Nombre" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Hotel, guía, familiar..." />
            <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>
              {["Alojamiento", "Guía", "Agencia", "Conductor", "Embajada", "Seguro", "Restaurante", "Alquiler de coche", "Emergencia", "Familiar", "Otro"].map((type) => <option key={type}>{type}</option>)}
            </FormSelect>
            <FormInput label="Teléfono" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            <FormInput label="Email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            <FormInput label="Dirección" value={form.address} onChange={(event) => update("address", event.target.value)} />
            <FormSelect label="Contacto de emergencia" value={form.emergency} onChange={(event) => update("emergency", event.target.value)}><option value="no">no</option><option value="sí">sí</option></FormSelect>
            <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
            <button className="primary-button justify-center"><Plus size={16} /> Guardar contacto</button>
          </form>
        </SectionCard>
        <SectionCard title="Agenda de contactos">
          {contacts.length ? <div className="grid gap-4 md:grid-cols-2">{contacts.map((contact) => (
            <article key={contact.id} className="rounded-3xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-black text-primary-700">{contact.type}</p><h3 className="mt-1 text-lg font-black text-ink">{contact.name}</h3></div>
                <button className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => deleteContact(contact.id)}><Trash2 size={17} /></button>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                {contact.phone && <p className="rounded-xl bg-slate-50 px-3 py-2">Tel. <strong className="text-ink">{contact.phone}</strong></p>}
                {contact.email && <p className="rounded-xl bg-slate-50 px-3 py-2">Email <strong className="text-ink">{contact.email}</strong></p>}
                {contact.address && <p className="rounded-xl bg-slate-50 px-3 py-2">Dirección <strong className="text-ink">{contact.address}</strong></p>}
                {contact.notes && <p className="rounded-xl bg-primary-50 px-3 py-2 font-bold text-primary-800">{contact.notes}</p>}
              </div>
            </article>
          ))}</div> : <EmptyState title="Sin contactos" description="Añade contactos útiles del viaje para tenerlos localizados." />}
        </SectionCard>
      </div>
    </div>
  );
}
