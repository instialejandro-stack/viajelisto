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

const featureChips = [
  { label: "Itinerario", icon: Route },
  { label: "Presupuesto", icon: ReceiptText },
  { label: "Reservas", icon: Ticket },
  { label: "Maleta", icon: Backpack },
  { label: "Documentos", icon: FileText },
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
    gradient: "from-amber-500 to-orange-400",
  },
  {
    n: "2",
    title: "Organiza cada detalle",
    desc: "Transporte, alojamiento, itinerario, restaurantes, reservas y documentos: todo en un panel claro y accesible.",
    icon: MapPinned,
    color: "bg-primary-50 text-primary-600",
    gradient: "from-primary-500 to-cyan-400",
  },
  {
    n: "3",
    title: "Viaja sin preocupaciones",
    desc: "Lleva el seguimiento en tiempo real, controla el presupuesto y guarda recuerdos. Todo desde tu móvil o PC.",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
    gradient: "from-emerald-500 to-teal-400",
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
      {/* ─── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-black text-white shadow-sm">
              VL
            </span>
            <span className="font-bold text-ink">ViajeListo</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <a href="#como-funciona" className="transition hover:text-ink">Cómo funciona</a>
            <a href="#funcionalidades" className="transition hover:text-ink">Funcionalidades</a>
          </nav>
          <Link to="/dashboard" className="primary-button px-4">
            Abrir demo <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pb-24 pt-16">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_5%_5%,#ecfeff,transparent_60%),radial-gradient(ellipse_55%_45%_at_95%_100%,#cffafe30,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f0fdff_0%,#ffffff_50%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:pb-4">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
              <Sparkles size={13} className="text-primary-500" />
              Planificador integral de viajes · Sin registro
            </div>

            <h1 className="max-w-[520px] text-5xl font-black leading-[1.0] tracking-tight text-ink sm:text-6xl">
              Tu viaje,<br />
              organizado<br />
              <span className="bg-gradient-to-r from-primary-600 to-cyan-400 bg-clip-text text-transparent">
                desde aquí.
              </span>
            </h1>

            <p className="mt-6 max-w-[460px] text-lg leading-8 text-slate-500">
              Planifica destinos, vuelos, alojamiento, rutas, presupuesto y documentos desde un único panel. Sin hojas de cálculo, sin pestañas sueltas.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {featureChips.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                >
                  <Icon size={12} className="text-primary-500" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="primary-button px-6 py-3 text-base">
                Explorar demo <ArrowRight size={17} />
              </Link>
              <a href="#como-funciona" className="secondary-button px-6 py-3 text-base">
                Cómo funciona
              </a>
            </div>
          </div>

          {/* Right — mock card */}
          <div className="relative">
            {/* Floating badge — top right */}
            <div className="absolute -right-3 -top-5 z-10 hidden animate-float rounded-2xl border border-line bg-white px-4 py-2.5 shadow-card sm:flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span className="text-sm font-medium text-slate-700">Todo listo para Roma</span>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_32px_80px_rgba(15,23,42,0.14)]">
              {/* Cover */}
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">Roma, Italia</p>
                  <h2 className="mt-0.5 text-xl font-bold text-white">Viaje a Roma</h2>
                </div>
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                    En planificación
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6">
                <p className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={14} className="text-primary-500 shrink-0" />
                  10 may — 15 may · 2 personas
                </p>
                <ProgressBar value={72} label="Preparación del viaje" />
                <div className="mt-5 grid gap-2">
                  {mockItems.map(([title, meta, Icon]) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-line bg-slate-50/70 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{title}</p>
                        <p className="text-xs text-slate-400">{meta}</p>
                      </div>
                      <CheckCircle2 className="ml-auto shrink-0 text-emerald-500" size={15} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div className="absolute -bottom-4 -left-3 hidden rounded-2xl border border-line bg-white px-4 py-2.5 shadow-card sm:block">
              <div className="flex items-center gap-2">
                <WalletCards size={13} className="text-primary-600 shrink-0" />
                <span className="text-sm font-semibold text-slate-700">900 € presupuesto</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary-500 to-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-primary-600">72%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ────────────────────────────────────── */}
      <div className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
          {stats.map(([value, label]) => (
            <div key={label} className="flex flex-col items-center py-7 text-center">
              <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-4xl font-black text-transparent">
                {value}
              </span>
              <span className="mt-1.5 text-sm font-medium text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── How it works ─────────────────────────────────── */}
      <section id="como-funciona" className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="section-label">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-black text-ink sm:text-4xl">
              De idea suelta a viaje listo
            </h2>
            <p className="mt-4 text-base text-slate-500">
              Tres pasos para tener cada detalle bajo control antes de salir.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map(({ n, title, desc, icon: Icon, color, gradient }) => (
              <div
                key={n}
                className="group relative overflow-hidden rounded-[2rem] border border-line bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mb-6 flex items-center gap-4">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-sm`}
                  >
                    {n}
                  </span>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section id="funcionalidades" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="section-label">Funcionalidades</p>
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
                className="group rounded-3xl border border-line bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${color}`}
                >
                  <Icon size={19} />
                </div>
                <h3 className="text-sm font-bold text-ink">{label}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="bg-mist px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-ink via-[#1a2f4f] to-[#0e3a5a] p-8 shadow-modal sm:p-12 lg:p-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">
                Demo navegable · Sin registro
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-5xl">
                Explora ViajeListo con un viaje completo a Roma
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Revisa dashboard, itinerario, reservas, presupuesto, documentos y checklist con una experiencia completa lista para presentar.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-ink shadow-lg transition-all duration-200 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Abrir dashboard <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-line bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-black text-white">
              VL
            </span>
            ViajeListo
          </Link>
          <p className="text-sm text-slate-400">
            © 2026 ViajeListo · Demo de producto · Datos 100% locales
          </p>
        </div>
      </footer>
    </div>
  );
}
