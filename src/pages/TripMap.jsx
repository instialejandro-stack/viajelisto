import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock, Coffee, LocateFixed, MapPin, Minus, Navigation, Plus, Route, Search, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import DayTabs from "../components/DayTabs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import {
  buildOsmTiles,
  clusterMapPoints,
  getDayMapPoints,
  getMapCenter,
  getNearbyUsefulPoints,
  hasCoordinates,
  lonLatToWorldPixel,
  searchKnownLocations,
  worldPixelToLonLat,
} from "../utils/mapUtils.js";

function pointLabel(point) {
  return `${point.time ? `${point.time} - ` : ""}${point.name}`;
}

function MapCanvas({ points, title, selectedPointId, onSelectPoint, focusPoint }) {
  const mappable = points.filter(hasCoordinates);
  const initialCenter = useMemo(() => getMapCenter(mappable), [mappable]);
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(14);
  const [size, setSize] = useState({ width: 960, height: 520 });
  const map = buildOsmTiles(center, zoom, size.width, size.height);
  const clusters = useMemo(() => clusterMapPoints(mappable, map), [mappable, map]);

  useEffect(() => {
    setCenter(initialCenter);
  }, [initialCenter.lat, initialCenter.lng]);

  useEffect(() => {
    if (focusPoint?.lat !== undefined && focusPoint?.lng !== undefined) {
      setCenter({ lat: Number(focusPoint.lat), lng: Number(focusPoint.lng) });
      setZoom((current) => Math.max(current, 15));
    }
  }, [focusPoint?.lat, focusPoint?.lng]);

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

  function zoomBy(delta, anchorEvent = null) {
    const nextZoom = Math.max(11, Math.min(18, zoom + delta));
    if (anchorEvent && nextZoom !== zoom && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = anchorEvent.clientX - rect.left - size.width / 2;
      const offsetY = anchorEvent.clientY - rect.top - size.height / 2;
      const before = moveByPixels(-offsetX, -offsetY, center, zoom);
      const beforePx = lonLatToWorldPixel(before.lat, before.lng, nextZoom);
      const nextCenterPx = { x: beforePx.x + offsetX, y: beforePx.y + offsetY };
      setCenter(worldPixelToLonLat(nextCenterPx.x, nextCenterPx.y, nextZoom));
    }
    setZoom(nextZoom);
  }

  function handleWheel(event) {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 1 : -1, event);
  }

  function handleDoubleClick(event) {
    event.preventDefault();
    zoomBy(1, event);
  }

  function selectCluster(cluster) {
    const first = cluster.points[0];
    onSelectPoint?.(first.id);
    if (cluster.points.length > 1) {
      setCenter(getMapCenter(cluster.points));
      setZoom((current) => Math.min(18, current + 1));
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[460px] cursor-grab touch-none overflow-hidden rounded-[2rem] border border-primary-100 bg-slate-100 shadow-sm active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
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

      {clusters.length ? (
        clusters.map((cluster, index) => {
          const first = cluster.points[0];
          const selected = cluster.points.some((point) => point.id === selectedPointId);
          const isNearby = first.source === "nearby";
          const isSearch = first.source === "search";
          return (
            <button
              key={cluster.id}
              type="button"
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: cluster.left, top: cluster.top }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => { event.stopPropagation(); selectCluster(cluster); }}
              title={cluster.points.map(pointLabel).join("\n")}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white shadow-soft ring-4 transition ${selected ? "scale-110 ring-primary-200" : "ring-white"} ${isSearch ? "bg-violet-600" : isNearby ? "bg-emerald-600" : "bg-primary-600"}`}>
                {cluster.points.length > 1 ? cluster.points.length : isNearby ? <Coffee size={18} /> : isSearch ? <Search size={18} /> : index + 1}
              </span>
              {(selected || cluster.points.length === 1) && (
                <span className={`absolute left-1/2 z-10 mt-2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-2xl px-3 py-2 text-xs font-bold text-white shadow-lg sm:block ${selected ? "bg-primary-700" : "bg-ink"}`}>
                  {cluster.points.length > 1 ? `${cluster.points.length} puntos cercanos` : pointLabel(first)}
                </span>
              )}
            </button>
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
              Arrastra, usa la rueda o doble clic para navegar. Zoom {zoom}.
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
  const [query, setQuery] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [searchPoint, setSearchPoint] = useState(null);
  const searchResults = useMemo(() => searchKnownLocations(query), [query]);
  const day = itineraryDays[active] || itineraryDays[0];
  const { points, missing } = useMemo(
    () => getDayMapPoints(day, { places, restaurants, lodgings }),
    [day, places, restaurants, lodgings]
  );
  const nearbyPoints = useMemo(() => getNearbyUsefulPoints(lodgings), [lodgings]);
  const visiblePoints = [searchPoint, ...points, ...(showNearby ? nearbyPoints : [])].filter(Boolean);
  const selectedPoint = visiblePoints.find((point) => point.id === selectedPointId) || searchPoint;

  useEffect(() => {
    setSelectedPointId("");
    setSearchPoint(null);
  }, [active]);

  if (!activeTrip) {
    return <EmptyState title="No hay viaje seleccionado" description="Abre un viaje desde el Dashboard para ver su mapa por días." />;
  }

  function chooseSearchResult(result) {
    setSearchPoint(result);
    setSelectedPointId(result.id);
    setQuery(result.name);
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
          <div className="mb-4 grid gap-3 rounded-3xl border border-line bg-white p-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-black text-ink">Buscar ubicación</p>
              <p className="mt-1 text-sm text-slate-500">Busca por nombre en el catálogo local de la demo. No se conecta a APIs externas.</p>
            </div>
            <div className="relative min-w-0 lg:w-[340px]">
              <div className="flex rounded-2xl border border-line bg-slate-50 px-3 py-2 focus-within:border-primary-200 focus-within:ring-2 focus-within:ring-primary-100">
                <Search className="mr-2 mt-0.5 shrink-0 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Fontana di Trevi, Torre Eiffel..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-slate-400"
                />
              </div>
              {searchResults.length ? (
                <div className="absolute right-0 top-12 z-30 w-full rounded-2xl border border-line bg-white p-2 shadow-soft">
                  {searchResults.map((result) => (
                    <button key={result.id} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-ink hover:bg-primary-50" onClick={() => chooseSearchResult(result)}>
                      {result.name}
                      <span className="ml-2 text-xs font-semibold text-slate-400">{result.zone}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

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
          <MapCanvas
            points={visiblePoints}
            title={`${activeTrip.name} · ${day?.day || "Día"}`}
            selectedPointId={selectedPointId}
            onSelectPoint={setSelectedPointId}
            focusPoint={selectedPoint}
          />
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Puntos del día">
            {points.length ? (
              <div className="grid gap-3">
                {points.map((point, index) => {
                  const selected = selectedPointId === point.id;
                  return (
                    <button
                      key={point.id}
                      type="button"
                      className={`rounded-2xl border p-4 text-left transition ${selected ? "border-primary-200 bg-primary-50 shadow-sm" : "border-line bg-white hover:border-primary-100 hover:bg-slate-50"}`}
                      onClick={() => setSelectedPointId(point.id)}
                    >
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
                    </button>
                  );
                })}
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
                  <button key={point.id} type="button" className={`rounded-2xl border p-4 text-left transition ${selectedPointId === point.id ? "border-emerald-200 bg-emerald-100" : "border-emerald-100 bg-emerald-50 hover:bg-emerald-100"}`} onClick={() => setSelectedPointId(point.id)}>
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
                  </button>
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
