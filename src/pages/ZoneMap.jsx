import React, { useMemo } from "react";
import { MapPinned } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const colors = ["bg-primary-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500"];

export default function ZoneMap() {
  const { places, restaurants, lodgings } = useAppState();
  const zones = useMemo(() => {
    const groups = {};
    places.forEach((item) => {
      const zone = item.zone || "Sin zona";
      groups[zone] = [...(groups[zone] || []), { type: "Lugar", name: item.name, meta: item.day }];
    });
    restaurants.forEach((item) => {
      const zone = item.area || "Sin zona";
      groups[zone] = [...(groups[zone] || []), { type: "Restaurante", name: item.name, meta: item.day }];
    });
    lodgings.forEach((item) => {
      const zone = item.address || "Alojamiento";
      groups[zone] = [...(groups[zone] || []), { type: "Alojamiento", name: item.name, meta: item.status }];
    });
    return Object.entries(groups);
  }, [places, restaurants, lodgings]);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Mapa visual" title="Zonas del viaje" subtitle="Agrupa lugares, restaurantes y alojamiento por zonas sin usar mapas externos." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MapPinned} label="Zonas" value={zones.length} hint="Detectadas por tus datos" />
        <StatCard icon={MapPinned} label="Lugares" value={places.length} hint="Puntos guardados" accent="emerald" />
        <StatCard icon={MapPinned} label="Restaurantes" value={restaurants.length} hint="Sitios para comer" accent="violet" />
      </div>
      <SectionCard title="Mapa por zonas">
        {zones.length ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(135deg,#ecfeff,#f8fafc)] p-6">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:42px_42px]" />
              {zones.map(([zone, items], index) => (
                <div key={zone} className="absolute" style={{ left: `${15 + (index % 3) * 28}%`, top: `${18 + Math.floor(index / 3) * 28}%` }}>
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft ${colors[index % colors.length]}`}>{items.length}</span>
                  <p className="mt-2 max-w-32 rounded-xl bg-white/90 px-3 py-1 text-xs font-black text-ink shadow-sm">{zone}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3">
              {zones.map(([zone, items]) => (
                <div key={zone} className="rounded-2xl border border-line bg-white p-4">
                  <h3 className="font-black text-ink">{zone}</h3>
                  <div className="mt-3 grid gap-2 text-sm">
                    {items.map((item) => <p key={`${item.type}-${item.name}`} className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600"><strong className="text-ink">{item.name}</strong> · {item.type} · {item.meta}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : <EmptyState title="Sin zonas todavía" description="Añade lugares o restaurantes con zona para construir el mapa visual." />}
      </SectionCard>
    </div>
  );
}
