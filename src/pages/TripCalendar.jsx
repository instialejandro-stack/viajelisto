import React, { useMemo } from "react";
import { CalendarDays, Clock, MapPin, Plus, Route, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

function dayCost(items = []) {
  return items.reduce((sum, item) => {
    const amount = Number.parseFloat(String(item.cost || "").replace(",", ".").replace(/[^\d.]/g, ""));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

function getDayTone(items = []) {
  if (!items.length) return "border-dashed bg-slate-50";
  if (items.length >= 6) return "border-amber-200 bg-amber-50/70";
  return "border-line bg-white";
}

export default function TripCalendar() {
  const { activeTrip, activeTripId, itineraryDays = [] } = useAppState();
  const totals = useMemo(() => {
    const activities = itineraryDays.reduce((sum, day) => sum + (day.items?.length || 0), 0);
    const plannedDays = itineraryDays.filter((day) => day.items?.length).length;
    const estimatedCost = itineraryDays.reduce((sum, day) => sum + dayCost(day.items), 0);
    return { activities, plannedDays, estimatedCost };
  }, [itineraryDays]);

  if (!activeTrip) {
    return <EmptyState title="No hay viaje seleccionado" description="Abre un viaje para ver su calendario." />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={activeTrip.destination}
        title="Calendario del viaje"
        subtitle="Consulta cada día de un vistazo y detecta jornadas vacías o demasiado cargadas."
        action={
          <Link to={`/trips/${activeTripId}/itinerary`} className="primary-button">
            <Plus size={16} /> Añadir actividad
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Días" value={itineraryDays.length} hint={activeTrip.dates || "Fechas por definir"} />
        <StatCard icon={Route} label="Actividades" value={totals.activities} hint={`${totals.plannedDays} días con plan`} accent="emerald" />
        <StatCard icon={WalletCards} label="Coste visible" value={`${totals.estimatedCost} €`} hint="Suma de costes numéricos" accent="violet" />
      </div>

      <SectionCard title="Vista calendario">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {itineraryDays.map((day) => {
            const items = day.items || [];
            return (
              <article key={day.day} className={`rounded-3xl border p-5 shadow-sm ${getDayTone(items)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-primary-700">{day.date || "Sin fecha"}</p>
                    <h2 className="mt-1 text-xl font-black text-ink dark:text-white">{day.day}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{day.title || "Sin título"}</p>
                  </div>
                  <Badge>{items.length ? `${items.length} planes` : "Vacío"}</Badge>
                </div>

                {items.length ? (
                  <div className="mt-4 grid gap-2">
                    {items.slice(0, 4).map((item, index) => (
                      <Link
                        key={`${item.time}-${item.name}-${index}`}
                        to={`/trips/${activeTripId}/itinerary`}
                        className="rounded-2xl bg-white/80 p-3 text-sm shadow-sm transition hover:bg-primary-50 dark:bg-slate-800"
                      >
                        <span className="flex items-center gap-2 font-black text-ink dark:text-white">
                          <Clock size={14} className="text-primary-600" /> {item.time || "--:--"} · {item.name}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <MapPin size={13} /> {item.address || item.type}
                        </span>
                      </Link>
                    ))}
                    {items.length > 4 ? (
                      <p className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                        +{items.length - 4} actividades más
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-line bg-white/70 p-4 text-sm text-slate-500">
                    Día sin actividades. Úsalo como margen libre o añade una visita desde el itinerario.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
