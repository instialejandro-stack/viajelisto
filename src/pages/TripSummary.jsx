import React, { useMemo } from "react";
import { AlertCircle, AlertTriangle, Backpack, CalendarDays, CheckCircle2, CheckSquare, Coffee, FileText, Hotel, Info, Lightbulb, MapPinned, Plane, Printer, ReceiptText, Route, Sparkles, Ticket, UsersRound, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MapPlaceholder from "../components/MapPlaceholder.jsx";
import QuickCreatePanel from "../components/QuickCreatePanel.jsx";
import QuickAccessCard from "../components/QuickAccessCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import TripHeader from "../components/TripHeader.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { getFinalReadiness, getTripCountdown, getTripValidationInsights } from "../utils/tripIntelligence.js";
import { getNearbyUsefulPoints } from "../utils/mapUtils.js";

const summaryQuickLinks = [
  ["Itinerario", "itinerary", Route],
  ["Mapa", "map", MapPinned],
  ["Gastos", "budget", ReceiptText],
  ["Documentos", "documents", FileText],
  ["Checklist", "checklist", CheckSquare],
  ["Maleta", "packing", Backpack],
  ["Reservas", "bookings", Ticket],
  ["Comprobador final", "final-check", CheckCircle2],
];

function money(value) {
  return Number.parseInt(String(value).replace(/[^\d]/g, ""), 10) || 0;
}

const suggestionStyles = {
  warning: { banner: "alert-warning", icon: AlertTriangle, iconClass: "text-amber-600 mt-0.5 shrink-0", titleClass: "font-bold text-amber-900 dark:text-amber-300", detailClass: "mt-1 text-sm text-amber-800 dark:text-amber-400" },
  error: { banner: "alert-error", icon: AlertCircle, iconClass: "text-rose-600 mt-0.5 shrink-0", titleClass: "font-bold text-rose-900 dark:text-rose-300", detailClass: "mt-1 text-sm text-rose-800 dark:text-rose-400" },
  info: { banner: "alert-info", icon: Info, iconClass: "text-primary-600 mt-0.5 shrink-0", titleClass: "font-bold text-primary-900 dark:text-primary-300", detailClass: "mt-1 text-sm text-primary-800 dark:text-primary-400" },
  success: { banner: "alert-success", icon: CheckCircle2, iconClass: "text-emerald-600 mt-0.5 shrink-0", titleClass: "font-bold text-emerald-900 dark:text-emerald-300", detailClass: "mt-1 text-sm text-emerald-800 dark:text-emerald-400" },
};

export default function TripSummary() {
  const { activeTrip, activeTripId, itineraryDays, transports, lodgings, checklist, expenses, budgetRows, places, participants = [], packingItems = [], documents = [] } = useAppState();
  const allTasks = Object.values(checklist).flat();
  const pendingTasks = allTasks.filter((task) => !task.done);
  const pendingPacking = packingItems.filter((item) => !item.packed);
  const pendingDocuments = documents.filter((document) => document.status === "pendiente");
  const confirmedBookings = transports.filter((item) => ["comprado", "confirmado"].includes(item.status)).length + lodgings.filter((item) => item.status === "reservado").length;
  const spent = budgetRows.reduce((sum, row) => sum + row.spent, 0) + expenses.filter((expense) => expense.status === "pagado").reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const activeTripData = { itineraryDays, transports, lodgings, checklist, expenses, budgetRows, places, packingItems, documents };
  const countdown = activeTrip ? getTripCountdown(activeTrip) : null;
  const validationInsights = activeTrip ? getTripValidationInsights(activeTrip, activeTripData) : [];
  const finalReadiness = activeTrip ? getFinalReadiness(activeTrip, activeTripData) : null;
  const nextTransport = transports[0];
  const lodging = lodgings[0];
  const nearbyUsefulPoints = getNearbyUsefulPoints(lodgings);
  const favoritePlaces = places.filter((place) => place.mustSee || String(place.priority).toLowerCase() === "alta").slice(0, 4);
  const participantExpenseCount = participants.map((participant) => ({
    ...participant,
    expenses: expenses.filter((expense) => expense.paidBy === participant.id || expense.splitWith?.includes(participant.id)).length,
  }));
  const trip = activeTrip
    ? {
        ...activeTrip,
        spent: `${spent} €`,
        days: itineraryDays.length,
        pendingTasks: pendingTasks.length,
        confirmedBookings,
      }
    : null;

  // Contextual smart suggestions derived from real trip data
  const suggestions = useMemo(() => {
    if (!activeTrip) return [];
    const list = [];
    const estimated = money(activeTrip.budget || "0");

    if (!transports.length) {
      list.push({ level: "warning", title: "Sin transporte registrado", detail: "Añade vuelos, trenes o traslados para no perder fechas y horarios clave." });
    }
    if (!lodgings.length) {
      list.push({ level: "warning", title: "Sin alojamiento guardado", detail: "Registra el hotel o apartamento principal para tenerlo todo centralizado." });
    }
    if (!expenses.length) {
      list.push({ level: "info", title: "Sin gastos registrados aún", detail: "Empieza a anotar gastos para llevar un control real del presupuesto." });
    }
    if (pendingTasks.length > 5) {
      list.push({ level: "warning", title: `${pendingTasks.length} tareas pendientes`, detail: "Tienes muchas cosas por resolver. Revisa el checklist antes de salir." });
    }
    if (!packingItems.length) {
      list.push({ level: "info", title: "La maleta está vacía", detail: "Añade elementos a la maleta para asegurarte de no olvidar nada esencial." });
    }
    if (pendingDocuments.length > 0) {
      list.push({ level: "warning", title: `${pendingDocuments.length} documento${pendingDocuments.length > 1 ? "s" : ""} pendiente${pendingDocuments.length > 1 ? "s" : ""}`, detail: "Revisa los documentos antes de viajar para evitar contratiempos en el aeropuerto." });
    }
    if (estimated > 0 && spent > estimated * 0.9) {
      list.push({ level: "error", title: "Presupuesto casi agotado", detail: `Has registrado ${spent} € de ${estimated} € estimados (${Math.round((spent / estimated) * 100)}%). Revisa los gastos restantes.` });
    }
    return list;
  }, [activeTrip, transports, lodgings, expenses, pendingTasks, packingItems, pendingDocuments, spent]);

  if (!trip) {
    return <EmptyState title="No hay viaje seleccionado" description="Vuelve al Dashboard y crea o abre un viaje para empezar a planificar." />;
  }

  return (
    <div className="grid gap-6">
      <TripHeader trip={trip} />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] border border-primary-100 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_78%)] p-5 shadow-sm dark:border-primary-900 dark:bg-[linear-gradient(135deg,#0c2a30_0%,#0f172a_78%)]">
          <p className="text-sm font-black uppercase text-primary-700 dark:text-primary-400">Cuenta atrás</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black text-ink dark:text-white">{countdown.label}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{countdown.phase} · Estado automático: <strong>{countdown.status}</strong></p>
            </div>
            <Badge>{countdown.status}</Badge>
          </div>
        </div>
        <div className="rounded-[2rem] border border-line bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-black uppercase text-slate-400">Comprobador final</p>
          <h2 className="mt-2 text-3xl font-black text-ink dark:text-white">{finalReadiness.score}%</h2>
          <p className="mt-1 font-bold text-primary-700 dark:text-primary-400">{finalReadiness.label}</p>
          <p className="mt-2 text-sm text-slate-500">{finalReadiness.blockers} avisos críticos · {finalReadiness.warnings} avisos medios</p>
        </div>
      </section>

      <QuickCreatePanel />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900 dark:bg-primary-950/30">
        <div>
          <p className="font-black text-ink dark:text-white">Resumen imprimible del viaje</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Prepara una versión limpia para imprimir o guardar como PDF desde el navegador.</p>
        </div>
        <Link to={`/trips/${activeTripId}/print`} className="secondary-button bg-white dark:bg-slate-800">
          <Printer size={16} />
          Exportar viaje
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Días de viaje" value={itineraryDays.length} hint={trip.dates} />
        <StatCard icon={CheckSquare} label="Tareas pendientes" value={pendingTasks.length} hint="Prioridad antes de salir" accent="amber" />
        <StatCard icon={CheckCircle2} label="Reservas confirmadas" value={confirmedBookings} hint="Transporte y alojamiento" accent="emerald" />
        <StatCard icon={WalletCards} label="Presupuesto gastado" value={`${spent} €`} hint={`de ${trip.budget} estimados`} accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <SectionCard title="Próximos pasos">
            {pendingTasks.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {pendingTasks.slice(0, 4).map((task) => (
                  <div key={task.title} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-primary-700">
                      <CheckSquare size={14} />
                    </span>
                    <div>
                      <p className="font-black text-ink dark:text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{task.category || "Pendiente"} · {task.due || "Sin fecha"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin tareas pendientes" description="Añade tareas o disfruta de un viaje bien encaminado." />
            )}
          </SectionCard>

          <SectionCard title="Lo que falta por preparar">
            <div className="grid gap-3 sm:grid-cols-3">
              <Link to={`/trips/${activeTripId}/checklist`} className="rounded-2xl border border-line bg-white p-4 transition hover:border-primary-200 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800">
                <CheckSquare className="text-primary-700" size={20} />
                <p className="mt-3 text-2xl font-black text-ink dark:text-white">{pendingTasks.length}</p>
                <p className="text-sm font-bold text-slate-500">Tareas pendientes</p>
              </Link>
              <Link to={`/trips/${activeTripId}/documents`} className="rounded-2xl border border-line bg-white p-4 transition hover:border-primary-200 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800">
                <FileText className="text-primary-700" size={20} />
                <p className="mt-3 text-2xl font-black text-ink dark:text-white">{pendingDocuments.length}</p>
                <p className="text-sm font-bold text-slate-500">Documentos pendientes</p>
              </Link>
              <Link to={`/trips/${activeTripId}/packing`} className="rounded-2xl border border-line bg-white p-4 transition hover:border-primary-200 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800">
                <Backpack className="text-primary-700" size={20} />
                <p className="mt-3 text-2xl font-black text-ink dark:text-white">{pendingPacking.length}</p>
                <p className="text-sm font-bold text-slate-500">Maleta pendiente</p>
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {validationInsights.slice(0, 4).map((insight) => (
                <div key={`${insight.title}-${insight.detail}`} className="rounded-2xl border border-line bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-ink dark:text-white">{insight.title}</p>
                    <Badge>{insight.severity === "alta" ? "Alta" : insight.severity === "media" ? "Media" : insight.severity === "correcto" ? "Correcto" : "Baja"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{insight.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Plan del viaje">
            <div className="grid gap-3">
              {itineraryDays.map((item) => (
                <div key={item.day} className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[90px_1fr] dark:border-slate-700 dark:bg-slate-800">
                  <span className="flex h-10 w-fit items-center rounded-xl bg-primary-50 px-3 text-sm font-black text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{item.day}</span>
                  <div>
                    <h3 className="font-black text-ink dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Smart contextual suggestions replacing the static link */}
          <SectionCard title="Sugerencias inteligentes">
            {suggestions.length > 0 ? (
              <div className="grid gap-3">
                {suggestions.map((s) => {
                  const style = suggestionStyles[s.level] || suggestionStyles.info;
                  const Icon = style.icon;
                  return (
                    <div key={s.title} className={style.banner}>
                      <Icon size={18} className={style.iconClass} />
                      <div>
                        <p className={style.titleClass}>{s.title}</p>
                        <p className={style.detailClass}>{s.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="alert-success">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">Todo bien encaminado</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Tu viaje parece bien organizado. Sin alertas activas en este momento.</p>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Imprescindibles y prioridades">
            {favoritePlaces.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {favoritePlaces.map((place) => (
                  <Link key={place.name} to={`/trips/${activeTripId}/places`} className="rounded-2xl border border-amber-100 bg-amber-50 p-4 transition hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30">
                    <Sparkles className="text-amber-700" size={18} />
                    <p className="mt-3 font-black text-ink dark:text-white">{place.name}</p>
                    <p className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-400">{place.day} · {place.price}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin imprescindibles marcados" description="Marca lugares como imprescindibles para verlos destacados en el resumen." />
            )}
          </SectionCard>
        </div>

        <aside className="grid gap-6">
          <SectionCard title="Grupo del viaje">
            {participants.length ? (
              <div className="grid gap-3">
                {participantExpenseCount.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm dark:bg-slate-700">
                      <UsersRound size={17} />
                    </span>
                    <div>
                      <p className="font-black text-ink dark:text-white">{participant.name}</p>
                      <p className="text-xs font-bold text-slate-400">{participant.expenses} gastos vinculados</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin participantes" description="Añade personas al viaje para simular tareas, gastos y decisiones del grupo." />
            )}
          </SectionCard>

          <SectionCard title="Próximo transporte">
            {nextTransport ? (
              <div className="rounded-3xl bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_100%)] p-5 dark:bg-[linear-gradient(135deg,#0c2a30_0%,#0f172a_100%)]">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm dark:bg-slate-800">
                    <Plane size={22} />
                  </span>
                  <Badge>{nextTransport.status}</Badge>
                </div>
                <h3 className="text-xl font-black text-ink dark:text-white">{nextTransport.type} {nextTransport.route}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{nextTransport.date}, {nextTransport.time}</p>
                <p className="mt-1 text-sm text-slate-500">{nextTransport.company}</p>
              </div>
            ) : (
              <EmptyState title="Sin transporte" description="Añade vuelos, trenes o traslados cuando tengas detalles." />
            )}
          </SectionCard>

          <SectionCard title="Alojamiento principal">
            {lodging ? (
              <div className="rounded-3xl border border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Hotel size={22} />
                  </span>
                  <Badge>{lodging.status}</Badge>
                </div>
                <h3 className="text-xl font-black text-ink dark:text-white">{lodging.name}</h3>
                <div className="mt-4 grid gap-3 text-sm">
                  <p className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700">
                    <span className="text-slate-500">Check-in</span>
                    <strong className="dark:text-white">{lodging.checkIn}</strong>
                  </p>
                  <p className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700">
                    <span className="text-slate-500">Check-out</span>
                    <strong className="dark:text-white">{lodging.checkOut}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState title="Sin alojamiento" description="Guarda el hotel o apartamento principal cuando lo tengas decidido." />
            )}
          </SectionCard>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <SectionCard title="Mapa del viaje" className="xl:order-1">
          <MapPlaceholder points={places.length ? places.map((place) => place.name) : [trip.destination]} title={trip.destination} />
          {nearbyUsefulPoints.length ? (
            <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                  <Coffee size={18} />
                </span>
                <div>
                  <p className="font-black text-ink dark:text-white">{nearbyUsefulPoints.length} sitios útiles cerca del alojamiento</p>
                  <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">Bares, restaurantes, cafeterías y compras generados desde la ubicación guardada.</p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Link to={`/trips/${activeTripId}/map`} className="primary-button">
              <MapPinned size={16} />
              Abrir mapa
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Accesos rápidos" className="xl:order-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {summaryQuickLinks.map(([label, section, Icon]) => (
              <QuickAccessCard key={label} label={label} path={`/trips/${activeTripId}/${section}`} icon={Icon} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
