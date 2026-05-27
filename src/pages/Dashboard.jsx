import React, { useMemo, useState } from "react";
import {
  Archive,
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
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import GuidedDemoModal from "../components/GuidedDemoModal.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import TripCard from "../components/TripCard.jsx";
import TripFormModal from "../components/TripFormModal.jsx";
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
  { label: "Comprobador", icon: Sparkles, path: "final-check" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    trips,
    ideas,
    activeTrip,
    activeTripData,
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
  const [guideSeen, setGuideSeen] = useLocalStorage("viajelisto.guideSeen", false);
  const [guideOpen, setGuideOpen] = useState(!guideSeen);

  const activeTrips = trips.filter((trip) => !trip.archived);
  const archivedTrips = trips.filter((trip) => trip.archived);
  const exampleTrips = trips.filter((trip) => trip.isExample);
  const userTrips = trips.filter((trip) => !trip.isExample);
  const totalBudget = useMemo(
    () => trips.reduce((sum, trip) => sum + Number.parseInt(String(trip.budget).replace(/[^\d]/g, ""), 10), 0),
    [trips]
  );
  const nextTrip = useMemo(() => {
    const upcoming = activeTrips
      .filter((trip) => trip.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    return activeTrip || upcoming || activeTrips.find(Boolean) || trips.find(Boolean);
  }, [activeTrip, activeTrips, trips]);
  const nextCountdown = nextTrip ? getTripCountdown(nextTrip) : null;
  const allChecklistTasks = Object.values(activeTripData?.checklist || {}).flat();
  const criticalTasks = allChecklistTasks.filter((task) => !task.done && ["alta", "Alta"].includes(task.priority)).slice(0, 4);

  return (
    <div className="grid gap-6">
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
                <Sparkles size={17} /> Cargar viaje de ejemplo
              </button>
            </div>

            {activeTripId && (
              <div className="mt-6 flex flex-wrap gap-2">
                {quickLinks.map(({ label, icon: Icon, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(`/trips/${activeTripId}/${path}`)}
                    className="surface-hover flex items-center gap-1.5 rounded-xl border border-line bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {nextTrip && (
            <div className="flex items-center border-t border-line bg-gradient-to-br from-primary-50 to-white p-6 lg:w-80 lg:border-l lg:border-t-0">
              <div className="w-full">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Próximo viaje</p>
                <h2 className="mt-2 text-xl font-black text-ink">{nextTrip.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {nextTrip.dates || "Sin fecha"} · {nextTrip.people || "0 personas"}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Badge>{nextTrip.archived ? "Archivado" : nextCountdown?.status}</Badge>
                  <span className="text-sm font-black text-primary-700">{nextCountdown?.label || `${nextTrip.progress || 0}% listo`}</span>
                </div>
                <button
                  onClick={() => navigate(`/trips/${nextTrip.id}/summary`)}
                  className="primary-button mt-4 w-full px-3 py-2"
                >
                  Ver viaje <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Route} label="Viajes activos" value={activeTrips.length} hint={`${archivedTrips.length} archivados`} />
        <StatCard icon={Lightbulb} label="Ideas guardadas" value={ideas.length} hint="Destinos en evaluación" accent="amber" />
        <StatCard
          icon={CalendarClock}
          label="Próximo viaje"
          value={nextTrip?.dates || "Sin fecha"}
          hint={nextTrip?.name || "Crea tu primer viaje"}
          accent="emerald"
        />
        <StatCard icon={WalletCards} label="Presupuesto previsto" value={`${totalBudget} €`} hint={`${userTrips.length} propios · ${exampleTrips.length} ejemplo`} accent="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card surface-hover p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <UsersRound size={20} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-400">Espacio local</p>
              <h2 className="mt-1 text-xl font-black text-ink">Preparado para colaborar después</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Cada viaje ya guarda propietario, colaboradores y visibilidad en el modelo local, sin activar cuentas ni backend.</p>
            </div>
          </div>
        </article>
        <article className="card surface-hover p-5">
          <p className="text-sm font-black text-slate-400">Viaje activo</p>
          <h2 className="mt-1 text-xl font-black text-ink">{activeTrip?.name || "Sin viaje seleccionado"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{activeTrip?.isExample ? "Estás viendo datos de ejemplo para presentar la demo." : "Datos propios guardados en este navegador."}</p>
        </article>
        <article className="card surface-hover p-5">
          <p className="text-sm font-black text-slate-400">Tareas críticas</p>
          <h2 className="mt-1 text-xl font-black text-ink">{criticalTasks.length ? `${criticalTasks.length} por revisar` : "Todo tranquilo"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{criticalTasks[0]?.title || "No hay tareas de alta prioridad pendientes en el viaje activo."}</p>
        </article>
      </div>

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
          <SectionCard title="Señales rápidas">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Archive size={16} /> Archivados</span>
                <strong className="text-ink">{archivedTrips.length}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Sparkles size={16} /> Datos de ejemplo</span>
                <strong className="text-ink">{exampleTrips.length}</strong>
              </div>
              <button className="secondary-button w-full" onClick={() => activeTripId && navigate(`/trips/${activeTripId}/final-check`)}>
                Abrir comprobador final
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Próximas tareas">
            <div className="grid gap-3">
              {(criticalTasks.length ? criticalTasks.map((task) => ({ title: task.title, meta: task.due || task.category || "Alta prioridad" })) : dashboardTasks).map((task) => (
                <div key={task.title} className="surface-hover flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
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
                <div key={idea.destination} className="surface-hover flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
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
