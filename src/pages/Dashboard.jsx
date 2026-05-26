import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckSquare,
  FileText,
  Lightbulb,
  MapPinned,
  PlayCircle,
  Plus,
  ReceiptText,
  RotateCcw,
  Route,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import TripCard from "../components/TripCard.jsx";
import TripFormModal from "../components/TripFormModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import GuidedDemoModal from "../components/GuidedDemoModal.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { useAppState } from "../state/AppStateContext.jsx";
import { dashboardTasks, recentIdeas, travelReminders } from "../data/mockData.js";
import { getTripCountdown } from "../utils/tripIntelligence.js";

const quickLinks = [
  { label: "Itinerario", icon: Route, path: "itinerary" },
  { label: "Presupuesto", icon: ReceiptText, path: "budget" },
  { label: "Checklist", icon: CheckSquare, path: "checklist" },
  { label: "Documentos", icon: FileText, path: "documents" },
  { label: "Lugares", icon: MapPinned, path: "places" },
  { label: "Sugerencias", icon: Sparkles, path: "suggestions" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { trips, ideas, activeTrip, activeTripId, archiveTrip, deleteTrip, duplicateTrip, loadExampleTrip, resetDemo, setActiveTripId } = useAppState();
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [guideSeen, setGuideSeen] = useLocalStorage("viajelisto.guideSeen", false);
  const [guideOpen, setGuideOpen] = useState(!guideSeen);

  const totalBudget = useMemo(
    () => trips.reduce((sum, trip) => sum + Number.parseInt(String(trip.budget).replace(/[^\d]/g, ""), 10), 0),
    [trips]
  );
  const nextTrip = useMemo(() => {
    const upcoming = trips
      .filter((t) => t.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    return activeTrip || upcoming || trips.find(Boolean);
  }, [activeTrip, trips]);
  const nextCountdown = nextTrip ? getTripCountdown(nextTrip) : null;

  return (
    <div className="grid gap-6">
      {/* Welcome hero */}
      <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft">
        <div className="grid lg:grid-cols-[1fr_auto]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-black uppercase tracking-wide text-primary-600">Centro de control</p>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
              Hola, prepara tu próximo viaje con calma
            </h1>
            <p className="mt-3 max-w-xl text-slate-500">
              Ideas, reservas, tareas y presupuesto reunidos para saber exactamente qué falta antes de salir.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="primary-button px-5 py-2.5" onClick={() => setTripModalOpen(true)}>
                <Plus size={17} /> Crear nuevo viaje
              </button>
              <button className="secondary-button px-5 py-2.5" onClick={() => setGuideOpen(true)}>
                <PlayCircle size={17} /> Ver demo guiada
              </button>
              <button className="secondary-button px-5 py-2.5" onClick={() => { loadExampleTrip(); setGuideOpen(true); }}>
                <Sparkles size={17} /> Modo presentación
              </button>
            </div>

            {/* Quick links — only shown when active trip */}
            {activeTripId && (
              <div className="mt-6 flex flex-wrap gap-2">
                {quickLinks.map(({ label, icon: Icon, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(`/trips/${activeTripId}/${path}`)}
                    className="flex items-center gap-1.5 rounded-xl border border-line bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Next trip mini card */}
          {nextTrip && (
            <div className="flex items-center border-t border-line bg-gradient-to-br from-primary-50 to-white p-6 lg:w-80 lg:border-l lg:border-t-0">
              <div className="w-full">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Próximo viaje</p>
                <h2 className="mt-2 text-xl font-black text-ink">{nextTrip.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {nextTrip.dates || "Sin fecha"} · {nextTrip.people || "0 personas"}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge>{nextTrip.archived ? "Archivado" : nextCountdown?.status}</Badge>
                  <span className="text-sm font-black text-primary-700">{nextCountdown?.label || `${nextTrip.progress || 0}% listo`}</span>
                </div>
                <button
                  onClick={() => navigate(`/trips/${nextTrip.id}/summary`)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-primary-700"
                >
                  Ver viaje <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Route} label="Viajes activos" value={trips.length} hint="Planificados o en curso" />
        <StatCard icon={Lightbulb} label="Ideas guardadas" value={ideas.length} hint="Destinos en evaluación" accent="amber" />
        <StatCard
          icon={CalendarClock}
          label="Próximo viaje"
          value={nextTrip?.dates || "Sin fecha"}
          hint={nextTrip?.name || "Crea tu primer viaje"}
          accent="emerald"
        />
        <StatCard icon={WalletCards} label="Presupuesto previsto" value={`${totalBudget} €`} hint="Suma de viajes abiertos" accent="violet" />
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard
          title={`Tus viajes (${trips.length})`}
          action={
            <button className="secondary-button" onClick={() => setTripModalOpen(true)}>
              <Plus size={15} /> Nuevo
            </button>
          }
        >
          {trips.length ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onOpen={() => setActiveTripId(trip.id)}
                  onDuplicate={() => duplicateTrip(trip.id)}
                  onArchive={() => archiveTrip(trip.id)}
                  onEdit={() => { setEditingTrip(trip); setTripModalOpen(true); }}
                  onDelete={() => setDeletingTrip(trip)}
                />
              ))}
            </div>
          ) : (
            <div className="py-6">
              <EmptyState title="Todavía no hay viajes" description="Crea tu primer viaje para verlo en este panel." />
              <div className="mt-5 flex justify-center">
                <button className="primary-button" onClick={() => setTripModalOpen(true)}>
                  <Plus size={16} /> Crear viaje
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        <aside className="grid gap-5">
          {/* Tasks */}
          <SectionCard title="Próximas tareas">
            <div className="grid gap-3">
              {dashboardTasks.map((task) => (
                <div key={task.title} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                    <CheckSquare size={13} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-black text-ink">{task.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{task.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Ideas */}
          <SectionCard
            title="Ideas recientes"
            action={
              <button className="secondary-button text-xs" onClick={() => navigate("/ideas")}>
                Ver todas
              </button>
            }
          >
            <div className="grid gap-3">
              {recentIdeas.map((idea) => (
                <div key={idea.destination} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-black text-ink">{idea.destination}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{idea.meta}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-primary-700 shadow-sm">
                    {idea.score}/10
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Reminders */}
          <SectionCard title="Recordatorios">
            <div className="grid gap-3">
              {travelReminders.map((reminder) => (
                <div key={reminder} className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
                  <BellRing size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  {reminder}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Demo reset (subtle) */}
          <details className="group rounded-2xl border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700">
              <span className="flex items-center gap-2">
                <RotateCcw size={14} /> Opciones de demo
              </span>
              <span className="text-xs text-slate-400 transition group-open:rotate-180">▾</span>
            </summary>
            <div className="border-t border-line p-4">
              <p className="text-sm text-slate-500">Restaura los datos de ejemplo y vuelve al onboarding.</p>
              <button type="button" className="secondary-button mt-3 w-full bg-white" onClick={() => setResetOpen(true)}>
                <RotateCcw size={15} /> Reiniciar demo
              </button>
            </div>
          </details>
        </aside>
      </div>

      <TripFormModal
        open={tripModalOpen}
        trip={editingTrip}
        onClose={() => { setTripModalOpen(false); setEditingTrip(null); }}
      />
      <ConfirmDialog
        open={Boolean(deletingTrip)}
        title="Eliminar viaje"
        description={`Vas a eliminar "${deletingTrip?.name || "este viaje"}". Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingTrip(null)}
        onConfirm={() => { deleteTrip(deletingTrip.id); setDeletingTrip(null); }}
      />
      <ConfirmDialog
        open={resetOpen}
        title="Reiniciar demo"
        description="Se restaurarán los datos de ejemplo y se volverá a mostrar el onboarding inicial."
        warningText="Se restablecerán viajes, ideas, itinerario, gastos y checklist al estado inicial."
        confirmLabel="Reiniciar demo"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => { resetDemo(); setResetOpen(false); navigate("/welcome", { replace: true }); }}
      />
      <GuidedDemoModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onDontShowAgain={() => setGuideSeen(true)}
      />
    </div>
  );
}
