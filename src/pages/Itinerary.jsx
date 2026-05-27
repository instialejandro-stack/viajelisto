import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Car, Clock, Footprints, Lightbulb, MapPinned, Plus, ReceiptText, Route, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";
import DayTabs from "../components/DayTabs.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import ItineraryActivityCard from "../components/ItineraryActivityCard.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { analyzeItineraryDay, getAccommodationIssues, getItineraryIssues } from "../utils/tripIntelligence.js";
import { distanceKm, hasCoordinates, inferLocation, orderActivitiesByProximity } from "../utils/mapUtils.js";

const emptyActivity = (day = "Día 1") => ({
  day,
  time: "",
  name: "",
  type: "Visita",
  address: "",
  duration: "",
  travelTime: "",
  cost: "",
  lat: "",
  lng: "",
  notes: "",
});

const TRAVEL_MODES = {
  walking: {
    label: "A pie",
    icon: Footprints,
    speedKmH: 4.8,
    minimumMinutes: 3,
    bufferMinutes: 2,
    text: "caminando",
  },
  driving: {
    label: "En coche",
    icon: Car,
    speedKmH: 24,
    minimumMinutes: 5,
    bufferMinutes: 8,
    text: "en coche",
  },
};

function minutesToTravelLabel(minutes, mode) {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded} min ${mode.text}`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} h ${rest} min ${mode.text}` : `${hours} h ${mode.text}`;
}

function cleanText(value) {
  return String(value || "").trim().toLowerCase();
}

function getActivityLocation(item = {}, collections = []) {
  const direct = inferLocation(item);
  if (hasCoordinates(direct)) return direct;

  const itemName = cleanText(item.name);
  const itemAddress = cleanText(item.address);
  const related = collections.flat().find((entity) => {
    const entityName = cleanText(entity.name);
    const entityAddress = cleanText(entity.address || entity.location?.address || entity.zone || entity.area);
    return Boolean(
      (itemName && entityName && (itemName.includes(entityName) || entityName.includes(itemName))) ||
      (itemAddress && entityAddress && (itemAddress.includes(entityAddress) || entityAddress.includes(itemAddress))) ||
      (itemAddress && entityName && (itemAddress.includes(entityName) || entityName.includes(itemAddress)))
    );
  });

  return related ? inferLocation(related) : direct;
}

function withAutomaticTransfers(day = {}, modeKey = "walking", collections = []) {
  const mode = TRAVEL_MODES[modeKey] || TRAVEL_MODES.walking;
  const items = day.items || [];
  return {
    ...day,
    items: items.map((item, index) => {
      if (item.travelTime || index === 0) return item;

      const previous = items[index - 1];
      const from = getActivityLocation(previous, collections);
      const to = getActivityLocation(item, collections);
      if (!hasCoordinates(from) || !hasCoordinates(to)) return item;

      const km = distanceKm(from, to);
      if (!Number.isFinite(km)) return item;

      const minutes = Math.max(mode.minimumMinutes, (km / mode.speedKmH) * 60 + mode.bufferMinutes);
      return {
        ...item,
        travelTime: minutesToTravelLabel(minutes, mode),
        autoTravelTime: true,
        autoTravelDistance: `${km.toFixed(1)} km`,
        autoTravelMode: modeKey,
      };
    }),
  };
}

export default function Itinerary() {
  const { itineraryDays, lodgings, places, restaurants, activeTrip, activeTripId, addActivity, updateActivity, deleteActivity, reorderDayByProximity } = useAppState();
  const [active, setActive] = useState(0);
  const [travelMode, setTravelMode] = useState("walking");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyActivity(itineraryDays[0]?.day || "Día 1"));
  const day = itineraryDays[active] || itineraryDays[0] || { day: "Día 1", items: [] };
  const dayWithTransfers = useMemo(
    () => withAutomaticTransfers(day, travelMode, [places, restaurants, lodgings]),
    [day, travelMode, places, restaurants, lodgings]
  );
  const autoTransfers = dayWithTransfers.items.filter((item) => item.autoTravelTime).length;
  const dayAnalysis = useMemo(() => analyzeItineraryDay(dayWithTransfers), [dayWithTransfers]);
  const suggestedOrder = useMemo(() => orderActivitiesByProximity(day.items || []), [day.items]);
  const hasSuggestedOrder = suggestedOrder.some((item, index) => item.name !== day.items?.[index]?.name);
  const itineraryIssues = getItineraryIssues(itineraryDays);
  const dayIssues = itineraryIssues.filter((issue) => issue.title.includes(day?.day));
  const lodgingIssues = getAccommodationIssues(activeTrip, lodgings);

  useEffect(() => {
    setActive(0);
  }, [activeTripId]);

  useEffect(() => {
    if (active >= itineraryDays.length) setActive(0);
  }, [active, itineraryDays.length]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openModal() {
    setEditingActivity(null);
    setForm(emptyActivity(day?.day || "Día 1"));
    setError("");
    setModalOpen(true);
  }

  function openEdit(item, index) {
    setEditingActivity({ day: day.day, index });
    setForm({
      day: day.day,
      time: item.time || "",
      name: item.name || "",
      type: item.type || "Visita",
      address: item.address || "",
      duration: item.duration || "",
      travelTime: item.travelTime || "",
      cost: item.cost || "",
      lat: item.location?.lat ?? "",
      lng: item.location?.lng ?? "",
      notes: item.notes || "",
    });
    setError("");
    setModalOpen(true);
  }

  function submit(event) {
    event.preventDefault();
    if (!form.day || !form.time || !form.name || !form.type || !form.address) {
      setError("Completa día, hora, nombre, tipo y dirección o zona.");
      return;
    }
    if (editingActivity) updateActivity(editingActivity.day, editingActivity.index, form);
    else addActivity(form);
    setError("");
    setModalOpen(false);
    setEditingActivity(null);
    const nextIndex = itineraryDays.findIndex((item) => item.day === form.day);
    if (nextIndex >= 0) setActive(nextIndex);
    setForm(emptyActivity(form.day));
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-soft">
        <div className="grid lg:grid-cols-[1fr_360px]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-black uppercase text-primary-700">Agenda del viaje</p>
            <div className="mt-3 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <h1 className="text-4xl font-black text-ink sm:text-5xl">Itinerario de {activeTrip?.name || "tu viaje"}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-slate-500">
                  <CalendarDays size={17} /> {activeTrip?.dates || "Fechas por definir"} · {itineraryDays.length} días organizados
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/trips/${activeTripId}/map`} className="secondary-button shrink-0 px-5 py-3">
                  <MapPinned size={18} /> Ver mapa del día
                </Link>
                <button className="secondary-button shrink-0 px-5 py-3" onClick={() => reorderDayByProximity(day.day)}>
                  <Shuffle size={18} /> Ordenar por cercanía
                </button>
                <button className="primary-button shrink-0 px-5 py-3" onClick={openModal}>
                  <Plus size={18} /> Añadir actividad
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-line bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_72%)] p-6 lg:border-l lg:border-t-0">
            <div className="rounded-3xl border border-primary-100 bg-white/85 p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Día seleccionado</p>
              <h2 className="mt-2 text-2xl font-black text-ink">{day.day}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{day.title}</p>
              <p className="mt-4 text-sm leading-6 text-slate-500">{day.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <DayTabs days={itineraryDays} active={active} onChange={setActive} />

      <section className="rounded-3xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-ink">Traslados automáticos</p>
            <p className="mt-1 text-sm text-slate-500">
              Calcula el tiempo entre actividades consecutivas cuando tienen ubicación conocida. Puedes cambiar el modo sin guardar datos.
            </p>
          </div>
          <div className="flex rounded-2xl border border-line bg-slate-50 p-1">
            {Object.entries(TRAVEL_MODES).map(([key, mode]) => {
              const ModeIcon = mode.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTravelMode(key)}
                  className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
                    travelMode === key ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-ink"
                  }`}
                >
                  <ModeIcon size={16} /> {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Route} label="Actividades" value={dayWithTransfers.items.length} hint="Planificadas para este día" />
        <StatCard icon={Clock} label="Duración total" value={dayAnalysis.totalDurationLabel} hint={`Agenda: ${dayAnalysis.daySpanLabel}`} accent="emerald" />
        <StatCard icon={Footprints} label="Traslados" value={dayAnalysis.travelLabel} hint={`${autoTransfers} calculados automáticamente`} accent="amber" />
        <StatCard icon={ReceiptText} label="Coste estimado" value={day.estimatedCost} hint="Sin compras opcionales" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title={`${day.day}: ${day.title}`}>
          <div className="mb-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-black uppercase text-slate-400">{day.date}</p>
            <h2 className="mt-2 text-2xl font-black text-ink">{day.title}</h2>
            <p className="mt-2 leading-7 text-slate-500">{day.summary}</p>
          </div>
          {dayWithTransfers.items.length ? (
            <div>
              {dayWithTransfers.items.map((item, index) => (
                <ItineraryActivityCard
                  key={`${item.time}-${item.name}-${index}`}
                  item={item}
                  onEdit={() => openEdit(day.items[index], index)}
                  onDelete={() => setDeletingActivity({ day: day.day, index, name: item.name })}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No hay actividades en este día" description="Añade la primera actividad para construir el itinerario." actionLabel="Añadir actividad" onAction={openModal} icon={Plus} />
          )}
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Resumen del día">
            <div className="grid gap-3">
              <div className="rounded-2xl bg-primary-50 p-4">
                <p className="text-sm font-bold text-primary-700">Total de actividades</p>
                <p className="mt-1 text-3xl font-black text-ink">{dayWithTransfers.items.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Duración planificada</p>
                <p className="mt-1 text-2xl font-black text-ink">{dayAnalysis.totalDurationLabel}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Ventana del día: {dayAnalysis.daySpanLabel}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Tiempo caminando/transporte</p>
                <p className="mt-1 text-lg font-black text-ink">{dayAnalysis.travelLabel}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ruta sugerida">
            {hasSuggestedOrder ? (
              <div className="grid gap-3">
                <p className="text-sm leading-6 text-slate-500">
                  Hay una alternativa que reduce saltos entre zonas usando ubicaciones conocidas del día.
                </p>
                <div className="grid gap-2">
                  {suggestedOrder.slice(0, 5).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-ink">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">{index + 1}</span>
                      <span className="truncate">{item.time} · {item.name}</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="primary-button w-full" onClick={() => reorderDayByProximity(day.day)}>
                  Aplicar orden por cercanía
                </button>
              </div>
            ) : (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                El orden actual parece razonable por cercanía o faltan coordenadas para mejorarlo.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Recomendaciones de descanso">
            <div className="grid gap-3">
              {dayAnalysis.recommendations.map((recommendation) => (
                <div key={recommendation} className="rounded-2xl bg-ink p-4 text-sm font-semibold leading-6 text-white">
                  <Clock className="mb-3 text-primary-100" size={20} />
                  {recommendation}
                </div>
              ))}
              {dayAnalysis.restWindows.slice(0, 2).map((window) => (
                <p key={`${window.after}-${window.before}`} className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                  Hay {Math.round(window.minutes)} min libres entre {window.after} y {window.before}.
                </p>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Revisión automática">
            <div className="rounded-3xl bg-primary-50 p-5">
              <Lightbulb className="mb-4 text-primary-700" size={22} />
              <h3 className="font-black text-ink">Revisión automática</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Detecta días cargados, actividades cercanas y tareas relacionadas.</p>
              <Link to={`/trips/${activeTripId}/suggestions`} className="primary-button mt-5 w-full">
                Revisar itinerario
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Solapes y noches">
            <div className="grid gap-3">
              {[...dayIssues, ...lodgingIssues].slice(0, 5).map((issue) => (
                <div key={`${issue.title}-${issue.detail}`} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={18} />
                    <div>
                      <p className="font-black text-ink">{issue.title}</p>
                      <p className="mt-1 text-sm text-amber-800">{issue.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
              {![...dayIssues, ...lodgingIssues].length ? (
                <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">No se detectan solapes ni noches sin alojamiento para este viaje.</p>
              ) : null}
            </div>
          </SectionCard>
        </aside>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingActivity(null); }} title={editingActivity ? "Editar actividad" : "Añadir actividad"} description="Crea o ajusta una actividad del timeline del día elegido.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect label="Día" value={form.day} onChange={(event) => update("day", event.target.value)}>
              {itineraryDays.map((item) => <option key={item.day}>{item.day}</option>)}
            </FormSelect>
            <FormInput label="Hora" type="time" value={form.time} onChange={(event) => update("time", event.target.value)} />
            <FormInput label="Nombre" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Paseo por Piazza Navona" />
            <FormSelect label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)}>
              {["Transporte", "Visita", "Comida", "Alojamiento", "Experiencia"].map((type) => <option key={type}>{type}</option>)}
            </FormSelect>
            <FormInput label="Dirección o zona" value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Centro histórico" />
            <FormInput label="Duración estimada" value={form.duration} onChange={(event) => update("duration", event.target.value)} placeholder="1 h" />
            <FormInput label="Tiempo desde el punto anterior" value={form.travelTime} onChange={(event) => update("travelTime", event.target.value)} placeholder="15 min caminando" />
            <FormInput label="Coste estimado" value={form.cost} onChange={(event) => update("cost", event.target.value)} placeholder="Gratis" />
            <FormInput label="Latitud" type="number" step="any" value={form.lat} onChange={(event) => update("lat", event.target.value)} placeholder="41.9009" />
            <FormInput label="Longitud" type="number" step="any" value={form.lng} onChange={(event) => update("lng", event.target.value)} placeholder="12.4833" />
          </div>
          <FormTextarea label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Consejo breve para recordar durante el viaje" />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingActivity(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingActivity ? "Guardar cambios" : "Guardar actividad"}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deletingActivity)}
        title="Eliminar actividad"
        description={`Vas a eliminar ${deletingActivity?.name || "esta actividad"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingActivity(null)}
        onConfirm={() => {
          deleteActivity(deletingActivity.day, deletingActivity.index);
          setDeletingActivity(null);
        }}
      />
    </div>
  );
}
