import React, { useEffect, useState } from "react";
import { FormError, FormInput, FormSelect, FormTextarea } from "./FormControls.jsx";
import Modal from "./Modal.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { type: "Vuelo", origin: "", destination: "", date: "", departure: "", arrival: "", company: "", price: "", status: "pendiente", locator: "", notes: "" };

function toForm(transport) {
  if (!transport) return initialForm;
  return {
    type: transport.type || "Vuelo",
    origin: transport.origin || "",
    destination: transport.destination || "",
    date: transport.date || "",
    departure: transport.departure || transport.time || "",
    arrival: transport.arrival || "",
    company: transport.company || "",
    price: String(transport.price || "").replace(/[^\d]/g, ""),
    status: transport.status || "pendiente",
    locator: transport.locator || "",
    notes: transport.notes || "",
  };
}

export default function TransportFormModal({ open, onClose, transport, index }) {
  const { addTransport, updateTransport } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const editing = index !== undefined && index !== null;

  useEffect(() => {
    if (open) {
      setForm(toForm(transport));
      setError("");
    }
  }, [open, transport]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.type || !form.origin || !form.destination) {
      setError("Completa tipo, origen y destino.");
      return;
    }
    if (editing) updateTransport(index, form);
    else addTransport(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar transporte" : "Añadir transporte"} description="Guarda vuelos, trenes, autobuses y desplazamientos del viaje activo.">
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Tipo de transporte" value={form.type} onChange={(event) => update("type", event.target.value)}>
            {["Vuelo", "Tren", "Autobús", "Ferry", "Coche", "Taxi", "Metro", "Otro"].map((type) => <option key={type}>{type}</option>)}
          </FormSelect>
          <FormInput label="Compañía" value={form.company} onChange={(event) => update("company", event.target.value)} placeholder="Ryanair" />
          <FormInput label="Origen" value={form.origin} onChange={(event) => update("origin", event.target.value)} placeholder="Madrid" />
          <FormInput label="Destino" value={form.destination} onChange={(event) => update("destination", event.target.value)} placeholder="París" />
          <FormInput label="Fecha" value={form.date} onChange={(event) => update("date", event.target.value)} placeholder="3 junio" />
          <FormInput label="Hora salida" type="time" value={form.departure} onChange={(event) => update("departure", event.target.value)} />
          <FormInput label="Hora llegada" type="time" value={form.arrival} onChange={(event) => update("arrival", event.target.value)} />
          <FormInput label="Precio" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="150" />
          <FormSelect label="Estado" value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="comprado">Comprado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </FormSelect>
          <FormInput label="Localizador" value={form.locator} onChange={(event) => update("locator", event.target.value)} placeholder="FR2026PAR" />
        </div>
        <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Revisar equipaje y terminal." />
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button">{editing ? "Guardar cambios" : "Guardar transporte"}</button>
        </div>
      </form>
    </Modal>
  );
}
