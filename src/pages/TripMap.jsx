import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock, Coffee, LocateFixed, MapPin, Minus, Navigation, Plus, Route, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import DayTabs from "../components/DayTabs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { buildOsmTiles, getDayMapPoints, getMapCenter, getNearbyUsefulPoints, hasCoordinates, lonLatToWorldPixel, projectPointToMap, worldPixelToLonLat } from "../utils/mapUtils.js";

function MapCanvas({ points, title }) {
  const mappable = points.filter(hasCoordinates);
  const initialCenter = useMemo(() => getMapCenter(mappable), [mappable]);
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(14);
  const [size, setSize] = useState({ width: 960, height: 520 });
  const map = buildOsmTiles(center, zoom, size.width, size.height);

  useEffect(() => {
    setCenter(initialCenter);
  }, [initialCenter.lat, initialCenter.lng]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setSize({ width: Math.max(320, rect.width), height: Math.max(460, rect.height) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function moveByPixels(deltaX, deltaY, fromCenter = center, fromZoom = zoom) {
    const centerPx = lonLatToWorldPixel(fromCenter.lat, fromCenter.lng, fromZoom);
    return worldPixelToLonLat(centerPx.x - deltaX, centerPx.y - deltaY, fromZoom);
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, center };
  }

  function onPointerMove(event) {
    if (!dragRef.current) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    setCenter(moveByPixels(deltaX, deltaY, dragRef.current.center, zoom));
  }

  function onPointerUp(event) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
  }

  function zoomBy(delta) {
    setZoom((current) => Math.max(11, Math.min(17, current + delta)));
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[460px] cursor-grab touch-none overflow-hidden rounded-[2rem] border border-primary-100 bg-slate-100 shadow-sm active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="absolute inset-0">
        {map.tiles.map((tile) => (
          <img key={tile.key} src={tile.url} alt="" draggable="false" className="absolute h-64 w-64 select-none" style={{ left: tile.left, top: tile.top }} />
        ))}
      </div>
      <div className="absolute inset-0 bg-primary-50/15" />

      <div className="absolute right-4 top-4 z-20 grid gap-2" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" className="icon-button bg-white shadow-sm" onClick={(event) => { event.stopPropagation(); zoomBy(1); }} aria-label="Acercar mapa">
          <Plus size={17} />
        </button>
        <button type="button" className="icon-button bg-white shadow-sm" onClick={(event) => { event.stopPropagation(); zoomBy(-1); }} aria-label="Alejar mapa">
          <Minus size={17} />
        </button>
        <button type="button" className="icon-button bg-white shadow-sm" onClick={(event) => { event.stopPropagation(); setCenter(initialCenter); setZoom(14); }} aria-label="Centrar mapa">
          <LocateFixed size={17} />
        </button>
      </div>

      {mappable.length ? (
        mappable.map((point, index) => {
          const position = projectPointToMap(point, map);
          return (
            <div key={point.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: position.left, top: position.top }}>
              <div className="group relative">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-soft ring-4 ring-white ${point.source === "nearby" ? "bg-emerald-600" : "bg-primary-600"}`}>
                  {point.source === "nearby" ? <Coffee size={18} /> : index + 1}
                </span>
                <span className="absolute left-1/2 top-12 z-10 hidden w-max max-w-[220px] -translate-x-1/2 rounded-2xl bg-ink px-3 py-2 text-xs font-bold text-white shadow-lg sm:block">
                  {point.time ? `${point.time} - ` : ""}{point.name}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <EmptyState
            title="Sin puntos para mostrar"
            description="Añade actividades con ubicación o coordenadas para verlas en el mapa del día."
            icon={MapPin}
          />
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-col gap-3 rounded-3xl border border-line bg-white/92 p-4 shadow-sm backdrop-blur sm:left-5 sm:right-auto sm:max-w-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <Navigation size={18} />
          </span>
          <div>
            <p className="font-black text-ink">{title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Arrastra para moverte. Zoom {zoom}. OpenStreetMap sin API key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripMap() {
  const { activeTrip, activeTripId, itineraryDays, places, restaurants, lodgings } = useAppState();
  const [active, setActive] = useState(0);
  const [showNearby, setShowNearby] = useState(true);
  const day = itineraryDays[active] || itineraryDays[0];
  const { points, missing } = useMemo(
    () => getDayMapPoints(day, { places, restaurants, lodgings }),
    [day, places, restaurants, lodgings]
  );
  const nearbyPoints = useMemo(() => getNearbyUsefulPoints(lodgings), [lodgings]);
  const visiblePoints = showNearby ? [...points, ...nearbyPoints] : points;

  if (!activeTrip) {
    return <EmptyState title="No hay viaje seleccionado" description="Abre un viaje desde el Dashboard para ver su mapa por días." />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={activeTrip.destination}
        title="Mapa del viaje"
        subtitle="Visualiza solo los lugares y actividades planificados para el día seleccionado."
      />

      <DayTabs days={itineraryDays} active={active} onChange={setActive} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Día seleccionado" value={day?.day || "-"} hint={day?.date || "Sin fecha"} />
        <StatCard icon={MapPin} label="Puntos en mapa" value={visiblePoints.length} hint="Día seleccionado y cercanos" accent="emerald" />
        <StatCard icon={Route} label="Actividades" value={day?.items?.length || 0} hint="Planificadas este día" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <SectionCard title={`${day?.day || "Día"} en el mapa`}>
          <div className="mb-4 flex flex-col justify-between gap-3 rounded-3xl border border-line bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-black text-ink">Sitios cercanos al alojamiento</p>
              <p className="mt-1 text-sm text-slate-500">Bares, cafeterías, restaurantes y compras generados localmente desde la ubicación del hotel o piso.</p>
            </div>
            <button type="button" className={showNearby ? "primary-button" : "secondary-button"} onClick={() => setShowNearby((value) => !value)}>
              <ShoppingBasket size={16} />
              {showNearby ? "Ocultar cercanos" : "Mostrar cercanos"}
            </button>
          </div>
          <MapCanvas points={visiblePoints} title={`${activeTrip.name} · ${day?.day || "Día"}`} />
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Puntos del día">
            {points.length ? (
              <div className="grid gap-3">
                {points.map((point, index) => (
                  <div key={point.id} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-black text-primary-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-ink">{point.name}</p>
                          <Badge>{point.type}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {point.time ? `${point.time} · ` : ""}{point.address || point.zone}
                        </p>
                        {point.duration || point.cost ? (
                          <p className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
                            {point.duration ? <span>{point.duration}</span> : null}
                            {point.cost ? <span>{point.cost}</span> : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No hay puntos con coordenadas"
                description="Añade latitud y longitud manual en actividades o lugares para verlos en el mapa."
                actionLabel="Añadir actividad"
                actionHref={`/trips/${activeTripId}/itinerary`}
                icon={Plus}
              />
            )}
          </SectionCard>

          <SectionCard title="Cerca del alojamiento">
            {nearbyPoints.length ? (
              <div className="grid gap-3">
                {nearbyPoints.map((point) => (
                  <div key={point.id} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
                        <Coffee size={17} />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-ink">{point.name}</p>
                          <Badge>{point.type}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-emerald-800">{point.distance} · {point.relatedLodging}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Añade ubicación al alojamiento"
                description="Guarda latitud y longitud del hotel o piso para generar puntos útiles cercanos."
                actionLabel="Editar alojamiento"
                actionHref={`/trips/${activeTripId}/accommodation`}
                icon={ShoppingBasket}
              />
            )}
          </SectionCard>

          {missing.length ? (
            <SectionCard title="Ubicaciones sin coordenadas">
              <div className="grid gap-3">
                {missing.map((point) => (
                  <div key={point.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="font-black text-ink">{point.name}</p>
                    <p className="mt-1 text-sm text-amber-800">
                      {point.address || point.zone || "Tiene ubicación textual, pero faltan latitud y longitud."}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Accesos relacionados">
            <div className="grid gap-3">
              <Link to={`/trips/${activeTripId}/itinerary`} className="secondary-button justify-center">
                <Clock size={16} /> Editar itinerario
              </Link>
              <Link to={`/trips/${activeTripId}/places`} className="secondary-button justify-center">
                <MapPin size={16} /> Gestionar lugares
              </Link>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
