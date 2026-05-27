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
    <article
      className={`group overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-card-hover ${
        trip.archived ? "opacity-70" : ""
      }`}
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.cover}
          alt={trip.destination}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

        {/* Image overlay content */}
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/75">
              <MapPin size={12} /> {trip.destination}
            </p>
            <h3 className="mt-0.5 text-xl font-bold text-white leading-tight">{trip.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {trip.isExample && <Badge>Ejemplo</Badge>}
            <Badge dot>{trip.archived ? "Archivado" : countdown.status}</Badge>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Countdown + actions */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {countdown.label}
          </span>
          <ItemActions onEdit={onEdit} onDelete={onDelete} />
        </div>

        {/* Meta info */}
        <div className="mb-4 grid gap-2 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <CalendarDays size={14} className="text-slate-400 shrink-0" />
            {trip.dates || "Fechas por definir"}
          </span>
          <span className="flex items-center gap-2 font-semibold text-ink">
            <WalletCards size={14} className="text-slate-400 shrink-0" />
            {trip.budget || "Presupuesto sin definir"}
          </span>
          <span className="flex items-center gap-2">
            <CheckSquare size={14} className="text-slate-400 shrink-0" />
            {trip.pendingTasks ?? 0} tareas pendientes
          </span>
        </div>

        {/* Progress */}
        <ProgressBar value={trip.progress} label="Preparación" />

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="secondary-button justify-center px-3 py-2 text-xs"
            onClick={onDuplicate}
          >
            <Copy size={13} /> Duplicar
          </button>
          <button
            type="button"
            className="secondary-button justify-center px-3 py-2 text-xs"
            onClick={onArchive}
          >
            <Archive size={13} /> {trip.archived ? "Reactivar" : "Archivar"}
          </button>
        </div>

        {/* Open link */}
        <Link
          to={`/trips/${trip.id}/summary`}
          onClick={onOpen}
          className="mt-3 flex items-center justify-between rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
        >
          Abrir viaje
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
