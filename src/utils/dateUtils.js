const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MONTH_ALIASES = {
  ene: 0,
  enero: 0,
  jan: 0,
  january: 0,
  feb: 1,
  febrero: 1,
  february: 1,
  mar: 2,
  marzo: 2,
  march: 2,
  abr: 3,
  abril: 3,
  apr: 3,
  april: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  june: 5,
  jul: 6,
  julio: 6,
  july: 6,
  ago: 7,
  agosto: 7,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  september: 8,
  oct: 9,
  octubre: 9,
  october: 9,
  nov: 10,
  noviembre: 10,
  november: 10,
  dic: 11,
  diciembre: 11,
  dec: 11,
  december: 11,
};

const DEFAULT_YEAR = 2026;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(value) {
  const date = parseISODate(value);
  if (!date) return "Sin fecha";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "";
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
}

function parseSlashDate(value) {
  const match = normalizeText(value).match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;
  const year = match[3] ? Number(match[3].length === 2 ? `20${match[3]}` : match[3]) : DEFAULT_YEAR;
  return toISODate(new Date(year, Number(match[2]) - 1, Number(match[1])));
}

function parseTextDate(value, context = {}) {
  const normalized = normalizeText(value).replace(/[.,]/g, " ");
  const slash = parseSlashDate(normalized);
  if (slash) return slash;

  const iso = normalized.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const parts = normalized.split(/\s+/).filter(Boolean);
  const day = Number(parts.find((part) => /^\d{1,2}$/.test(part)));
  const monthToken = parts.find((part) => MONTH_ALIASES[part] !== undefined);
  const yearToken = parts.find((part) => /^\d{4}$/.test(part));
  const month = monthToken ? MONTH_ALIASES[monthToken] : context.month;
  const year = yearToken ? Number(yearToken) : context.year || DEFAULT_YEAR;

  if (!day || month === undefined) return null;
  return toISODate(new Date(year, month, day));
}

export function parseTripDateRange(value, fallback = {}) {
  const directStart = fallback.startDate || "";
  const directEnd = fallback.endDate || "";
  if (parseISODate(directStart) && parseISODate(directEnd)) {
    return { startDate: directStart, endDate: directEnd };
  }

  const text = String(value || "").trim();
  if (!text) return { startDate: directStart, endDate: directEnd };

  const isoMatches = text.match(/\d{4}-\d{2}-\d{2}/g);
  if (isoMatches?.length >= 2) return { startDate: isoMatches[0], endDate: isoMatches[1] };

  const parts = text.split(/\s+(?:-|to|a|al|hasta)\s+|\s*[-–—]\s*/i).filter(Boolean);
  if (parts.length < 2) return { startDate: directStart, endDate: directEnd };

  const startDate = parseTextDate(parts[0]);
  const start = parseISODate(startDate);
  const endDate = parseTextDate(parts[1], start ? { month: start.getMonth(), year: start.getFullYear() } : {});

  return {
    startDate: startDate || directStart,
    endDate: endDate || directEnd,
  };
}

export function getDateRangeDays(startDate, endDate) {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  if (!start || !end || end < start) return [];

  const days = [];
  for (let cursor = new Date(start); cursor <= end; cursor = new Date(cursor.getTime() + DAY_MS)) {
    days.push(toISODate(cursor));
  }
  return days;
}

export function makeEmptyItineraryDay(index, isoDate = "") {
  return {
    day: `Día ${index + 1}`,
    date: isoDate ? formatDisplayDate(isoDate) : "Sin fecha",
    title: index === 0 ? "Primer día por planificar" : `Día ${index + 1} por planificar`,
    summary: "Aún no has añadido actividades para este día.",
    estimatedCost: "0 €",
    movement: "Por definir",
    recommendation: "Añade actividades para construir una agenda clara del viaje.",
    items: [],
  };
}

export function buildItineraryDaysFromRange(startDate, endDate, existingDays = []) {
  const rangeDays = getDateRangeDays(startDate, endDate);
  if (!rangeDays.length) {
    return existingDays.length ? existingDays : [makeEmptyItineraryDay(0)];
  }

  const rangeLabels = rangeDays.map(formatDisplayDate);
  const usedDays = new Set();
  const existingByDate = new Map(existingDays.filter((day) => day.date && day.date !== "Sin fecha").map((day) => [normalizeText(day.date), day]));

  return rangeDays.map((isoDate, index) => {
    const dateLabel = formatDisplayDate(isoDate);
    const dateMatch = existingByDate.get(normalizeText(dateLabel));
    const indexMatch = existingDays[index];
    const indexMatchBelongsElsewhere = indexMatch?.date && rangeLabels.includes(indexMatch.date) && indexMatch.date !== dateLabel;
    const previous = dateMatch && !usedDays.has(dateMatch)
      ? dateMatch
      : indexMatch && !usedDays.has(indexMatch) && !indexMatchBelongsElsewhere
        ? indexMatch
        : {};
    if (previous && Object.keys(previous).length) usedDays.add(previous);

    return {
      ...makeEmptyItineraryDay(index, isoDate),
      ...previous,
      day: `Día ${index + 1}`,
      date: dateLabel,
      items: previous.items || [],
    };
  });
}
