import React, { useEffect, useState } from "react";
import { FormError, FormInput, FormSelect, FormTextarea } from "./FormControls.jsx";
import Modal from "./Modal.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { name: "", type: "Hotel", address: "", zone: "", lat: "", lng: "", checkIn: "", checkOut: "", nights: "", price: "", status: "pendiente", services: "", days: "", bookingUrl: "", notes: "" };

function toForm(lodging) {
  if (!lodging) return initialForm;
  return {
    name: lodging.name || "",
    type: lodging.type || "Hotel",
    address: lodging.address || "",
    zone: lodging.zone || lodging.location?.zone || "",
    lat: lodging.location?.lat ?? "",
    lng: lodging.location?.lng ?? "",
    checkIn: lodging.checkIn || "",
    checkOut: lodging.checkOut || "",
    nights: lodging.nights || "",
    price: String(lodging.price || "").replace(/[^\d]/g, ""),
    status: lodging.status || "pendiente",
    services: (lodging.services || []).join(", "),
    days: lodging.days || "",
    bookingUrl: lodging.bookingUrl || "",
    notes: lodging.notes || "",
  };
}

export default function AccommodationFormModal({ open, onClose, lodging, index }) {
  const { addAccommodation, updateAccommodation } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const editing = index !== undefined && index !== null;

  useEffect(() => {
    if (open) {
      setForm(toForm(lodging));
      setError("");
    }
  }, [open, lodging]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name || !form.address) {
      setError("Completa nombre y dirección.");
      return;
    }
    if (editing) updateAccommodation(index, form);
    else addAccommodation(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar alojamiento" : "Añadir alojamiento"} description="Guarda hoteles, apartamentos y estancias del viaje activo.">
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Nombre del alojamiento" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Hotel París Centro" />
          <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>
            {["Hotel", "Apartamento", "Hostal", "Casa", "Otro"].map((type) => <option key={type}>{type}</option>)}
          </FormSelect>
          <FormInput label="Dirección" value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Rue de Rivoli" />
          <FormInput label="Zona" value={form.zone} onChange={(event) => update("zone", event.target.value)} placeholder="Centro" />
          <FormInput label="Latitud" type="number" step="any" value={form.lat} onChange={(event) => update("lat", event.target.value)} placeholder="40.8518" />
          <FormInput label="Longitud" type="number" step="any" value={form.lng} onChange={(event) => update("lng", event.target.value)} placeholder="14.2681" />
          <FormInput label="Check-in" value={form.checkIn} onChange={(event) => update("checkIn", event.target.value)} placeholder="3 junio, 15:00" />
          <FormInput label="Check-out" value={form.checkOut} onChange={(event) => update("checkOut", event.target.value)} placeholder="8 junio, 11:00" />
          <FormInput label="Noches" value={form.nights} onChange={(event) => update("nights", event.target.value)} placeholder="5 noches" />
          <FormInput label="Precio total" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="420" />
          <FormSelect label="Estado" value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="reservado">Reservado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </FormSelect>
          <FormInput label="Servicios/notas breves" value={form.services} onChange={(event) => update("services", event.target.value)} placeholder="Desayuno, recepción 24h" />
          <FormInput label="Días del viaje" value={form.days} onChange={(event) => update("days", event.target.value)} placeholder="Día 1 - Día final" />
          <FormInput label="Enlace de reserva" value={form.bookingUrl} onChange={(event) => update("bookingUrl", event.target.value)} placeholder="https://..." />
        </div>
        <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Cerca del centro, pedir habitación tranquila." />
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button">{editing ? "Guardar cambios" : "Guardar alojamiento"}</button>
        </div>
      </form>
    </Modal>
  );
}
