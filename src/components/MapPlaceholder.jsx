import React from "react";
import { MapPin } from "lucide-react";

const positions = [
  "left-[18%] top-[58%]",
  "left-[54%] top-[48%]",
  "left-[24%] top-[28%]",
  "left-[35%] top-[72%]",
  "left-[68%] top-[32%]",
];

export default function MapPlaceholder({ points, title = "Mapa del viaje" }) {
  return (
    <div className="relative min-h-80 overflow-hidden rounded-3xl border border-primary-100 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_48%,#f6f8fb_100%)]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-10%] top-[30%] h-20 w-[120%] rotate-[-12deg] rounded-full border-y border-primary-100" />
        <div className="absolute left-[10%] top-[5%] h-[120%] w-24 rotate-[28deg] rounded-full border-x border-slate-200" />
        <div className="absolute left-[55%] top-[-10%] h-[120%] w-28 rotate-[-24deg] rounded-full border-x border-primary-100" />
      </div>
      {points.map((point, index) => (
        <div key={point} className={`absolute ${positions[index % positions.length]}`}>
          <div className="group relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-soft ring-4 ring-white">
              <MapPin size={18} />
            </span>
            <span className="absolute left-1/2 top-12 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-bold text-white shadow-lg sm:block">
              {point}
            </span>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 rounded-2xl border border-line bg-white/90 p-4 shadow-sm backdrop-blur">
        <p className="text-sm font-black text-ink">{title}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">Mapa conceptual sin integración real todavía</p>
      </div>
    </div>
  );
}
