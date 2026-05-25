import React from "react";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, Hotel, MapPinned, Plane, ReceiptText, Route } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";

const mockItems = [
  ["Vuelo Tenerife - Roma", "10 mayo, 08:30", Plane],
  ["Hotel Artemide", "Reserva confirmada", Hotel],
  ["Coliseo y Foro Romano", "Día 2, 09:30", MapPinned],
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#cffafe_0,transparent_32%),linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)]">
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-100/60 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-sm font-bold text-primary-700 shadow-sm">
            Planificador integral de viajes
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-ink sm:text-6xl lg:text-7xl">
            Todo tu viaje, organizado antes de salir
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Planifica destinos, vuelos, alojamientos, restaurantes, rutas, presupuesto y documentos desde una sola plataforma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="primary-button px-5 py-3">
              Crear mi primer viaje <ArrowRight size={18} />
            </Link>
            <Link to="/viaje" className="secondary-button px-5 py-3">
              Ver ejemplo
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
            {[
              ["12", "secciones"],
              ["72%", "preparado"],
              ["900 €", "estimados"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-line bg-white/80 p-4 shadow-sm">
                <p className="text-2xl font-black text-ink">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-3 -top-3 hidden rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-soft sm:block">
            Todo listo para Roma
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_30px_90px_rgba(24,39,75,0.16)]">
            <div className="h-44 bg-[url('https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-primary-700">Viaje principal</p>
                  <h2 className="mt-1 text-2xl font-black text-ink">Viaje a Roma</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CalendarDays size={16} /> 10 mayo - 15 mayo · 2 personas
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">En planificación</span>
              </div>
              <ProgressBar value={72} label="Preparación del viaje" />
              <div className="mt-5 grid gap-3">
                {mockItems.map(([title, meta, Icon]) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl border border-line bg-slate-50 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-ink">{title}</p>
                      <p className="text-xs font-medium text-slate-500">{meta}</p>
                    </div>
                    <CheckCircle2 className="ml-auto shrink-0 text-emerald-500" size={18} />
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Itinerario", Route],
                  ["Presupuesto", ReceiptText],
                  ["Documentos", FileText],
                ].map(([label, Icon]) => (
                  <div key={label} className="rounded-2xl bg-primary-50 p-3 text-sm font-black text-primary-700">
                    <Icon className="mb-2" size={18} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
