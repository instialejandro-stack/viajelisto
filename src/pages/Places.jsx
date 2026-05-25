import React, { useState } from "react";
import { BookmarkCheck, MapPinned, Plus, Sparkles, Ticket } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FilterPills from "../components/FilterPills.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const filters = ["Todos", "Monumentos", "Museos", "Barrios", "Gratis", "Imprescindibles", "Requieren reserva"];
const initialForm = { name: "", category: "Monumento", priority: "Alta", price: "Gratis", duration: "", needsBooking: "no", mustSee: "no", day: "Sin asignar", zone: "", note: "" };

export default function Places() {
  const { places, activeTrip, addPlace, updatePlace, deletePlace } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const mustSee = places.filter((place) => place.mustSee).length;
  const needsBooking = places.filter((place) => place.needsBooking).length;
  const ticketCost = places.reduce((sum, place) => sum + (Number.parseInt(place.price, 10) || 0), 0);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreate() {
    setEditingIndex(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(place, index) {
    setEditingIndex(index);
    setForm({
      name: place.name || "",
      category: place.category || "Monumento",
      priority: place.priority || "Alta",
      price: place.price || "Gratis",
      duration: place.duration || "",
      needsBooking: place.needsBooking ? "sí" : "no",
      mustSee: place.mustSee ? "sí" : "no",
      day: place.day || "Sin asignar",
      zone: place.zone || "",
      note: place.note || "",
    });
    setError("");
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name || !form.category || !form.zone) {
      setError("Completa nombre, categoría y zona.");
      return;
    }
    if (editingIndex !== null) updatePlace(editingIndex, form);
    else addPlace(form);
    setModalOpen(false);
    setEditingIndex(null);
    setError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={`Explorar ${activeTrip?.destination || "el destino"}`}
        title="Lugares que visitar"
        subtitle="Organiza monumentos, museos, barrios, miradores y experiencias."
        actionLabel="Añadir lugar"
        icon={Plus}
        onAction={openCreate}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={MapPinned} label="Lugares guardados" value={places.length} hint="Priorizados por día" />
        <StatCard icon={Sparkles} label="Imprescindibles" value={mustSee} hint="No deberían faltar" accent="amber" />
        <StatCard icon={BookmarkCheck} label="Requieren reserva" value={needsBooking} hint="Comprar con antelación" accent="emerald" />
        <StatCard icon={Ticket} label="Coste entradas" value={`${ticketCost} €`} hint="Estimación actual" accent="violet" />
      </div>

      <FilterPills filters={filters} />

      <SectionCard title="Colección de lugares">
        {places.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {places.map((place, index) => (
              <PlaceCard key={`${place.name}-${index}`} place={place} onEdit={() => openEdit(place, index)} onDelete={() => setDeletingIndex(index)} />
            ))}
          </div>
        ) : (
          <EmptyState title="Aún no hay lugares guardados" description="Añade monumentos, barrios o experiencias para construir tu mapa del viaje." actionLabel="Añadir lugar" onAction={openCreate} icon={MapPinned} />
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingIndex(null); }} title={editingIndex !== null ? "Editar lugar" : "Añadir lugar"} description="Guarda puntos de interés asociados solo a este viaje.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Nombre" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Museo del Louvre" />
            <FormInput label="Zona" value={form.zone} onChange={(event) => update("zone", event.target.value)} placeholder="Centro" />
            <FormSelect label="Categoría" value={form.category} onChange={(event) => update("category", event.target.value)}>
              {["Monumento", "Museo", "Barrio", "Mirador", "Experiencia", "Gratis"].map((item) => <option key={item}>{item}</option>)}
            </FormSelect>
            <FormSelect label="Prioridad" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              {["Alta", "Media", "Baja"].map((item) => <option key={item}>{item}</option>)}
            </FormSelect>
            <FormInput label="Precio de entrada" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="Gratis" />
            <FormInput label="Duración aproximada" value={form.duration} onChange={(event) => update("duration", event.target.value)} placeholder="2 horas" />
            <FormInput label="Día asignado" value={form.day} onChange={(event) => update("day", event.target.value)} placeholder="Día 2" />
            <FormSelect label="Necesita reserva" value={form.needsBooking} onChange={(event) => update("needsBooking", event.target.value)}>
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </FormSelect>
            <FormSelect label="Imprescindible" value={form.mustSee} onChange={(event) => update("mustSee", event.target.value)}>
              <option value="no">No</option>
              <option value="sí">Sí</option>
            </FormSelect>
          </div>
          <FormTextarea label="Nota" value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Comprar entrada con antelación." />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingIndex(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingIndex !== null ? "Guardar cambios" : "Guardar lugar"}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={deletingIndex !== null}
        title="Eliminar lugar"
        description="Vas a eliminar este lugar del viaje. Esta acción no se puede deshacer en la demo."
        onCancel={() => setDeletingIndex(null)}
        onConfirm={() => {
          deletePlace(deletingIndex);
          setDeletingIndex(null);
        }}
      />
    </div>
  );
}
