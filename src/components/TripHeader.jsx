import React from "react";
import { CalendarDays, MapPin, Users, WalletCards } from "lucide-react";
import Badge from "./Badge.jsx";
import ProgressBar from "./ProgressBar.jsx";

export default function TripHeader({ trip }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft">
      <div className="grid lg:grid-cols-[1fr_420px]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black uppercase text-primary-700">Panel del viaje</p>
            <Badge>{trip.status}</Badge>
          </div>
          <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{trip.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Todo lo importante para salir con reservas, presupuesto y plan diario bajo control.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <MapPin size={16} /> {trip.destination}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <CalendarDays size={16} /> {trip.dates}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <Users size={16} /> {trip.people}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <WalletCards size={16} /> {trip.budget}
            </span>
          </div>
          <div className="mt-7 max-w-xl">
            <ProgressBar value={trip.progress} label="Preparación del viaje" />
          </div>
        </div>
        <div
          className="relative min-h-72 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.cover || "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1000&q=80"})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/30 bg-white/90 p-4 shadow-soft backdrop-blur">
            <p className="text-xs font-black uppercase text-slate-400">Presupuesto estimado</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-3xl font-black text-ink">{trip.budget}</p>
              <p className="text-sm font-bold text-slate-500">{trip.spent} gastados</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
