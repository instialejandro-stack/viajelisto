import React from "react";
import {
  ArrowRight,
  Backpack,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Coins,
  FileText,
  Lightbulb,
  MapPinned,
  Plane,
  ReceiptText,
  Route,
  Soup,
  Sparkles,
  Ticket,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar.jsx";

const mockItems = [
  ["Vuelo Tenerife — Roma", "10 mayo, 08:30", Plane],
  ["Hotel Artemide, Roma", "Reserva confirmada", BedDouble],
  ["Coliseo y Foro Romano", "Día 2, 09:30", MapPinned],
];

const features = [
  { label: "Itinerario", desc: "Plan diario por horas y actividades.", icon: Route, color: "bg-cyan-50 text-cyan-700" },
  { label: "Transporte", desc: "Vuelos, trenes y traslados.", icon: Plane, color: "bg-sky-50 text-sky-700" },
  { label: "Alojamiento", desc: "Hoteles y apartamentos.", icon: BedDouble, color: "bg-indigo-50 text-indigo-700" },
  { label: "Lugares", desc: "Puntos de interés priorizados.", icon: MapPinned, color: "bg-emerald-50 text-emerald-700" },
  { label: "Restaurantes", desc: "Comidas por zona y precio.", icon: Soup, color: "bg-amber-50 text-amber-700" },
  { label: "Presupuesto", desc: "Gastos estimados vs. reales.", icon: ReceiptText, color: "bg-violet-50 text-violet-700" },
  { label: "Documentos", desc: "Reservas, billetes e IDs.", icon: FileText, color: "bg-rose-50 text-rose-700" },
  { label: "Checklist", desc: "Tareas antes, durante y después.", icon: CheckSquare, color: "bg-teal-50 text-teal-700" },
  { label: "Maleta", desc: "Lista de equipaje por categoría.", icon: Backpack, color: "bg-orange-50 text-orange-700" },
  { label: "Reservas", desc: "Entradas y confirmaciones.", icon: Ticket, color: "bg-pink-50 text-pink-700" },
  { label: "Ideas", desc: "Compara destinos antes de decidir.", icon: Lightbulb, color: "bg-yellow-50 text-yellow-700" },
  { label: "Moneda", desc: "Conversión y control de divisas.", icon: Coins, color: "bg-lime-50 text-lime-700" },
];

const steps = [
  {
    n: "1",
    title: "Compara y elige destino",
    desc: "Guarda varias ideas de viaje, añade pros y contras, presupuesto y puntuación para tomar la decisión correcta.",
    icon: Lightbulb,
    color: "bg-amber-50 text-amber-600",
  },
  {
    n: "2",
    title: "Organiza cada detalle",
    desc: "Transporte, alojamiento, itinerario, restaurantes, reservas y documentos: todo en un panel claro y accesible.",
    icon: MapPinned,
    color: "bg-primary-50 text-primary-600",
  },
  {
    n: "3",
    title: "Viaja sin preocupaciones",
    desc: "Lleva el seguimiento en tiempo real, controla el presupuesto y guarda recuerdos. Todo desde tu móvil o PC.",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
  },
];

const stats = [
  ["12+", "módulos integrados"],
  ["100%", "datos privados"],
  ["0", "cuentas necesarias"],
  ["∞", "viajes que puedes crear"],
];

export default function LandingPage() {
  return (
    <div className="bg-white text-ink">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm font-black text-white shadow-sm">
              VL
            </span>
            <span className="font-black text-ink">ViajeListo</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-500 md:flex">
            <a href="#como-funciona" className="transition hover:text-ink">Cómo funciona</a>
            <a href="#funcionalidades" className="transition hover:text-ink">Funcionalidades</a>
          </nav>
          <Link to="/dashboard" className="primary-button px-4">
            Abrir demo <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#cffafe,transparent)] pt-16 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f0fdff_0%,#ffffff_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pb-8">
          {/* Left */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-bold text-primary-700 shadow-sm">
              <Sparkles size={14} /> Planificador integral de viajes · Demo gratuita
            </div>
            <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-ink sm:text-6xl">
              Todo tu viaje,<br />organizado<br />
              <span className="text-primary-600">antes de salir.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Planifica destinos, vuelos, alojamiento, rutas, presupuesto y documentos desde un único panel. Sin hojas de cálculo, sin pestañas sueltas.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["Itinerario", "Presupuesto", "Reservas", "Maleta", "Documentos"].map((f) => (
                <span key={f} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                  {f}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="primary-button px-6 py-3 text-base">
                Explorar demo <ArrowRight size={18} />
              </Link>
              <a href="#como-funciona" className="secondary-button px-6 py-3 text-base">
                Cómo funciona
              </a>
            </div>
          </div>

          {/* Right — mock card */}
          <div className="relative">
            <div className="absolute -right-2 -top-4 z-10 hidden rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-soft sm:flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Todo listo para Roma
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_24px_80px_rgba(24,39,75,0.14)]">
              <div
                className="h-44 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80')" }}
              />
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-600">Viaje activo</p>
                    <h2 className="mt-1 text-2xl font-black text-ink">Viaje a Roma</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays size={14} /> 10 may — 15 may · 2 personas
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    En planificación
                  </span>
                </div>
                <ProgressBar value={72} label="Preparación del viaje" />
                <div className="mt-5 grid gap-2.5">
                  {mockItems.map(([title, meta, Icon]) => (
                    <div key={title} className="flex items-center gap-3 rounded-2xl border border-line bg-slate-50 p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-ink">{title}</p>
                        <p className="text-xs text-slate-500">{meta}</p>
                      </div>
                      <CheckCircle2 className="ml-auto shrink-0 text-emerald-500" size={17} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-3 hidden rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 shadow-soft sm:block">
              <WalletCards size={14} className="mb-0.5 inline" /> 900 € · 72% preparado
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
          {stats.map(([value, label]) => (
            <div key={label} className="flex flex-col items-center py-6 text-center">
              <span className="text-3xl font-black text-ink">{value}</span>
              <span className="mt-1 text-sm font-bold text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="como-funciona" className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-black uppercase tracking-wider text-primary-600">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-black text-ink sm:text-4xl">De idea suelta a viaje listo</h2>
            <p className="mt-4 text-lg text-slate-500">Tres pasos para tener cada detalle bajo control antes de salir.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map(({ n, title, desc, icon: Icon, color }) => (
              <div key={n} className="relative overflow-hidden rounded-[2rem] border border-line bg-white p-7 shadow-soft">
                <div className="mb-5 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-xl font-black text-white">
                    {n}
                  </span>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                    <Icon size={22} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-primary-600">Funcionalidades</p>
              <h2 className="mt-3 max-w-xl text-3xl font-black text-ink sm:text-4xl">
                Todas las áreas del viaje en una sola plataforma
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-500">
              La demo incluye datos de ejemplo de un viaje a Roma para que puedas explorar todo desde el primer momento.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map(({ label, desc, icon: Icon, color }) => (
              <article
                key={label}
                className="group rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_24px_60px_rgba(24,39,75,0.12)]"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-black text-ink">{label}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-mist px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-ink to-[#1e3a5f] p-8 shadow-[0_30px_90px_rgba(24,39,75,0.22)] sm:p-12 lg:p-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-primary-300">Demo navegable · Sin registro</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-5xl">
                Explora ViajeListo con un viaje completo a Roma
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-300">
                Revisa dashboard, itinerario, reservas, presupuesto, documentos y checklist con una experiencia completa lista para presentar.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-ink shadow-lg transition hover:bg-primary-50"
            >
              Abrir dashboard <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white px-4 py-8 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-xs font-black text-white">VL</span>
            ViajeListo
          </Link>
          <p>© 2026 ViajeListo · Demo de producto · Datos 100% locales</p>
        </div>
      </footer>
    </div>
  );
}
