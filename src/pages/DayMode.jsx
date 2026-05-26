import React, { useState } from "react";
import { CalendarDays, CheckCircle2, Clock, FileText, MapPin, ReceiptText, Route } from "lucide-react";
import { Link } from "react-router-dom";
import DayTabs from "../components/DayTabs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function DayMode() {
  const { activeTripId, itineraryDays, dayModeChecks = {}, documents = [], expenses = [], transports = [], toggleDayModeCheck } = useAppState();
  const [active, setActive] = useState(0);
  const day = itineraryDays[active] || itineraryDays[0];
  const items = day?.items || [];
  const done = items.filter((item) => dayModeChecks[`${day.day}-${item.time}-${item.name}`]).length;
  const nextItem = items.find((item) => !dayModeChecks[`${day.day}-${item.time}-${item.name}`]);
  const dayDocuments = documents.filter((document) => String(document.related || document.date || "").toLowerCase().includes(String(day?.day || "").toLowerCase()) || String(document.date || "").includes(day?.date || ""));
  const pendingExpenses = expenses.filter((expense) => expense.status === "pendiente").slice(0, 3);
  const dayTransports = transports.filter((transport) => String(transport.date || "").includes(day?.date || "") || items.some((item) => item.name?.includes(transport.origin) || item.name?.includes(transport.destination)));

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Durante el viaje" title="Modo día del viaje" subtitle="Consulta qué toca ahora, qué viene después y marca actividades completadas durante el día." />
      <DayTabs days={itineraryDays} active={active} onChange={setActive} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Día seleccionado" value={day?.day || "-"} hint={day?.date || "Sin fecha"} />
        <StatCard icon={CheckCircle2} label="Hecho" value={`${done}/${items.length}`} hint="Actividades del día" accent="emerald" />
        <StatCard icon={Clock} label="Siguiente" value={nextItem?.time || "-"} hint={nextItem?.name || "Sin actividades pendientes"} accent="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title={day ? `${day.day}: ${day.title}` : "Día"}>
          {items.length ? (
            <div className="grid gap-3">
              {items.map((item) => {
                const key = `${day.day}-${item.time}-${item.name}`;
                const checked = Boolean(dayModeChecks[key]);
                return (
                  <label key={key} className={`grid cursor-pointer gap-3 rounded-2xl border p-4 sm:grid-cols-[90px_1fr] ${checked ? "border-emerald-100 bg-emerald-50/70" : "border-line bg-white"}`}>
                    <span className="flex h-10 w-fit items-center rounded-xl bg-white px-3 text-sm font-black text-primary-700 shadow-sm">{item.time}</span>
                    <span className="flex min-w-0 items-start gap-3">
                      <input type="checkbox" className="mt-1 h-5 w-5 rounded border-line text-primary-600" checked={checked} onChange={() => toggleDayModeCheck(key)} />
                      <span>
                        <span className={`block font-black ${checked ? "text-slate-400 line-through" : "text-ink"}`}>{item.name}</span>
                        <span className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
                          <span>{item.type}</span>
                          <span>·</span>
                          <span>{item.address}</span>
                          {item.travelTime ? <><span>·</span><span>{item.travelTime}</span></> : null}
                        </span>
                        {item.notes ? <span className="mt-2 block text-sm leading-6 text-slate-500">{item.notes}</span> : null}
                      </span>
                    </span>
                  </label>
                );
              })}
              <Link to={`/trips/${activeTripId}/map`} className="secondary-button justify-center">
                <MapPin size={17} /> Ver mapa del día
              </Link>
            </div>
          ) : (
            <EmptyState title="No hay actividades para este día" description="Añade actividades al itinerario para usar el modo día durante el viaje." />
          )}
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Ahora">
            {nextItem ? (
              <div className="rounded-3xl bg-ink p-5 text-white">
                <Clock className="mb-4 text-primary-100" size={24} />
                <p className="text-sm font-bold text-slate-300">{nextItem.time}</p>
                <h3 className="mt-2 text-xl font-black">{nextItem.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">{nextItem.address}</p>
              </div>
            ) : (
              <EmptyState title="Día completado" description="No quedan actividades pendientes en este día." />
            )}
          </SectionCard>
          <SectionCard title="Para llevar hoy">
            <div className="grid gap-3">
              <InfoLine icon={FileText} label="Documentos" value={dayDocuments.length ? `${dayDocuments.length} relacionados` : "Sin documentos vinculados"} />
              <InfoLine icon={ReceiptText} label="Gastos pendientes" value={pendingExpenses.length ? `${pendingExpenses.length} por revisar` : "Nada pendiente"} />
              <InfoLine icon={Route} label="Transportes" value={dayTransports.length ? `${dayTransports.length} previstos` : "Sin transportes este día"} />
            </div>
          </SectionCard>
          <SectionCard title="Recordatorios útiles">
            <div className="grid gap-3 text-sm font-bold text-slate-600">
              <p className="flex gap-2 rounded-2xl bg-slate-50 p-4"><MapPin size={17} /> Revisa dirección y margen de desplazamiento.</p>
              <p className="flex gap-2 rounded-2xl bg-slate-50 p-4"><Route size={17} /> Guarda tickets y justificantes de gastos.</p>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
        <Icon size={17} />
      </span>
      <span>
        <span className="block text-xs font-black uppercase text-slate-400">{label}</span>
        <span className="block text-sm font-black text-ink">{value}</span>
      </span>
    </div>
  );
}
