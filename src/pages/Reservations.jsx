import React, { useMemo } from "react";
import { CheckCircle2, FileText, Hotel, Plane, Soup, Ticket } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function Reservations() {
  const { activeTripId, transports, lodgings, restaurants, places, documents, reservationChecks = {}, toggleReservationCheck } = useAppState();
  const reservations = useMemo(() => [
    ...transports.map((item, index) => ({ key: `transport-${index}`, title: `${item.type} ${item.route}`, meta: `${item.date} · ${item.company || "Sin compañía"}`, status: item.status, icon: Plane })),
    ...lodgings.map((item, index) => ({ key: `lodging-${index}`, title: item.name, meta: `${item.checkIn} - ${item.checkOut}`, status: item.status, icon: Hotel })),
    ...restaurants.filter((item) => item.needsBooking).map((item, index) => ({ key: `restaurant-${index}`, title: item.name, meta: `${item.area} · ${item.day}`, status: item.status || item.booking, icon: Soup })),
    ...places.filter((item) => item.needsBooking).map((item, index) => ({ key: `place-${index}`, title: item.name, meta: `${item.day} · ${item.price}`, status: item.booking, icon: Ticket })),
    ...documents.filter((item) => ["Billete", "Reserva", "Entrada"].includes(item.type)).map((item, index) => ({ key: `document-${index}`, title: item.name, meta: item.related, status: item.status, icon: FileText })),
  ], [transports, lodgings, restaurants, places, documents]);
  const reviewed = reservations.filter((item) => reservationChecks[item.key]).length;
  const pending = reservations.filter((item) => !reservationChecks[item.key]).length;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Control del viaje" title="Reservas" subtitle="Revisa transportes, alojamientos, entradas, restaurantes y documentos vinculados." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Ticket} label="Reservas detectadas" value={reservations.length} hint="En este viaje" />
        <StatCard icon={CheckCircle2} label="Revisadas" value={reviewed} hint="Marcadas como comprobadas" accent="emerald" />
        <StatCard icon={Ticket} label="Pendientes de revisar" value={pending} hint="Antes de salir" accent="amber" />
      </div>

      <SectionCard title="Control de reservas">
        {reservations.length ? (
          <div className="grid gap-3">
            {reservations.map((reservation) => {
              const Icon = reservation.icon;
              const checked = Boolean(reservationChecks[reservation.key]);
              return (
                <article key={reservation.key} className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${checked ? "border-emerald-100 bg-emerald-50/70" : "border-line bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <Icon size={19} />
                    </span>
                    <div>
                      <h3 className="font-black text-ink">{reservation.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{reservation.meta || "Sin detalle"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{reservation.status || "pendiente"}</Badge>
                    <button type="button" className={checked ? "secondary-button" : "primary-button"} onClick={() => toggleReservationCheck(reservation.key)}>
                      {checked ? "Revisada" : "Marcar revisada"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No hay reservas todavía" description="Añade transporte, alojamiento, entradas o restaurantes para controlar reservas." actionLabel="Añadir transporte" actionHref={`/trips/${activeTripId}/transport`} icon={Ticket} />
        )}
      </SectionCard>
    </div>
  );
}
