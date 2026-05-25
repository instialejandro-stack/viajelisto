import React from "react";
import { CalendarDays, Map, MapPin, Star, Utensils } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

export default function RestaurantCard({ restaurant, onEdit, onDelete }) {
  return (
    <article className="card p-5 transition hover:-translate-y-1 hover:border-primary-200">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Utensils size={22} />
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
            <Star size={14} fill="currentColor" /> {restaurant.rating || "s/v"}
          </span>
          {restaurant.status && <Badge>{restaurant.status}</Badge>}
          <ItemActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500">{restaurant.food}</p>
      <h2 className="mt-1 text-xl font-black text-ink">{restaurant.name}</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <MapPin size={15} /> {restaurant.area}
      </p>
      <div className="mt-5 grid gap-2 text-sm">
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
          Cerca de <strong className="text-ink">{restaurant.near}</strong>
        </p>
        <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Precio</span>
          <strong>{restaurant.price}</strong>
        </p>
        <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Reserva</span>
          <strong>{restaurant.needsBooking ? "Sí" : "No"}</strong>
        </p>
        <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
          <span className="flex items-center gap-2 text-slate-500"><CalendarDays size={15} /> Día sugerido</span>
          <strong>{restaurant.day}</strong>
        </p>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{restaurant.note}</p>
      <button className="secondary-button mt-5 w-full">
        <Map size={16} /> Google Maps
      </button>
    </article>
  );
}
