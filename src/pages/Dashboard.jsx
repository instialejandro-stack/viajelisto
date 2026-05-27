import React, { useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Lightbulb,
  Luggage,
  Plus,
  RotateCcw,
  Sparkles,
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
  const finishedTrips = trips.filter(
    (trip) => !trip.archived && getTripCountdown(trip).status === "Finalizado"
  );
  const totalBudget = useMemo(
    () => activeTrips.reduce((sum, trip) => sum + parseBudget(trip.budget), 0),
    [activeTrips]
  );

  const nextTrip = useMemo(() => {
    const upcoming = activeTrips
      .filter((trip) => trip.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    return (
      upcoming ||
      activeTrips.find((trip) => String(trip.id) === String(activeTripId)) ||
      activeTrips[0] ||
      null
    );
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
    <div className="grid gap-5">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_100%_50%,#ecfeff,transparent)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-label">Dashboard</p>
            <h1 className="mt-1.5 text-2xl font-bold text-ink sm:text-3xl">
              Gestiona tus viajes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Abre el viaje que quieras preparar, crea uno nuevo o revisa tus ideas guardadas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="primary-button px-4 py-2.5" onClick={() => setTripModalOpen(true)}>
              <Plus size={16} /> Nuevo viaje
            </button>
            {!trips.length ? (
              <button className="secondary-button px-4 py-2.5" onClick={() => loadExampleTrip()}>
                <Sparkles size={16} /> Cargar ejemplo
              </button>
            ) : (
              <button className="secondary-button px-4 py-2.5" onClick={() => setGuideOpen(true)}>
                Ver demo guiada
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Next trip + stats */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        {/* Next trip card */}
        <article className="card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="p-5 sm:p-6">
              <p className="section-label">Próximo viaje</p>
              {nextTrip ? (
                <>
                  <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-ink sm:text-2xl">{nextTrip.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {nextTrip.dates || "Fechas por definir"} · {nextTrip.people || "Personas por definir"}
                      </p>
                    </div>
                    <Badge dot>{nextTrip.archived ? "Archivado" : nextCountdown?.status}</Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-cyan-50/50 p-4 ring-1 ring-primary-100">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
                        Cuenta atrás
                      </p>
                      <p className="mt-1 text-xl font-bold text-ink">
                        {nextCountdown?.label || "Sin fecha"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Presupuesto
                      </p>
                      <p className="mt-1 text-xl font-bold text-ink">{nextTrip.budget || "0 €"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Personas
                      </p>
                      <p className="mt-1 text-xl font-bold text-ink">
                        {nextTrip.people || "Por definir"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <ProgressBar value={nextTrip.progress || 0} label="Preparación" />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      className="primary-button px-4 py-2.5"
                      onClick={() => openTrip(nextTrip.id)}
                    >
                      Abrir viaje <ArrowRight size={15} />
                    </button>
                    {nextCountdown?.daysUntil <= 14 && nextCountdown?.daysUntil >= 0 && (
                      <button
                        className="secondary-button px-4 py-2.5"
                        onClick={() => openTrip(nextTrip.id, "final-check")}
                      >
                        Comprobador final
                      </button>
                    )}
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

            {nextTrip && (
              <div className="relative min-h-52 overflow-hidden border-t border-line lg:border-l lg:border-t-0">
                <img
                  src={nextTrip.cover}
                  alt={nextTrip.destination}
                  className="h-full min-h-52 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                    {nextTrip.destination}
                  </p>
                  <p className="mt-1 text-base font-bold text-white">{nextTrip.status}</p>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard
            icon={Luggage}
            label="Viajes activos"
            value={activeTrips.length}
            hint={`${archivedTrips.length} archivados`}
          />
          <StatCard
            icon={Lightbulb}
            label="Ideas guardadas"
            value={ideas.length}
            hint="Destinos por decidir"
            accent="amber"
          />
        </div>
      </section>

      {/* Extra stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Archive}
          label="Archivados"
          value={archivedTrips.length}
          hint="Ocultos por defecto"
          accent="emerald"
        />
        <StatCard
          icon={WalletCards}
          label="Presupuesto previsto"
          value={`${totalBudget} €`}
          hint="Suma de viajes activos"
          accent="violet"
        />
      </div>

      {/* Trips list */}
      <SectionCard
        title="Tus viajes"
        action={
          <button className="secondary-button px-3 py-2 text-sm" onClick={() => setTripModalOpen(true)}>
            <Plus size={14} /> Nuevo
          </button>
        }
      >
        {/* Filters */}
        <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                activeFilter === filter.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white border border-line text-slate-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleTrips.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
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

      {/* Ideas preview */}
      {compactIdeas.length > 0 && (
        <SectionCard
          title="Ideas guardadas"
          action={
            <Link to="/ideas" className="secondary-button px-3 py-2 text-xs">
              Ver todas
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            {compactIdeas.map((idea) => (
              <article
                key={idea.id || idea.destination}
                className="surface-hover rounded-2xl border border-line bg-slate-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{idea.destination}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {idea.dates || "Fechas por definir"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100">
                    {idea.score}/10
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{idea.type}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Demo options */}
      <details className="rounded-2xl border border-line bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          Opciones de demo
        </summary>
        <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Reinicia la demo o vuelve a mostrar el recorrido guiado cuando lo necesites.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="secondary-button" onClick={() => setGuideOpen(true)}>
              Demo guiada
            </button>
            <button type="button" className="secondary-button" onClick={() => setResetOpen(true)}>
              <RotateCcw size={14} /> Reiniciar demo
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
