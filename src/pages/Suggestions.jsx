import React, { useMemo } from "react";
import { BadgeCheck, CheckSquare, Info, Lightbulb, ListChecks, MapPinned, ReceiptText, Route, ShieldCheck } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import SuggestionCard from "../components/SuggestionCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

function money(value) {
  return Number.parseInt(String(value).replace(/[^\d]/g, ""), 10) || 0;
}

function buildItineraryReview(days) {
  return days.map((day) => {
    const hasVatican = day.items.some((item) => /vaticano|san pedro/i.test(`${item.name} ${item.address}`));
    const hasTrastevere = day.items.some((item) => /trastevere/i.test(`${item.name} ${item.address}`));
    const hasColosseum = day.items.some((item) => /coliseo|foro/i.test(`${item.name} ${item.address}`));
    const noCostOrDuration = day.items.some((item) => !item.cost || !item.duration);
    const manyActivities = day.items.length >= 5;
    const fewActivities = day.items.length <= 2;
    const items = [];

    if (day.day === "Día 1") {
      items.push({ label: "Correcto", text: "Centro histórico agrupado: Fontana di Trevi y Panteón encajan bien en la misma tarde." });
      items.push({ label: "Aviso", text: "Cena en Trastevere puede quedar algo lejos del Panteón; deja margen de desplazamiento." });
      items.push({ label: "Recomendación", text: "Deja 30-45 minutos de margen entre visitas para caminar sin prisa." });
    } else if (hasVatican) {
      items.push({ label: "Correcto", text: "Vaticano por la mañana reduce esperas y deja la tarde más flexible." });
      items.push({ label: "Recomendación", text: "Reserva entradas de Museos Vaticanos con antelación." });
      if (hasTrastevere) items.push({ label: "Sugerencia", text: "Trastevere encaja bien por la tarde/noche después del Vaticano." });
    } else if (hasColosseum) {
      items.push({ label: "Correcto", text: "Coliseo y Foro Romano deberían ir juntos por cercanía." });
      items.push({ label: "Recomendación", text: "Lleva agua y evita añadir demasiadas visitas intensas ese mismo día." });
    }

    if (manyActivities) items.push({ label: "Aviso", text: "Este día tiene muchas actividades. Considera añadir un descanso o simplificar la tarde." });
    if (fewActivities) items.push({ label: "Sugerencia", text: "Hay huecos libres. Puedes dejarlo como día flexible o añadir una visita ligera." });
    if (noCostOrDuration) items.push({ label: "Aviso", text: "Hay actividades sin coste o duración. Añadirlos mejorará la previsión del viaje." });

    return { title: day.day, subtitle: `${day.title} · ${day.items.length} actividades`, items: items.length ? items : [{ label: "Correcto", text: "El día está equilibrado y sin avisos relevantes." }] };
  });
}

export default function Suggestions() {
  const { checklist, itineraryDays, expenses, budgetRows, activeTrip } = useAppState();
  const allTasks = Object.values(checklist).flat();
  const pendingImportant = allTasks.filter((task) => !task.done && ["alta", "media"].includes(task.priority));
  const estimated = money(activeTrip?.budget || 0);
  const baseSpent = budgetRows.reduce((sum, row) => sum + row.spent, 0);
  const extraPaid = expenses.filter((expense) => expense.userAdded && expense.status === "pagado").reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const spent = baseSpent + extraPaid;
  const pending = Math.max(0, estimated - spent);
  const percent = estimated ? Math.min(Math.round((spent / estimated) * 100), 100) : 0;
  const foodExtrasLeft = budgetRows.filter((row) => ["Comida", "Extras"].includes(row.category)).reduce((sum, row) => sum + row.estimated - row.spent, 0);
  const itineraryReview = useMemo(() => buildItineraryReview(itineraryDays), [itineraryDays]);

  const quickSuggestions = [
    { title: "Agrupa actividades cercanas", description: "Revisa que las visitas del mismo día estén en zonas compatibles para evitar traslados innecesarios.", type: "correcto" },
    { title: "Evita días demasiado cargados", description: "Combina visitas principales con descansos y deja margen entre desplazamientos.", type: "correcto" },
    { title: `${pendingImportant.length} tareas importantes pendientes`, description: "Revisa seguro, entradas, documentación y mapas offline antes de viajar.", type: "aviso" },
    { title: "Margen para comida y extras", description: `Aún tienes aproximadamente ${foodExtrasLeft} € previstos para comida y extras.`, type: "recomendacion" },
    { title: "Mapas offline", description: "Descargarlos antes de salir reduce fricción si no tienes datos o cobertura.", type: "info" },
    { title: "Entradas del Vaticano", description: "Requieren compra anticipada para evitar colas y horarios agotados.", type: "aviso" },
  ];

  const budgetItems = [
    { label: "Correcto", text: "El alojamiento ya está completamente pagado." },
    { label: "Aviso", text: "Las entradas pendientes pueden aumentar el gasto final." },
    { label: "Recomendación", text: "Reserva margen para comidas y transporte local." },
  ];

  const ruleItems = [
    { label: "Regla", text: "Se revisan tareas pendientes y se priorizan las marcadas como alta o media." },
    { label: "Regla", text: "Se comprueban actividades agrupadas por zona simulada: Vaticano, centro histórico, Trastevere y Coliseo." },
    { label: "Regla", text: "Se detectan gastos pendientes y categorías con margen disponible." },
    { label: "Regla", text: "Se revisan reservas confirmadas y avisos según estado." },
    { label: "Regla", text: "Se muestran avisos según prioridad, carga del día y datos incompletos." },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Revisión automática"
        title="Planificador inteligente"
        subtitle="Recibe sugerencias automáticas para organizar mejor tu viaje con datos de ejemplo y reglas sencillas."
        icon={Lightbulb}
      />

      <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-bold leading-6 text-primary-800">
        Las sugerencias se generan dentro de esta demo revisando itinerario, presupuesto y tareas pendientes.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Route} label="Días revisados" value={itineraryDays.length} hint={activeTrip?.name || "Viaje activo"} />
        <StatCard icon={CheckSquare} label="Tareas importantes" value={pendingImportant.length} hint="Pendientes por prioridad" accent="amber" />
        <StatCard icon={ReceiptText} label="Presupuesto gastado" value={`${spent} €`} hint={`de ${estimated} € estimados`} accent="violet" />
        <StatCard icon={BadgeCheck} label="Preparación" value={`${activeTrip?.progress || 0}%`} hint="Progreso del viaje" accent="emerald" />
      </div>

      <SectionCard title="Sugerencias rápidas">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickSuggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.title} {...suggestion} />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Revisión del itinerario">
          <div className="grid gap-4 lg:grid-cols-2">
            {itineraryReview.map((review) => (
              <ReviewCard key={review.title} {...review} />
            ))}
          </div>
        </SectionCard>

        <aside className="grid gap-6 self-start">
          <SectionCard title="Revisión de checklist">
            <div className="grid gap-3">
              {pendingImportant.length ? pendingImportant.slice(0, 6).map((task) => (
                <div key={task.title} className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${task.priority === "alta" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                      {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : ""}
                    </span>
                  </div>
                  <p className="font-black text-ink">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.category} · {task.due}</p>
                </div>
              )) : (
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800">
                  No hay tareas importantes pendientes. El viaje está muy bien encaminado.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Revisión de presupuesto">
            <div className="mb-5 grid gap-3">
              <p className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>Estimado</span><strong>{estimated} €</strong></p>
              <p className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>Gastado</span><strong>{spent} €</strong></p>
              <p className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>Pendiente</span><strong>{pending} €</strong></p>
              <p className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>Por persona</span><strong>450 €</strong></p>
            </div>
            <ProgressBar value={percent} label="Uso del presupuesto" />
            <div className="mt-5 grid gap-3">
              {budgetItems.map((item) => (
                <div key={item.text} className="rounded-2xl bg-primary-50 p-4 text-sm font-bold leading-6 text-primary-800">{item.text}</div>
              ))}
            </div>
          </SectionCard>
        </aside>
      </div>

      <SectionCard title="Cómo se generan las sugerencias">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {ruleItems.map((item) => (
            <div key={item.text} className="rounded-2xl border border-line bg-white p-4">
              <Info className="mb-3 text-primary-700" size={18} />
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
