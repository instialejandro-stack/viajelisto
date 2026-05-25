import React from "react";
import { CheckCircle2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function ActivityProgress() {
  const { itineraryDays, activityDone = {}, toggleActivityDone } = useAppState();
  const activities = itineraryDays.flatMap((day) => day.items.map((item, index) => ({ ...item, day: day.day, key: `${day.day}-${index}-${item.time}-${item.name}` })));
  const done = activities.filter((item) => activityDone[item.key]).length;
  const progress = activities.length ? Math.round((done / activities.length) * 100) : 0;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Durante el viaje" title="Actividades realizadas" subtitle="Marca qué actividades ya se han completado durante el viaje." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Actividades" value={activities.length} hint="En el itinerario" />
        <StatCard icon={CheckCircle2} label="Realizadas" value={done} hint={`${progress}% completado`} accent="emerald" />
        <StatCard icon={CheckCircle2} label="Pendientes" value={activities.length - done} hint="Por hacer" accent="amber" />
      </div>
      <section className="card p-5"><ProgressBar value={progress} label="Actividades realizadas" /></section>
      <SectionCard title="Listado de actividades">
        {activities.length ? <div className="grid gap-3">{activities.map((activity) => (
          <label key={activity.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4">
            <input type="checkbox" className="mt-1 h-5 w-5 rounded border-line text-primary-600" checked={Boolean(activityDone[activity.key])} onChange={() => toggleActivityDone(activity.key)} />
            <span><span className={`font-black ${activityDone[activity.key] ? "text-slate-400 line-through" : "text-ink"}`}>{activity.day} · {activity.time} · {activity.name}</span><span className="mt-1 block text-sm text-slate-500">{activity.type} · {activity.address}</span></span>
          </label>
        ))}</div> : <EmptyState title="Sin actividades" description="Añade actividades al itinerario para controlar lo realizado." />}
      </SectionCard>
    </div>
  );
}
