import React, { useState } from "react";
import { flushSync } from "react-dom";
import { CheckCircle2, Download, FileText, LayoutDashboard, MapPinned, Plane, Plus, WifiOff, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FormError, FormInput, FormSelect } from "../components/FormControls.jsx";
import OnboardingOptionCard from "../components/OnboardingOptionCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { formatDateRange } from "../utils/dateUtils.js";

const initialForm = {
  name: "",
  destination: "",
  dates: "",
  startDate: "",
  endDate: "",
  people: "2",
  budget: "",
  status: "Idea",
  templateId: "",
};

const benefits = [
  ["Todo tu viaje en un panel.", LayoutDashboard],
  ["Checklist y presupuesto siempre actualizados.", CheckCircle2],
  ["Resumen imprimible para llevarlo contigo.", FileText],
];

const typeColors = {
  Corto: "bg-primary-50 text-primary-700",
  Relax: "bg-emerald-50 text-emerald-700",
  Cultural: "bg-amber-50 text-amber-700",
  Completo: "bg-violet-50 text-violet-700",
  Ruta: "bg-rose-50 text-rose-700",
  Grupo: "bg-cyan-50 text-cyan-700",
  Familia: "bg-orange-50 text-orange-700",
  Profesional: "bg-slate-100 text-slate-700",
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const { addTrip, completeOnboarding, loadExampleTrip, tripTemplates = [] } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if ((field === "startDate" || field === "endDate") && next.startDate && next.endDate) {
        next.dates = formatDateRange(next.startDate, next.endDate);
      }
      return next;
    });
  }

  function selectTemplate(templateId) {
    setForm((current) => ({ ...current, templateId: current.templateId === templateId ? "" : templateId }));
  }

  function openExample() {
    let exampleTripId = "";
    flushSync(() => {
      exampleTripId = loadExampleTrip();
    });
    navigate(`/trips/${exampleTripId}/summary`, { replace: true });
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name || !form.destination || (!form.dates && (!form.startDate || !form.endDate)) || !form.budget) {
      setError("Completa nombre, destino, fechas y presupuesto para crear el viaje.");
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
      return;
    }
    flushSync(() => {
      addTrip(form);
      completeOnboarding();
    });
    navigate("/dashboard", { replace: true });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#ccfbf1_0%,transparent_30%),linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eefcff_100%)] px-4 py-8 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-8">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-soft">
            <Plane size={26} />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-wide text-primary-700">Empieza en menos de un minuto</p>
          <h1 className="mt-3 text-4xl font-black text-ink sm:text-6xl">Bienvenido a ViajeListo</h1>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            Organiza destinos, transporte, alojamiento, itinerario, presupuesto, documentos y tareas en un solo lugar.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          <OnboardingOptionCard
            icon={MapPinned}
            title="Ver viaje de ejemplo"
            description="Explora una demo ya preparada con un viaje a Roma, itinerario, reservas, presupuesto y checklist."
            actionLabel="Ver viaje de ejemplo"
            variant="primary"
            onClick={openExample}
          />
          <OnboardingOptionCard
            icon={Plus}
            title="Crear mi primer viaje"
            description="Añade un viaje propio con los datos básicos y empieza a organizarlo desde el dashboard."
            actionLabel="Crear mi primer viaje"
            onClick={() => setShowForm((current) => !current)}
          />
        </section>

        {showForm ? (
          <section className="rounded-[2rem] border border-line bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase text-primary-700">Nuevo viaje</p>
                <h2 className="mt-1 text-2xl font-black text-ink">Datos básicos para empezar</h2>
              </div>
              <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-sm font-black text-primary-700">Demo guiada</span>
            </div>
            <form onSubmit={submit} className="grid gap-6">
              <FormError>{error}</FormError>

              {/* Basic fields */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormInput
                  label="Nombre del viaje"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Escapada a Lisboa"
                />
                <FormInput
                  label="Destino"
                  value={form.destination}
                  onChange={(event) => update("destination", event.target.value)}
                  placeholder="Lisboa, Portugal"
                />
                <FormInput
                  label="Fecha inicio"
                  type="date"
                  value={form.startDate}
                  onChange={(event) => update("startDate", event.target.value)}
                />
                <FormInput
                  label="Fecha fin"
                  type="date"
                  value={form.endDate}
                  onChange={(event) => update("endDate", event.target.value)}
                />
                <FormInput
                  label="Personas"
                  type="number"
                  min="1"
                  value={form.people}
                  onChange={(event) => update("people", event.target.value)}
                />
                <FormInput
                  label="Presupuesto estimado"
                  value={form.budget}
                  onChange={(event) => update("budget", event.target.value)}
                  placeholder="650"
                />
                <FormSelect
                  label="Estado inicial"
                  value={form.status}
                  onChange={(event) => update("status", event.target.value)}
                >
                  <option>Idea</option>
                  <option>En planificación</option>
                </FormSelect>
              </div>

              {/* Visual template cards */}
              {tripTemplates.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-black text-ink">Plantilla de viaje <span className="font-medium text-slate-400">(opcional)</span></p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {tripTemplates.map((template) => {
                      const selected = form.templateId === template.id;
                      const tagColor = typeColors[template.type] || "bg-slate-100 text-slate-600";
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => selectTemplate(template.id)}
                          className={`rounded-2xl border p-4 text-left transition-all duration-150 ${
                            selected
                              ? "border-primary-400 bg-primary-50 shadow-glow-sm"
                              : "border-line bg-white hover:border-primary-200 hover:bg-primary-50/50"
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tagColor}`}>
                              {template.type}
                            </span>
                            {selected && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-ink">{template.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{template.bestFor}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {template.includes.slice(0, 3).map((inc) => (
                              <span key={inc} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                {inc}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {form.templateId && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                      onClick={() => update("templateId", "")}
                    >
                      Quitar plantilla
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  <WalletCards size={16} />
                  Guardar y entrar
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          {benefits.map(([benefit, Icon]) => (
            <div key={benefit} className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
                <Icon size={19} />
              </span>
              <p className="mt-4 font-black text-ink">{benefit}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-primary-100 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <Download size={22} />
              </span>
              <div>
                <p className="font-black text-ink">También puedes instalar la demo</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  ViajeListo está preparado como app instalable y guarda la información principal en este dispositivo.
                </p>
              </div>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
              <WifiOff size={17} /> Base offline activa
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
