import React from "react";
import { CalendarDays, Clock, MapPin, Sparkles, Ticket } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

export default function PlaceCard({ place, onEdit, onDelete }) {
  return (
    <article className="card p-5 transition hover:-translate-y-1 hover:border-primary-200">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <MapPin size={22} />
        </span>
        <div className="flex flex-col items-end gap-2">
          <Badge>{place.priority}</Badge>
          <ItemActions onEdit={onEdit} onDelete={onDelete} />
          {place.mustSee && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
              <Sparkles size={13} /> Imprescindible
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500">{place.category}</p>
      <h2 className="mt-1 text-xl font-black text-ink">{place.name}</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <MapPin size={15} /> {place.zone}
      </p>
      <div className="mt-5 grid gap-2 text-sm">
        <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
          <span className="flex items-center gap-2 text-slate-500"><Ticket size={15} /> Entrada</span>
          <strong>{place.price}</strong>
        </p>
        <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
          <span className="flex items-center gap-2 text-slate-500"><Clock size={15} /> Duración</span>
          <strong>{place.duration}</strong>
        </p>
        <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
          <span className="flex items-center gap-2 text-slate-500"><CalendarDays size={15} /> Día</span>
          <strong>{place.day}</strong>
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${place.needsBooking ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          Reserva: {place.needsBooking ? "Sí" : "No"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{place.note}</p>
    </article>
  );
}
