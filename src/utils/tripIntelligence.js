import { getDateRangeDays } from "./dateUtils.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayDate(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseNumber(value) {
  return Number.parseInt(String(value || "").replace(/[^\d]/g, ""), 10) || 0;
}

function timeToMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function durationToMinutes(value) {
  const text = String(value || "").toLowerCase();
  const hours = Number(text.match(/(\d+(?:[.,]\d+)?)\s*h/)?.[1]?.replace(",", ".") || 0);
  const minutes = Number(text.match(/(\d+)\s*m/)?.[1] || 0);
  const plain = Number(text.match(/^\s*(\d+)\s*$/)?.[1] || 0);
  return Math.round(hours * 60 + minutes + plain);
}

export function getTripCountdown(trip = {}, now = new Date()) {
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  const today = todayDate(now);

  if (!start || !end) {
    return {
      phase: "Sin fechas",
      status: trip.status || "Idea",
      label: "Fechas por definir",
      daysUntil: null,
      tone: "slate",
    };
  }

  if (today < start) {
    const daysUntil = Math.ceil((start - today) / DAY_MS);
    return {
      phase: daysUntil <= 7 ? "Última semana" : daysUntil <= 30 ? "Preparación" : "Planificación",
      status: trip.status === "Idea" ? "Idea" : "En planificación",
      label: daysUntil === 1 ? "Empieza mañana" : `Faltan ${daysUntil} días`,
      daysUntil,
      tone: daysUntil <= 7 ? "amber" : "primary",
    };
  }

  if (today >= start && today <= end) {
    const totalDays = getDateRangeDays(trip.startDate, trip.endDate).length || 1;
    const dayNumber = Math.floor((today - start) / DAY_MS) + 1;
    return {
      phase: "En viaje",
      status: "En curso",
      label: `Día ${dayNumber} de ${totalDays}`,
      daysUntil: 0,
      tone: "emerald",
    };
  }

  const daysSince = Math.floor((today - end) / DAY_MS);
  return {
    phase: "Finalizado",
    status: "Finalizado",
    label: daysSince === 0 ? "Termina hoy" : `Terminó hace ${daysSince} días`,
    daysUntil: -daysSince,
    tone: "violet",
  };
}

export function getTripNights(trip = {}) {
  const days = getDateRangeDays(trip.startDate, trip.endDate).length;
  return Math.max(days - 1, 0);
}

export function getItineraryIssues(itineraryDays = []) {
  const issues = [];

  itineraryDays.forEach((day) => {
    const items = [...(day.items || [])].sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
    if (!items.length) {
      issues.push({ type: "empty-day", severity: "media", title: `${day.day} sin actividades`, detail: "Aún no has planificado este día." });
      return;
    }

    if (items.length >= 7) {
      issues.push({ type: "heavy-day", severity: "media", title: `${day.day} muy cargado`, detail: `${items.length} actividades previstas. Reserva margen para descansar.` });
    }

    items.forEach((item, index) => {
      const start = timeToMinutes(item.time);
      const duration = durationToMinutes(item.duration);
      const next = items[index + 1];
      const nextStart = timeToMinutes(next?.time);

      if (!item.duration) {
        issues.push({ type: "missing-duration", severity: "baja", title: `${item.name} sin duración`, detail: `Añade duración para calcular mejor el ${day.day}.` });
      }
      if (!item.cost) {
        issues.push({ type: "missing-cost", severity: "baja", title: `${item.name} sin coste`, detail: "Añade coste estimado o marca Gratis." });
      }
      if (start !== null && duration > 0 && nextStart !== null && start + duration > nextStart) {
        issues.push({
          type: "overlap",
          severity: "alta",
          title: `Solape en ${day.day}`,
          detail: `${item.name} puede solaparse con ${next.name}.`,
        });
      }
    });
  });

  return issues;
}

export function getAccommodationIssues(trip = {}, lodgings = []) {
  const nights = getTripNights(trip);
  const bookedNights = lodgings.reduce((sum, lodging) => sum + parseNumber(lodging.nights), 0);
  if (!nights) return [];
  if (!lodgings.length) {
    return [{ type: "no-lodging", severity: "alta", title: "Sin alojamiento", detail: `El viaje tiene ${nights} noches y no hay alojamiento guardado.` }];
  }
  if (bookedNights && bookedNights < nights) {
    return [{ type: "missing-nights", severity: "alta", title: "Noches sin cubrir", detail: `Hay ${nights - bookedNights} noches sin alojamiento asignado.` }];
  }
  return [];
}

export function getTripValidationInsights(trip = {}, data = {}) {
  const checks = [];
  const itineraryDays = data.itineraryDays || [];
  const allTasks = Object.values(data.checklist || {}).flat();
  const pendingImportantTasks = allTasks.filter((task) => !task.done && ["alta", "Alta"].includes(task.priority));
  const pendingDocs = (data.documents || []).filter((document) => ["pendiente", "Pendiente"].includes(document.status));
  const pendingPacking = (data.packingItems || []).filter((item) => !item.packed);
  const expensesWithoutReceipt = (data.expenses || []).filter((expense) => Number(expense.amount || 0) > 0 && !expense.receipt);

  if (!trip.startDate || !trip.endDate) checks.push({ severity: "alta", title: "Fechas incompletas", detail: "Define fecha de inicio y fin para activar la cuenta atrás." });
  if (!parseNumber(trip.budget)) checks.push({ severity: "media", title: "Presupuesto sin definir", detail: "Añade un presupuesto para controlar gastos." });
  if (!(data.transports || []).length) checks.push({ severity: "media", title: "Sin transporte", detail: "Guarda vuelos, trenes o traslados principales." });
  checks.push(...getAccommodationIssues(trip, data.lodgings || []));
  if (pendingImportantTasks.length) checks.push({ severity: "alta", title: "Tareas críticas pendientes", detail: `${pendingImportantTasks.length} tareas de alta prioridad siguen abiertas.` });
  if (pendingDocs.length) checks.push({ severity: "alta", title: "Documentos pendientes", detail: `${pendingDocs.length} documentos necesitan revisión.` });
  if (pendingPacking.length) checks.push({ severity: "media", title: "Maleta pendiente", detail: `${pendingPacking.length} elementos siguen sin marcar.` });
  if (expensesWithoutReceipt.length) checks.push({ severity: "baja", title: "Gastos sin justificante", detail: `${expensesWithoutReceipt.length} gastos no tienen archivo adjunto.` });

  const emptyDays = itineraryDays.filter((day) => !(day.items || []).length);
  if (emptyDays.length) checks.push({ severity: "media", title: "Días sin plan", detail: `${emptyDays.length} días no tienen actividades.` });
  checks.push(...getItineraryIssues(itineraryDays).filter((issue) => issue.type === "overlap" || issue.type === "heavy-day"));

  if (!checks.length) checks.push({ severity: "correcto", title: "Todo parece estar en orden", detail: "No hay avisos importantes para este viaje." });
  return checks;
}

export function getFinalReadiness(trip = {}, data = {}) {
  const checks = getTripValidationInsights(trip, data);
  const blockers = checks.filter((check) => check.severity === "alta").length;
  const warnings = checks.filter((check) => check.severity === "media").length;
  const score = Math.max(0, 100 - blockers * 18 - warnings * 8);
  return {
    score,
    label: score >= 85 ? "Listo para salir" : score >= 60 ? "Casi listo" : "Necesita revisión",
    blockers,
    warnings,
    checks,
  };
}
