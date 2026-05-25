import React from "react";
import { History as HistoryIcon } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function History() {
  const { history = [] } = useAppState();
  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Actividad" title="Historial de cambios" subtitle="Consulta los últimos cambios importantes realizados en este viaje." />
      <StatCard icon={HistoryIcon} label="Cambios registrados" value={history.length} hint="En este viaje" />
      <SectionCard title="Cambios recientes">
        {history.length ? <div className="grid gap-3">{history.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-white p-4">
            <p className="font-black text-ink">{item.action}</p>
            <p className="mt-1 text-sm text-slate-500">{item.detail || "Sin detalle"} · {new Date(item.date).toLocaleString("es-ES")}</p>
          </div>
        ))}</div> : <EmptyState title="Sin cambios todavía" description="Cuando edites o añadas elementos importantes, aparecerán aquí." />}
      </SectionCard>
    </div>
  );
}
