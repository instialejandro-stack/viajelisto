import React, { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, Clock, Footprints, Lightbulb, Plus, ReceiptText, Route } from "lucide-react";
import { Link } from "react-router-dom";
import DayTabs from "../components/DayTabs.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import ItineraryActivityCard from "../components/ItineraryActivityCard.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { getAccommodationIssues, getItineraryIssues } from "../utils/tripIntelligence.js";

export default function Itinerary() {
  const { itineraryDays, lodgings, activeTrip, activeTripId, addActivity, updateActivity, deleteActivity } = useAppState();
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    day: itineraryDays[0]?.day || "Día 1",
    time: "",
    name: "",
    type: "Visita",
    address: "",
    duration: "",
    travelTime: "",
    cost: "",
    notes: "",
  });
  const day = itineraryDays[active] || itineraryDays[0];
  const itineraryIssues = getItineraryIssues(itineraryDays);
  const dayIssues = itineraryIssues.filter((issue) => issue.title.includes(day?.day));
  const lodgingIssues = getAccommodationIssues(activeTrip, lodgings);

  useEffect(() => {
    setActive(0);
  }, [activeTripId]);

  useEffect(() => {
    if (active >= itineraryDays.length) setActive(0);
  }, [active, itineraryDays.length]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openModal() {
    setEditingActivity(null);
    setForm((current) => ({ ...current, day: day?.day || "Día 1" }));
    setModalOpen(true);
  }

  function openEdit(item, index) {
    setEditingActivity({ day: day.day, index });
    setForm({
      day: day.day,
      time: item.time || "",
      name: item.name || "",
      type: item.type || "Visita",
      address: item.address || "",
      duration: item.duration || "",
      travelTime: item.travelTime || "",
      cost: item.cost || "",
      notes: item.notes || "",
    });
    setError("");
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.day || !form.time || !form.name || !form.type || !form.address) {
      setError("Completa día, hora, nombre, tipo y dirección o zona.");
      return;
    }
    if (editingActivity) updateActivity(editingActivity.day, editingActivity.index, form);
    else addActivity(form);
    setError("");
    setModalOpen(false);
    setEditingActivity(null);
    const nextIndex = itineraryDays.findIndex((item) => item.day === form.day);
    if (nextIndex >= 0) setActive(nextIndex);
    setForm({ day: form.day, time: "", name: "", type: "Visita", address: "", duration: "", travelTime: "", cost: "", notes: "" });
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft">
        <div className="grid lg:grid-cols-[1fr_360px]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-black uppercase text-primary-700">Agenda del viaje</p>
            <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-4xl font-black text-ink sm:text-5xl">Itinerario de {activeTrip?.name || "tu viaje"}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-slate-500">
                  <CalendarDays size={17} /> {activeTrip?.dates || "Fechas por definir"} · {itineraryDays.length} días organizados
                </p>
              </div>
              <button className="primary-button shrink-0 px-5 py-3" onClick={openModal}>
                <Plus size={18} /> Añadir actividad
              </button>
            </div>
          </div>
          <div className="border-t border-line bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_72%)] p-6 lg:border-l lg:border-t-0">
            <div className="rounded-3xl border border-primary-100 bg-white/85 p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Día seleccionado</p>
              <h2 className="mt-2 text-2xl font-black text-ink">{day.day}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{day.title}</p>
              <p className="mt-4 text-sm leading-6 text-slate-500">{day.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <DayTabs days={itineraryDays} active={active} onChange={setActive} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Route} label="Actividades" value={day.items.length} hint="Planificadas para este día" />
        <StatCard icon={ReceiptText} label="Coste estimado" value={day.estimatedCost} hint="Sin compras opcionales" accent="violet" />
        <StatCard icon={Footprints} label="Movimiento" value={day.movement} hint="Caminando o transporte" accent="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title={`${day.day}: ${day.title}`}>
          <div className="mb-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-black uppercase text-slate-400">{day.date}</p>
            <h2 className="mt-2 text-2xl font-black text-ink">{day.title}</h2>
            <p className="mt-2 leading-7 text-slate-500">{day.summary}</p>
          </div>
          {day.items.length ? (
            <div>
              {day.items.map((item, index) => (
                <ItineraryActivityCard
                  key={`${item.time}-${item.name}`}
                  item={item}
                  onEdit={() => openEdit(item, index)}
                  onDelete={() => setDeletingActivity({ day: day.day, index, name: item.name })}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No hay actividades en este día" description="Añade la primera actividad para construir el itinerario." actionLabel="Añadir actividad" onAction={openModal} icon={Plus} />
          )}
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Resumen del día">
            <div className="grid gap-3">
              <div className="rounded-2xl bg-primary-50 p-4">
                <p className="text-sm font-bold text-primary-700">Total de actividades</p>
                <p className="mt-1 text-3xl font-black text-ink">{day.items.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Coste estimado</p>
                <p className="mt-1 text-2xl font-black text-ink">{day.estimatedCost}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Tiempo caminando/transporte</p>
                <p className="mt-1 text-lg font-black text-ink">{day.movement}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recomendación">
            <div className="rounded-3xl bg-ink p-5 text-white">
              <Clock className="mb-4 text-primary-100" size={22} />
              <p className="text-sm leading-6 text-slate-200">{day.recommendation}</p>
            </div>
          </SectionCard>

          <SectionCard title="Revisión automática">
            <div className="rounded-3xl bg-primary-50 p-5">
              <Lightbulb className="mb-4 text-primary-700" size={22} />
              <h3 className="font-black text-ink">Revisión automática</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Detecta días cargados, actividades cercanas y tareas relacionadas.</p>
              <Link to={`/trips/${activeTripId}/suggestions`} className="primary-button mt-5 w-full">
                Revisar itinerario
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Solapes y noches">
            <div className="grid gap-3">
              {[...dayIssues, ...lodgingIssues].slice(0, 5).map((issue) => (
                <div key={`${issue.title}-${issue.detail}`} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={18} />
                    <div>
                      <p className="font-black text-ink">{issue.title}</p>
                      <p className="mt-1 text-sm text-amber-800">{issue.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
              {![...dayIssues, ...lodgingIssues].length ? (
                <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">No se detectan solapes ni noches sin alojamiento para este viaje.</p>
              ) : null}
            </div>
          </SectionCard>
        </aside>
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingActivity(null); }} title={editingActivity ? "Editar actividad" : "Añadir actividad"} description="Crea o ajusta una actividad del timeline del día elegido.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect label="Día" value={form.day} onChange={(event) => update("day", event.target.value)}>
              {itineraryDays.map((item) => <option key={item.day}>{item.day}</option>)}
            </FormSelect>
            <FormInput label="Hora" type="time" value={form.time} onChange={(event) => update("time", event.target.value)} />
            <FormInput label="Nombre" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Paseo por Piazza Navona" />
            <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>
              {["Transporte", "Visita", "Comida", "Alojamiento", "Experiencia"].map((type) => <option key={type}>{type}</option>)}
            </FormSelect>
            <FormInput label="Dirección o zona" value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Centro histórico" />
            <FormInput label="Duración estimada" value={form.duration} onChange={(event) => update("duration", event.target.value)} placeholder="1 h" />
            <FormInput label="Tiempo desde el punto anterior" value={form.travelTime} onChange={(event) => update("travelTime", event.target.value)} placeholder="15 min caminando" />
            <FormInput label="Coste estimado" value={form.cost} onChange={(event) => update("cost", event.target.value)} placeholder="Gratis" />
          </div>
          <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Consejo breve para recordar durante el viaje" />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingActivity(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingActivity ? "Guardar cambios" : "Guardar actividad"}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deletingActivity)}
        title="Eliminar actividad"
        description={`Vas a eliminar ${deletingActivity?.name || "esta actividad"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingActivity(null)}
        onConfirm={() => {
          deleteActivity(deletingActivity.day, deletingActivity.index);
          setDeletingActivity(null);
        }}
      />
    </div>
  );
}
