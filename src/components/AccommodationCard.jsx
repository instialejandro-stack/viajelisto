import React from "react";
import { ArrowRight, BedDouble, CalendarDays, MapPin, Moon, WalletCards } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

export default function AccommodationCard({ lodging, onEdit, onDelete }) {
  return (
    <article className="card overflow-hidden">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-h-72 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <BedDouble size={22} />
              </span>
              <p className="text-sm font-bold text-slate-500">{lodging.type}</p>
              <h2 className="mt-1 text-2xl font-black text-ink">{lodging.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={15} /> {lodging.address}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{lodging.status}</Badge>
              <ItemActions onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info icon={CalendarDays} label="Check-in" value={lodging.checkIn} />
            <Info icon={CalendarDays} label="Check-out" value={lodging.checkOut} />
            <Info icon={Moon} label="Noches" value={lodging.nights} />
            <Info icon={WalletCards} label="Precio total" value={lodging.price} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(lodging.services || []).map((service) => (
              <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{service}</span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">{lodging.notes}</p>
          <button className="secondary-button mt-5">
            Ver reserva <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
        <Icon size={14} /> {label}
      </p>
      <p className="mt-2 text-sm font-black text-ink">{value}</p>
    </div>
  );
}
