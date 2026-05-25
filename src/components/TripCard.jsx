import React from "react";
import { Archive, ArrowRight, CalendarDays, CheckSquare, Copy, MapPin, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";
import ProgressBar from "./ProgressBar.jsx";
import { getTripCountdown } from "../utils/tripIntelligence.js";

export default function TripCard({ trip, onArchive, onDuplicate, onEdit, onDelete, onOpen }) {
  const countdown = getTripCountdown(trip);
  return (
    <article className={`card group overflow-hidden transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_24px_70px_rgba(24,39,75,0.12)] ${trip.archived ? "opacity-75" : ""}`}>
      <div className="relative h-44 overflow-hidden">
        <img src={trip.cover} alt={trip.destination} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-white/80">
              <MapPin size={14} /> {trip.destination}
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">{trip.name}</h3>
          </div>
          <Badge>{trip.archived ? "Archivado" : countdown.status}</Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">{countdown.label}</span>
          <ItemActions onEdit={onEdit} onDelete={onDelete} />
        </div>
        <div className="mb-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} /> {trip.dates}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            <WalletCards size={15} /> {trip.budget}
          </span>
          <span className="flex items-center gap-1.5 sm:col-span-2">
            <CheckSquare size={15} /> {trip.pendingTasks ?? 0} tareas pendientes
          </span>
        </div>
        <ProgressBar value={trip.progress} label="Preparación" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="secondary-button justify-center px-3 py-2 text-xs" onClick={onDuplicate}>
            <Copy size={14} /> Duplicar
          </button>
          <button type="button" className="secondary-button justify-center px-3 py-2 text-xs" onClick={onArchive}>
            <Archive size={14} /> {trip.archived ? "Reactivar" : "Archivar"}
          </button>
        </div>
        <Link to={`/trips/${trip.id}/summary`} onClick={onOpen} className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-primary-700 transition hover:bg-primary-50">
          Abrir viaje
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
