import React from "react";
import { BedDouble, Clock, Footprints, MapPin, Plane, Sparkles, Soup, Ticket } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

const typeConfig = {
  Transporte: { icon: Plane, color: "bg-sky-50 text-sky-700" },
  Visita: { icon: Ticket, color: "bg-violet-50 text-violet-700" },
  Comida: { icon: Soup, color: "bg-amber-50 text-amber-700" },
  Alojamiento: { icon: BedDouble, color: "bg-emerald-50 text-emerald-700" },
  Experiencia: { icon: Sparkles, color: "bg-fuchsia-50 text-fuchsia-700" },
};

export default function ItineraryActivityCard({ item, onEdit, onDelete }) {
  const config = typeConfig[item.type] || typeConfig.Experiencia;
  const Icon = config.icon;

  return (
    <article className="group relative grid gap-3 border-l border-line pb-5 pl-5 last:pb-0 sm:grid-cols-[88px_1fr]">
      <span className="absolute -left-2 top-2 h-4 w-4 rounded-full border-4 border-white bg-primary-500 shadow" />
      <time className="pt-1 text-sm font-black text-primary-700">{item.time}</time>
      <div className="rounded-3xl border border-line bg-white p-4 shadow-sm transition group-hover:border-primary-200 group-hover:shadow-soft sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.color}`}>
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-black text-ink">{item.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={15} /> {item.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{item.type}</Badge>
            <ItemActions onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
          <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">
            <Clock size={15} /> {item.duration}
          </span>
          <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">
            <Footprints size={15} /> {item.travelTime || "Sin traslado"}
          </span>
          <span className="rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">{item.cost}</span>
          <span className="rounded-xl bg-primary-50 px-3 py-2 font-semibold text-primary-800 sm:col-span-1">{item.notes}</span>
        </div>
      </div>
    </article>
  );
}
