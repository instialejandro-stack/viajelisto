import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Backpack,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Coins,
  FileText,
  History,
  Home,
  Hotel,
  LayoutTemplate,
  Lightbulb,
  Map,
  MapPinned,
  Menu,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plane,
  Plus,
  Printer,
  ReceiptText,
  Route,
  Soup,
  Sparkles,
  Star,
  Ticket,
  UsersRound,
  Vote,
  X,
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import TripFormModal from "../components/TripFormModal.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { useAppState } from "../state/AppStateContext.jsx";

const navGroups = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    items: [
      { label: "Dashboard", path: "/dashboard", icon: Home, needsTrip: false },
      { label: "Ideas", path: "/ideas", icon: Lightbulb, needsTrip: false },
    ],
  },
  {
    id: "viaje",
    label: "Mi viaje",
    icon: Map,
    items: [
      { label: "Resumen", path: "summary", icon: Map, needsTrip: true },
      { label: "Itinerario", path: "itinerary", icon: Route, needsTrip: true },
      { label: "Hoy", path: "today", match: ["today", "day"], icon: CalendarCheck, needsTrip: true },
    ],
  },
  {
    id: "organizacion",
    label: "Organización",
    icon: MapPinned,
    items: [
      { label: "Transporte", path: "transport", icon: Plane, needsTrip: true },
      { label: "Alojamiento", path: "accommodation", icon: Hotel, needsTrip: true },
      { label: "Lugares", path: "places", icon: MapPinned, needsTrip: true },
      { label: "Restaurantes", path: "restaurants", icon: Soup, needsTrip: true },
      { label: "Reservas", path: "bookings", match: ["bookings", "reservations"], icon: Ticket, needsTrip: true },
    ],
  },
  {
    id: "presupuesto",
    label: "Presupuesto",
    icon: ReceiptText,
    items: [
      { label: "Gastos", path: "budget", icon: ReceiptText, needsTrip: true },
      { label: "Moneda", path: "currency", icon: Coins, needsTrip: true },
      { label: "Exportar", path: "exports", icon: Printer, needsTrip: true },
    ],
  },
  {
    id: "preparacion",
    label: "Preparación",
    icon: CheckSquare,
    items: [
      {
        label: "Checklist y tareas",
        path: "checklist",
        match: ["checklist", "preparation"],
        icon: CheckSquare,
        needsTrip: true,
      },
      { label: "Maleta", path: "packing", icon: Backpack, needsTrip: true },
      { label: "Documentos", path: "documents", icon: FileText, needsTrip: true },
      { label: "Sugerencias", path: "suggestions", icon: Sparkles, needsTrip: true },
    ],
  },
  {
    id: "grupo",
    label: "Grupo y seguridad",
    icon: UsersRound,
    items: [
      { label: "Votaciones", path: "votes", icon: Vote, needsTrip: true },
      {
        label: "Contactos y emergencias",
        path: "contacts",
        match: ["contacts", "emergency", "emergencies"],
        icon: Phone,
        needsTrip: true,
      },
      { label: "Zonas", path: "zones", icon: MapPinned, needsTrip: true },
    ],
  },
  {
    id: "recuerdos",
    label: "Recuerdos",
    icon: NotebookPen,
    items: [
      { label: "Notas personales", path: "notes", icon: NotebookPen, needsTrip: true },
      {
        label: "Diario y galería",
        path: "memories",
        match: ["memories", "diary", "journal"],
        icon: BookOpen,
        needsTrip: true,
      },
      {
        label: "Valoraciones",
        path: "review",
        match: ["review", "reviews"],
        icon: Star,
        needsTrip: true,
      },
    ],
  },
  {
    id: "herramientas",
    label: "Herramientas",
    icon: LayoutTemplate,
    items: [
      { label: "Plantillas", path: "templates", icon: LayoutTemplate, needsTrip: true },
      { label: "Historial", path: "history", icon: History, needsTrip: true },
    ],
  },
];

function pathFor(item, activeTripId) {
  if (!item.needsTrip) return item.path;
  return activeTripId ? `/trips/${activeTripId}/${item.path}` : "/dashboard";
}

function isItemActive(item, pathname, currentSection) {
  if (!item.needsTrip) return pathname === item.path;
  const matches = item.match || [item.path];
  return matches.includes(currentSection);
}

function findActiveGroup(pathname, currentSection) {
  return navGroups.find((group) => group.items.some((item) => isItemActive(item, pathname, currentSection)))?.id;
}

function NavItem({ item, activeTripId, compact = false, onNavigate, pathname, currentSection }) {
  const Icon = item.icon;
  const disabled = item.needsTrip && !activeTripId;
  const active = isItemActive(item, pathname, currentSection);

  return (
    <NavLink
      to={pathFor(item, activeTripId)}
      title={disabled ? "Selecciona un viaje para acceder a esta sección." : item.label}
      onClick={() => { if (onNavigate) onNavigate(); }}
      className={`flex min-h-9 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
        active
          ? "bg-primary-50 text-primary-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-ink"
      } ${disabled ? "opacity-40" : ""} ${compact ? "justify-center px-2" : ""}`}
    >
      <Icon size={16} className="shrink-0" />
      {!compact && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function SidebarContent({ activeTripId, compact, currentSection, onNavigate, onToggleCompact, openGroups, pathname, setOpenGroups }) {
  function toggleGroup(groupId) {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Logo */}
      <div className={`flex shrink-0 items-center gap-3 border-b border-line px-4 py-4 ${compact ? "justify-center" : "justify-between"}`}>
        <NavLink to="/" className={`flex min-w-0 items-center gap-3 ${compact ? "justify-center" : ""}`} onClick={onNavigate}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-sm font-black text-white shadow-sm">
            VL
          </span>
          {!compact && (
            <div className="min-w-0">
              <p className="font-black text-ink">ViajeListo</p>
              <p className="truncate text-xs font-medium text-slate-400">Planificador integral</p>
            </div>
          )}
        </NavLink>
        {onToggleCompact && !compact && (
          <button
            type="button"
            className="icon-button hidden lg:inline-flex"
            onClick={onToggleCompact}
            aria-label="Contraer menú"
          >
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>

      {compact && onToggleCompact && (
        <div className="shrink-0 px-3 py-3">
          <button type="button" className="icon-button w-full" onClick={onToggleCompact} aria-label="Expandir menú">
            <PanelLeftOpen size={17} />
          </button>
        </div>
      )}

      <nav className="scrollbar-soft min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <div className="grid gap-1">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const open = compact || openGroups[group.id];
            const groupActive = group.items.some((item) => isItemActive(item, pathname, currentSection));

            return (
              <section key={group.id}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-black uppercase tracking-wide transition ${
                    groupActive ? "text-primary-700" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  } ${compact ? "justify-center" : ""}`}
                  onClick={() => toggleGroup(group.id)}
                  title={group.label}
                >
                  <GroupIcon size={14} className="shrink-0" />
                  {!compact && <span className="min-w-0 flex-1 truncate">{group.label}</span>}
                  {!compact && (
                    <ChevronRight size={13} className={`shrink-0 transition ${open ? "rotate-90" : ""}`} />
                  )}
                </button>
                {open && (
                  <div className={`mt-0.5 grid gap-0.5 ${compact ? "" : "ml-1 pl-2"}`}>
                    {group.items.map((item) => (
                      <NavItem
                        key={`${group.id}-${item.label}`}
                        item={item}
                        activeTripId={activeTripId}
                        compact={compact}
                        onNavigate={onNavigate}
                        pathname={pathname}
                        currentSection={currentSection}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function AppShell() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { trips, activeTripId, activeTrip, setActiveTripId } = useAppState();
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useLocalStorage("viajelisto.sidebarCompact", false);
  const [openGroups, setOpenGroups] = useLocalStorage("viajelisto.navGroups", { inicio: true, viaje: true });

  const invalidTripRoute = Boolean(tripId && !trips.some((trip) => String(trip.id) === String(tripId)));
  const currentSection = useMemo(() => {
    const match = location.pathname.match(/\/trips\/[^/]+\/([^/]+)/);
    return match?.[1] || "summary";
  }, [location.pathname]);
  const activeGroupId = useMemo(() => findActiveGroup(location.pathname, currentSection), [location.pathname, currentSection]);

  useEffect(() => {
    if (tripId && !invalidTripRoute) setActiveTripId(tripId);
  }, [tripId, invalidTripRoute]);

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroups((current) => ({ inicio: true, viaje: true, ...current, [activeGroupId]: true }));
    }
  }, [activeGroupId, setOpenGroups]);

  function selectTrip(nextTripId) {
    setActiveTripId(nextTripId);
    setSelectorOpen(false);
    navigate(`/trips/${nextTripId}/${currentSection}`);
  }

  const sidebarWidth = sidebarCompact ? "lg:w-[4.5rem]" : "lg:w-[17rem]";
  const headerOffset = sidebarCompact ? "lg:ml-[4.5rem]" : "lg:ml-[17rem]";

  return (
    <div className="min-h-screen bg-mist">
      {/* Sidebar desktop */}
      <aside className={`fixed inset-y-0 left-0 z-20 hidden border-r border-line bg-white lg:block ${sidebarWidth}`}>
        <SidebarContent
          activeTripId={activeTripId}
          compact={sidebarCompact}
          currentSection={currentSection}
          onToggleCompact={() => setSidebarCompact((v) => !v)}
          openGroups={openGroups}
          pathname={location.pathname}
          setOpenGroups={setOpenGroups}
        />
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(88vw,20rem)] border-r border-line bg-white shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-xl bg-white p-2 text-slate-400 shadow-sm hover:text-slate-700"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            <SidebarContent
              activeTripId={activeTripId}
              compact={false}
              currentSection={currentSection}
              onNavigate={() => setMobileOpen(false)}
              openGroups={openGroups}
              pathname={location.pathname}
              setOpenGroups={setOpenGroups}
            />
          </aside>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 border-b border-line bg-white/92 backdrop-blur-md ${headerOffset}`}>
        <div className="flex min-h-[60px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="icon-button lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={19} />
            </button>
            <NavLink to="/" className="flex items-center gap-2.5 font-black text-ink lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-xs text-white">VL</span>
              <span className="hidden xs:inline">ViajeListo</span>
            </NavLink>
            {activeTrip && (
              <div className="hidden min-w-0 lg:block">
                <p className="text-xs font-semibold text-slate-400">Viaje activo</p>
                <h1 className="truncate text-base font-black text-ink">{activeTrip.name}</h1>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex min-w-0 items-center gap-2">
            {/* Trip selector */}
            <div className="relative min-w-0">
              <button
                type="button"
                className="secondary-button max-w-[160px] px-3 sm:max-w-xs"
                onClick={() => setSelectorOpen((o) => !o)}
              >
                <span className="truncate">{activeTrip?.name || "Elegir viaje"}</span>
                <ChevronDown size={15} />
              </button>
              {selectorOpen && (
                <div className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-soft">
                  {trips.length ? (
                    trips.map((trip) => (
                      <button
                        key={trip.id}
                        type="button"
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          String(trip.id) === String(activeTripId) ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50"
                        }`}
                        onClick={() => selectTrip(trip.id)}
                      >
                        <span className="block font-black">{trip.name}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {trip.destination} · {trip.status}
                        </span>
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-500"
                      onClick={() => { setSelectorOpen(false); navigate("/dashboard"); }}
                    >
                      Ir al Dashboard →
                    </button>
                  )}
                </div>
              )}
            </div>

            <button className="icon-button hidden sm:inline-flex" aria-label="Notificaciones">
              <Bell size={17} />
            </button>

            <button className="primary-button px-3 sm:px-4" onClick={() => setTripModalOpen(true)}>
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo viaje</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={`px-4 py-6 sm:px-6 lg:px-7 ${headerOffset}`}>
        {invalidTripRoute ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-line bg-white p-6 shadow-soft sm:p-8">
            <EmptyState
              title="No encontramos este viaje"
              description="Puede que se haya eliminado o que el enlace ya no sea válido. Vuelve al Dashboard para elegir otro viaje."
            />
            <div className="mt-5 flex justify-center">
              <button type="button" className="primary-button" onClick={() => navigate("/dashboard")}>
                Volver al Dashboard
              </button>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <TripFormModal open={tripModalOpen} onClose={() => setTripModalOpen(false)} />
    </div>
  );
}
