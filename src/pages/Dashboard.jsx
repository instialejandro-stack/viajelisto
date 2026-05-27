import React, { useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Lightbulb,
  Plus,
  RotateCcw,
  Sparkles,
  Luggage,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import GuidedDemoModal from "../components/GuidedDemoModal.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import TripCard from "../components/TripCard.jsx";
import TripFormModal from "../components/TripFormModal.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { useAppState } from "../state/AppStateContext.jsx";
import { getTripCountdown } from "../utils/tripIntelligence.js";

const filters = [
  { id: "active", label: "Activos" },
  { id: "ideas", label: "Ideas" },
  { id: "upcoming", label: "Próximos" },
  { id: "finished", label: "Finalizados" },
  { id: "archived", label: "Archivados" },
  { id: "all", label: "Todos" },
];

function parseBudget(value) {
  return Number.parseInt(String(value || "0").replace(/[^\d]/g, ""), 10) || 0;
}

function isUpcomingTrip(trip) {
  if (!trip.startDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(trip.startDate) >= today;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    trips,
    ideas,
    activeTripId,
    archiveTrip,
    deleteTrip,
    duplicateTrip,
    loadExampleTrip,
    resetDemo,
    setActiveTripId,
  } = useAppState();
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("active");
  const [guideSeen, setGuideSeen] = useLocalStorage("viajelisto.guideSeen", false);
  const [guideOpen, setGuideOpen] = useState(!guideSeen);

  const activeTrips = trips.filter((trip) => !trip.archived);
  const archivedTrips = trips.filter((trip) => trip.archived);
  const ideaTrips = trips.filter((trip) => !trip.archived && trip.status === "Idea");
  const upcomingTrips = trips.filter((trip) => !trip.archived && isUpcomingTrip(trip));
  const finishedTrips = trips.filter((trip) => !trip.archived && getTripCountdown(trip).status === "Finalizado");
  const totalBudget = useMemo(() => activeTrips.reduce((sum, trip) => sum + parseBudget(trip.budget), 0), [activeTrips]);

  const nextTrip = useMemo(() => {
    const upcoming = activeTrips
      .filter((trip) => trip.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    return upcoming || activeTrips.find((trip) => String(trip.id) === String(activeTripId)) || activeTrips[0] || null;
  }, [activeTripId, activeTrips]);

  const visibleTrips = useMemo(() => {
    if (activeFilter === "ideas") return ideaTrips;
    if (activeFilter === "upcoming") return upcomingTrips;
    if (activeFilter === "finished") return finishedTrips;
    if (activeFilter === "archived") return archivedTrips;
    if (activeFilter === "all") return trips;
    return activeTrips;
  }, [activeFilter, activeTrips, archivedTrips, finishedTrips, ideaTrips, trips, upcomingTrips]);

  const nextCountdown = nextTrip ? getTripCountdown(nextTrip) : null;
  const compactIdeas = ideas.slice(0, 3);

  const openTrip = (tripId, section = "summary") => {
    setActiveTripId(tripId);
    navigate(`/trips/${tripId}/${section}`);
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-[1.75rem] border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-primary-600">Dashboard</p>
            <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Gestiona tus viajes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Abre el viaje que quieras preparar, crea uno nuevo o revisa tus ideas guardadas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="primary-button px-4 py-2.5" onClick={() => setTripModalOpen(true)}>
              <Plus size={17} /> Nuevo viaje
            </button>
            {!trips.length ? (
              <button className="secondary-button px-4 py-2.5" onClick={() => loadExampleTrip()}>
                <Sparkles size={17} /> Cargar ejemplo
              </button>
            ) : (
              <button className="secondary-button px-4 py-2.5" onClick={() => setGuideOpen(true)}>
                Ver demo guiada
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <article className="card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="p-5 sm:p-6">
              <p className="text-sm font-black uppercase tracking-wide text-slate-400">Próximo viaje</p>
              {nextTrip ? (
                <>
                  <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-ink">{nextTrip.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {nextTrip.dates || "Fechas por definir"} · {nextTrip.people || "Personas por definir"}
                      </p>
                    </div>
                    <Badge>{nextTrip.archived ? "Archivado" : nextCountdown?.status}</Badge>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-primary-50 p-4">
                      <p className="text-xs font-bold uppercase text-primary-700">Cuenta atrás</p>
                      <p className="mt-1 text-lg font-black text-ink">{nextCountdown?.label || "Sin fecha"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">Presupuesto</p>
                      <p className="mt-1 text-lg font-black text-ink">{nextTrip.budget || "0 €"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">Personas</p>
                      <p className="mt-1 text-lg font-black text-ink">{nextTrip.people || "Por definir"}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <ProgressBar value={nextTrip.progress || 0} label="Preparación" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="primary-button px-4 py-2.5" onClick={() => openTrip(nextTrip.id)}>
                      Abrir viaje <ArrowRight size={16} />
                    </button>
                    {nextCountdown?.daysUntil <= 14 && nextCountdown?.daysUntil >= 0 ? (
                      <button className="secondary-button px-4 py-2.5" onClick={() => openTrip(nextTrip.id, "final-check")}>
                        Comprobador final
                      </button>
                    ) : null}
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Todavía no hay viajes"
                  description="Crea tu primer viaje o carga el ejemplo para empezar a explorar ViajeListo."
                  actionLabel="Crear viaje"
                  onAction={() => setTripModalOpen(true)}
                  icon={Luggage}
                />
              )}
            </div>
            {nextTrip ? (
              <div className="relative min-h-52 overflow-hidden border-t border-line lg:border-l lg:border-t-0">
                <img src={nextTrip.cover} alt={nextTrip.destination} className="h-full min-h-52 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/75">{nextTrip.destination}</p>
                  <p className="mt-1 text-lg font-black text-white">{nextTrip.status}</p>
                </div>
              </div>
            ) : null}
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard icon={Luggage} label="Viajes activos" value={activeTrips.length} hint={`${archivedTrips.length} archivados`} />
          <StatCard icon={Lightbulb} label="Ideas guardadas" value={ideas.length} hint="Destinos por decidir" accent="amber" />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Archive} label="Archivados" value={archivedTrips.length} hint="Ocultos por defecto" accent="emerald" />
        <StatCard icon={WalletCards} label="Presupuesto previsto" value={`${totalBudget} €`} hint="Suma de viajes activos" accent="violet" />
      </div>

      <SectionCard
        title="Tus viajes"
        action={
          <button className="secondary-button" onClick={() => setTripModalOpen(true)}>
            <Plus size={15} /> Nuevo
          </button>
        }
      >
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${
                activeFilter === filter.id
                  ? "border-primary-500 bg-primary-600 text-white shadow-sm"
                  : "border-line bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleTrips.length ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {visibleTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onOpen={() => setActiveTripId(trip.id)}
                onDuplicate={() => duplicateTrip(trip.id)}
                onArchive={() => archiveTrip(trip.id)}
                onEdit={() => {
                  setEditingTrip(trip);
                  setTripModalOpen(true);
                }}
                onDelete={() => setDeletingTrip(trip)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay viajes en este filtro"
            description="Cambia de filtro o crea un nuevo viaje para verlo aquí."
            actionLabel="Nuevo viaje"
            onAction={() => setTripModalOpen(true)}
            icon={Luggage}
          />
        )}
      </SectionCard>

      {compactIdeas.length ? (
        <SectionCard
          title="Ideas guardadas"
          action={
            <Link to="/ideas" className="secondary-button text-xs">
              Ver todas
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            {compactIdeas.map((idea) => (
              <article key={idea.id || idea.destination} className="surface-hover rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-ink">{idea.destination}</p>
                    <p className="mt-1 text-sm text-slate-500">{idea.dates || "Fechas por definir"}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-primary-700 shadow-sm">
                    {idea.score}/10
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{idea.type}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <details className="rounded-2xl border border-line bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700">
          Opciones de demo
        </summary>
        <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Reinicia la demo o vuelve a mostrar el recorrido guiado cuando lo necesites.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="secondary-button bg-white" onClick={() => setGuideOpen(true)}>
              Demo guiada
            </button>
            <button type="button" className="secondary-button bg-white" onClick={() => setResetOpen(true)}>
              <RotateCcw size={15} /> Reiniciar demo
            </button>
          </div>
        </div>
      </details>

      <TripFormModal
        open={tripModalOpen}
        trip={editingTrip}
        onClose={() => {
          setTripModalOpen(false);
          setEditingTrip(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingTrip)}
        title="Eliminar viaje"
        description={`Vas a eliminar "${deletingTrip?.name || "este viaje"}". Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingTrip(null)}
        onConfirm={() => {
          deleteTrip(deletingTrip.id);
          setDeletingTrip(null);
        }}
      />
      <ConfirmDialog
        open={resetOpen}
        title="Reiniciar demo"
        description="Se restaurarán los datos de ejemplo y se volverá a mostrar el onboarding inicial."
        warningText="Se restablecerán viajes, ideas, itinerario, gastos y checklist al estado inicial."
        confirmLabel="Reiniciar demo"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          setResetOpen(false);
          navigate("/welcome", { replace: true });
        }}
      />
      <GuidedDemoModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onDontShowAgain={() => setGuideSeen(true)}
      />
    </div>
  );
}
