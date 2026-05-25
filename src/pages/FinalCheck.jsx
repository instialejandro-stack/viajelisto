import React from "react";
import { AlertTriangle, CheckCircle2, FileText, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { getFinalReadiness, getTripCountdown } from "../utils/tripIntelligence.js";

function badgeFor(severity) {
  if (severity === "alta") return "Alta";
  if (severity === "media") return "Media";
  if (severity === "correcto") return "Correcto";
  return "Baja";
}

export default function FinalCheck() {
  const state = useAppState();
  const { activeTrip, activeTripId, activeTripData } = state;
  const readiness = activeTrip ? getFinalReadiness(activeTrip, activeTripData) : null;
  const countdown = activeTrip ? getTripCountdown(activeTrip) : null;

  if (!activeTrip) {
    return <EmptyState title="No hay viaje seleccionado" description="Abre un viaje desde el Dashboard para revisar su estado final." actionLabel="Volver al Dashboard" actionHref="/dashboard" />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Antes de salir"
        title="Comprobador final"
        subtitle="Revisa avisos importantes del viaje con reglas locales: fechas, reservas, documentos, itinerario, maleta y gastos."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Estado general" value={`${readiness.score}%`} hint={readiness.label} accent="emerald" />
        <StatCard icon={AlertTriangle} label="Avisos críticos" value={readiness.blockers} hint="Conviene resolverlos antes de salir" accent="amber" />
        <StatCard icon={FileText} label="Cuenta atrás" value={countdown.label} hint={countdown.phase} accent="violet" />
      </div>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-black text-ink">{readiness.label}</h2>
            <p className="mt-2 text-sm text-slate-500">Puntuación calculada a partir de tareas, reservas, documentos, alojamiento e itinerario.</p>
          </div>
          <Badge>{countdown.status}</Badge>
        </div>
        <div className="mt-5">
          <ProgressBar value={readiness.score} label="Preparación final" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Avisos del viaje">
          <div className="grid gap-3">
            {readiness.checks.map((check) => (
              <article key={`${check.title}-${check.detail}`} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black text-ink">{check.title}</h3>
                  <Badge>{badgeFor(check.severity)}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{check.detail}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Acciones recomendadas">
            <div className="grid gap-3">
              <Link to={`/trips/${activeTripId}/checklist`} className="secondary-button justify-center">Revisar checklist</Link>
              <Link to={`/trips/${activeTripId}/documents`} className="secondary-button justify-center">Revisar documentos</Link>
              <Link to={`/trips/${activeTripId}/packing`} className="secondary-button justify-center">Revisar maleta</Link>
              <Link to={`/trips/${activeTripId}/print`} className="primary-button justify-center"><Printer size={16} /> Imprimir resumen</Link>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
