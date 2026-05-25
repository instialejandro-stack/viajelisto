import React from "react";
import { ArrowRight, Bus, CalendarDays, Clock, Hash, Plane, TrainFront, WalletCards } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

const icons = {
  Vuelo: Plane,
  Tren: TrainFront,
  Bus: Bus,
};

export default function TransportCard({ transport, onEdit, onDelete }) {
  const Icon = icons[transport.type] || Bus;

  return (
    <article className="card group overflow-hidden p-5 transition hover:-translate-y-1 hover:border-primary-200">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <Icon size={22} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-500">{transport.type}</p>
            <h2 className="text-xl font-black text-ink">{transport.origin} → {transport.destination}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{transport.status}</Badge>
          <ItemActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <CalendarDays size={15} /> {transport.date}
        </p>
        <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <Clock size={15} /> {transport.departure} - {transport.arrival}
        </p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">{transport.company}</p>
        <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <WalletCards size={15} /> {transport.price}
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-line bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Hash size={15} /> Localizador: <span className="text-ink">{transport.locator}</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{transport.notes}</p>
      </div>
      <button className="secondary-button mt-5 w-full justify-between">
        Ver detalles <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </button>
    </article>
  );
}
