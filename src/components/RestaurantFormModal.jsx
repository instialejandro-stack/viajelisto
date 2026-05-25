import React, { useEffect, useState } from "react";
import { FormError, FormInput, FormSelect, FormTextarea } from "./FormControls.jsx";
import Modal from "./Modal.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { name: "", food: "Italiano", area: "", near: "", price: "€€", rating: "", needsBooking: "no", day: "Sin asignar", mapsUrl: "", status: "pendiente", note: "" };

function toForm(restaurant) {
  if (!restaurant) return initialForm;
  return {
    name: restaurant.name || "",
    food: restaurant.food || "Italiano",
    area: restaurant.area || "",
    near: restaurant.near || "",
    price: restaurant.price || "€€",
    rating: restaurant.rating || "",
    needsBooking: restaurant.needsBooking ? "sí" : "no",
    day: restaurant.day || "Sin asignar",
    mapsUrl: restaurant.mapsUrl || "",
    status: restaurant.status || "pendiente",
    note: restaurant.note || "",
  };
}

export default function RestaurantFormModal({ open, onClose, restaurant, index }) {
  const { addRestaurant, updateRestaurant } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const editing = index !== undefined && index !== null;

  useEffect(() => {
    if (open) {
      setForm(toForm(restaurant));
      setError("");
    }
  }, [open, restaurant]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name) {
      setError("Completa el nombre del restaurante.");
      return;
    }
    if (editing) updateRestaurant(index, form);
    else addRestaurant(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar restaurante" : "Añadir restaurante"} description="Guarda restaurantes, cafeterías y sitios recomendados del viaje activo.">
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Nombre del restaurante" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Le Petit Paris" />
          <FormSelect label="Tipo de comida" value={form.food} onChange={(event) => update("food", event.target.value)}>
            {["Pasta", "Pizza", "Italiano", "Cafetería", "Comida rápida", "Local", "Otro"].map((type) => <option key={type}>{type}</option>)}
          </FormSelect>
          <FormInput label="Zona" value={form.area} onChange={(event) => update("area", event.target.value)} placeholder="Centro" />
          <FormInput label="Cerca de" value={form.near} onChange={(event) => update("near", event.target.value)} placeholder="Torre Eiffel" />
          <FormSelect label="Precio aproximado" value={form.price} onChange={(event) => update("price", event.target.value)}>
            <option>€</option>
            <option>€€</option>
            <option>€€€</option>
          </FormSelect>
          <FormInput label="Valoración" value={form.rating} onChange={(event) => update("rating", event.target.value)} placeholder="4.6" />
          <FormSelect label="Necesita reserva" value={form.needsBooking} onChange={(event) => update("needsBooking", event.target.value)}>
            <option value="no">No</option>
            <option value="sí">Sí</option>
          </FormSelect>
          <FormInput label="Día sugerido" value={form.day} onChange={(event) => update("day", event.target.value)} placeholder="Día 2" />
          <FormInput label="Enlace de Google Maps" value={form.mapsUrl} onChange={(event) => update("mapsUrl", event.target.value)} placeholder="https://maps.google.com/..." />
          <FormSelect label="Estado" value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="reservado">Reservado</option>
            <option value="probado">Probado</option>
            <option value="descartado">Descartado</option>
          </FormSelect>
        </div>
        <FormTextarea label="Plato recomendado / nota" value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Probar el menú del día." />
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button">{editing ? "Guardar cambios" : "Guardar restaurante"}</button>
        </div>
      </form>
    </Modal>
  );
}
