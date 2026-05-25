import React, { useEffect, useState } from "react";
import { FormError, FormInput, FormSelect } from "./FormControls.jsx";
import Modal from "./Modal.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { formatDateRange, parseTripDateRange } from "../utils/dateUtils.js";

const initialForm = {
  name: "",
  destination: "",
  dates: "",
  startDate: "",
  endDate: "",
  people: "2",
  budget: "",
  status: "Idea",
  templateId: "",
};

function tripToForm(trip) {
  if (!trip) return initialForm;
  const range = parseTripDateRange(trip.dates, {
    startDate: trip.startDate,
    endDate: trip.endDate,
  });
  return {
    name: trip.name || "",
    destination: trip.destination || "",
    dates: trip.dates || "",
    startDate: range.startDate || "",
    endDate: range.endDate || "",
    people: String(trip.people || "2").replace(/[^\d]/g, "") || "2",
    budget: String(trip.budget || "").replace(/[^\d]/g, ""),
    status: trip.status || "Idea",
    templateId: "",
  };
}

export default function TripFormModal({ open, onClose, trip }) {
  const { addTrip, updateTrip, tripTemplates = [] } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const editing = Boolean(trip);

  useEffect(() => {
    if (open) {
      setForm(tripToForm(trip));
      setError("");
    }
  }, [open, trip]);

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if ((field === "startDate" || field === "endDate") && next.startDate && next.endDate) {
        next.dates = formatDateRange(next.startDate, next.endDate);
      }
      return next;
    });
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name || !form.destination || (!form.dates && (!form.startDate || !form.endDate)) || !form.budget) {
      setError("Completa nombre, destino, fechas y presupuesto para guardar el viaje.");
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
      return;
    }
    if (editing) updateTrip(trip.id, form);
    else addTrip(form);
    setForm(initialForm);
    setError("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar viaje" : "Crear nuevo viaje"} description={editing ? "Actualiza los datos principales del viaje." : "Añade un viaje a tu dashboard para empezar a organizarlo."}>
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Nombre del viaje" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Roma 2026" />
          <FormInput label="Destino" value={form.destination} onChange={(event) => update("destination", event.target.value)} placeholder="Roma, Italia" />
          <FormInput label="Fecha inicio" type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
          <FormInput label="Fecha fin" type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} />
          <FormInput label="Fechas" value={form.dates} onChange={(event) => update("dates", event.target.value)} placeholder="10 mayo - 15 mayo" />
          <FormInput label="Personas" type="number" min="1" value={form.people} onChange={(event) => update("people", event.target.value)} />
          <FormInput label="Presupuesto estimado" value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="900" />
          <FormSelect label="Estado" value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option>Idea</option>
            <option>En planificación</option>
            <option>Confirmado</option>
          </FormSelect>
          {!editing && (
            <FormSelect label="Crear desde plantilla" value={form.templateId} onChange={(event) => update("templateId", event.target.value)}>
              <option value="">Sin plantilla</option>
              {tripTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </FormSelect>
          )}
        </div>
        {!editing && form.templateId ? (
          <div className="rounded-2xl bg-primary-50 p-4 text-sm text-primary-900">
            <p className="font-black">{tripTemplates.find((template) => template.id === form.templateId)?.name}</p>
            <p className="mt-1 font-semibold">Incluye checklist, maleta, documentos y tareas base para empezar más rápido.</p>
          </div>
        ) : null}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button">{editing ? "Guardar cambios" : "Guardar viaje"}</button>
        </div>
      </form>
    </Modal>
  );
}
