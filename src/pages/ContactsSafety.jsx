import React, { useState } from "react";
import { AlertTriangle, Phone, Plus, Shield, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const TABS = ["Contactos", "Emergencias y seguridad"];
const contactInitial = { name: "", type: "Alojamiento", phone: "", email: "", address: "", emergency: "no", notes: "" };
const emergencyInitial = { title: "", type: "Salud", value: "", priority: "alta", notes: "" };

export default function ContactsSafety() {
  const { contacts = [], emergencyInfo = [], addContact, deleteContact, addEmergencyInfo, deleteEmergencyInfo } = useAppState();
  const [tab, setTab] = useState(0);
  const [contactForm, setContactForm] = useState(contactInitial);
  const [emergencyForm, setEmergencyForm] = useState(emergencyInitial);
  const [contactError, setContactError] = useState("");
  const [emergencyError, setEmergencyError] = useState("");

  const emergencyContacts = contacts.filter((c) => c.emergency === "sí" || c.emergency === true);

  function updateContact(field, value) {
    setContactForm((c) => ({ ...c, [field]: value }));
  }

  function updateEmergency(field, value) {
    setEmergencyForm((c) => ({ ...c, [field]: value }));
  }

  function submitContact(event) {
    event.preventDefault();
    if (!contactForm.name.trim() || !contactForm.type) {
      setContactError("Completa nombre y tipo de contacto.");
      return;
    }
    addContact(contactForm);
    setContactForm(contactInitial);
    setContactError("");
  }

  function submitEmergency(event) {
    event.preventDefault();
    if (!emergencyForm.title.trim() || !emergencyForm.value.trim()) {
      setEmergencyError("Completa título y dato importante.");
      return;
    }
    addEmergencyInfo(emergencyForm);
    setEmergencyForm(emergencyInitial);
    setEmergencyError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Grupo y seguridad"
        title="Contactos y emergencias"
        subtitle="Guarda los contactos del viaje y datos críticos para consultar rápido si algo ocurre."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Phone} label="Contactos" value={contacts.length} hint="Guardados en el viaje" />
        <StatCard icon={AlertTriangle} label="De emergencia" value={emergencyContacts.length} hint="Contactos marcados como críticos" accent="amber" />
        <StatCard icon={Shield} label="Datos de seguridad" value={emergencyInfo.length} hint="Información guardada" accent="violet" />
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
          <SectionCard title="Añadir contacto">
            <form onSubmit={submitContact} className="grid gap-4">
              <FormError>{contactError}</FormError>
              <FormInput label="Nombre" value={contactForm.name} onChange={(e) => updateContact("name", e.target.value)} placeholder="Hotel, guía, familiar..." />
              <FormSelect label="Tipo" value={contactForm.type} onChange={(e) => updateContact("type", e.target.value)}>
                {["Alojamiento", "Guía", "Agencia", "Conductor", "Embajada", "Seguro", "Restaurante", "Alquiler de coche", "Emergencia", "Familiar", "Otro"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FormSelect>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Teléfono" value={contactForm.phone} onChange={(e) => updateContact("phone", e.target.value)} />
                <FormInput label="Email" value={contactForm.email} onChange={(e) => updateContact("email", e.target.value)} />
              </div>
              <FormInput label="Dirección" value={contactForm.address} onChange={(e) => updateContact("address", e.target.value)} />
              <FormSelect label="Contacto de emergencia" value={contactForm.emergency} onChange={(e) => updateContact("emergency", e.target.value)}>
                <option value="no">No</option>
                <option value="sí">Sí</option>
              </FormSelect>
              <FormTextarea label="Notas" value={contactForm.notes} onChange={(e) => updateContact("notes", e.target.value)} />
              <button className="primary-button justify-center">
                <Plus size={16} /> Guardar contacto
              </button>
            </form>
          </SectionCard>

          <SectionCard title={`Agenda (${contacts.length})`}>
            {contacts.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                  <article key={contact.id} className="rounded-3xl border border-line bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-primary-700">{contact.type}</p>
                          {(contact.emergency === "sí" || contact.emergency === true) && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700">
                              Emergencia
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 text-lg font-black text-ink">{contact.name}</h3>
                      </div>
                      <button
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      {contact.phone && (
                        <p className="rounded-xl bg-slate-50 px-3 py-2">
                          Tel. <strong className="text-ink">{contact.phone}</strong>
                        </p>
                      )}
                      {contact.email && (
                        <p className="rounded-xl bg-slate-50 px-3 py-2">
                          Email <strong className="text-ink">{contact.email}</strong>
                        </p>
                      )}
                      {contact.address && (
                        <p className="rounded-xl bg-slate-50 px-3 py-2">
                          Dir. <strong className="text-ink">{contact.address}</strong>
                        </p>
                      )}
                      {contact.notes && (
                        <p className="rounded-xl bg-primary-50 px-3 py-2 font-bold text-primary-800">{contact.notes}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin contactos" description="Añade contactos útiles del viaje para tenerlos localizados." />
            )}
          </SectionCard>
        </div>
      )}

      {tab === 1 && (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <SectionCard title="Añadir dato de seguridad">
            <form onSubmit={submitEmergency} className="grid gap-4">
              <FormError>{emergencyError}</FormError>
              <FormInput
                label="Título"
                value={emergencyForm.title}
                onChange={(e) => updateEmergency("title", e.target.value)}
                placeholder="Seguro, alergia, embajada..."
              />
              <FormSelect label="Tipo" value={emergencyForm.type} onChange={(e) => updateEmergency("type", e.target.value)}>
                {["Salud", "Seguro", "Documentación", "Embajada", "Dinero", "Otro"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FormSelect>
              <FormInput label="Dato importante" value={emergencyForm.value} onChange={(e) => updateEmergency("value", e.target.value)} />
              <FormSelect label="Prioridad" value={emergencyForm.priority} onChange={(e) => updateEmergency("priority", e.target.value)}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </FormSelect>
              <FormTextarea label="Notas" value={emergencyForm.notes} onChange={(e) => updateEmergency("notes", e.target.value)} />
              <button className="primary-button justify-center">
                <Plus size={16} /> Guardar dato
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Datos de emergencia">
            {emergencyInfo.length || emergencyContacts.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {emergencyInfo.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-line bg-white p-5">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-amber-700">
                          {item.type} · {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : ""}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-ink">{item.title}</h3>
                      </div>
                      <button
                        onClick={() => deleteEmergencyInfo(item.id)}
                        className="rounded-xl p-2 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <p className="mt-4 rounded-2xl bg-amber-50 p-3 font-black text-amber-900">{item.value}</p>
                    {item.notes && <p className="mt-3 text-sm text-slate-500">{item.notes}</p>}
                  </article>
                ))}
                {emergencyContacts.map((contact) => (
                  <article key={contact.id} className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                    <p className="text-sm font-black text-amber-700">Contacto de emergencia</p>
                    <h3 className="mt-1 text-lg font-black text-ink">{contact.name}</h3>
                    <p className="mt-3 font-black text-amber-900">{contact.phone || contact.email}</p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sin datos de emergencia"
                description="Añade seguros, teléfonos, alergias o datos importantes."
              />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
