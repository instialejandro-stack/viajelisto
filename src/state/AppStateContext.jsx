import React, { createContext, useContext, useEffect, useMemo } from "react";
import {
  budgetRows as initialBudgetRows,
  checklist as initialChecklist,
  documents as initialDocuments,
  ideas as legacyIdeas,
  itineraryDays as initialItineraryDays,
  lodgings as initialLodgings,
  places as initialPlaces,
  recentExpenses as initialExpenses,
  restaurants as initialRestaurants,
  transports as initialTransports,
  trips as initialTrips,
} from "../data/mockData.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { tripTemplates } from "../data/tripTemplates.js";
import { buildItineraryDaysFromRange, formatDateRange, parseTripDateRange } from "../utils/dateUtils.js";

const AppStateContext = createContext(null);
const EXAMPLE_TRIP_ID = String(initialTrips[0].id);

const emptyChecklist = {
  "Antes del viaje": [],
  "Durante el viaje": [],
  "Después del viaje": [],
};

const examplePackingItems = [
  { id: "pack-1", name: "DNI / Pasaporte", category: "Documentación", packed: true, priority: "alta" },
  { id: "pack-2", name: "Cargador del móvil", category: "Tecnología", packed: false, priority: "alta" },
  { id: "pack-3", name: "Calzado cómodo", category: "Ropa", packed: false, priority: "media" },
  { id: "pack-4", name: "Neceser", category: "Aseo", packed: false, priority: "media" },
];

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseBudget(value) {
  const number = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(number) ? number : 0;
}

function parsePeopleCount(value) {
  return Number.parseInt(String(value || "2").replace(/[^\d]/g, ""), 10) || 2;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeEmptyItineraryDays() {
  return Array.from({ length: 1 }, (_, index) => ({
    day: `Día ${index + 1}`,
    date: "Sin fecha",
    title: index === 0 ? "Primer día por planificar" : `Día ${index + 1} por planificar`,
    summary: "Aún no has añadido actividades para este día.",
    estimatedCost: "0 €",
    movement: "Por definir",
    recommendation: "Añade actividades para construir una agenda clara del viaje.",
    items: [],
  }));
}

function makeItineraryDaysForTrip(trip = {}, existingDays = []) {
  return buildItineraryDaysFromRange(trip.startDate, trip.endDate, existingDays);
}

function makeEmptyBudgetRows() {
  return ["Vuelos", "Alojamiento", "Transporte", "Comida", "Entradas", "Extras"].map((category) => ({
    category,
    estimated: 0,
    spent: 0,
  }));
}

function makeDefaultParticipants(trip = {}) {
  const count = Math.max(parsePeopleCount(trip.people), 1);
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    name: index === 0 ? "Alejandro" : `Persona ${index + 1}`,
  }));
}

function ensureParticipants(data, trip = {}) {
  return data.participants?.length ? data.participants : makeDefaultParticipants(trip);
}

function normalizeExpenseSharing(expense, participants) {
  const fallbackParticipant = participants[0]?.id || "p1";
  return {
    ...expense,
    receipt: normalizeReceipt(expense.receipt),
    paidBy: expense.paidBy || fallbackParticipant,
    splitWith: expense.splitWith?.length ? expense.splitWith : participants.map((participant) => participant.id),
  };
}

function normalizeReceipt(receipt) {
  if (!receipt) return null;
  if (typeof receipt === "string") return { fileName: receipt, fileType: "Archivo", fileSize: 0, fileCategory: "file", legacy: true };
  if (receipt.fileName) return receipt;
  const fileType = receipt.type || receipt.fileType || "Archivo";
  const fileName = receipt.name || receipt.fileName || "Archivo";
  return {
    fileName,
    fileType,
    fileSize: receipt.fileSize || 0,
    fileCategory: fileType.includes("pdf") ? "pdf" : fileType.startsWith("image/") ? "image" : "file",
    displaySize: receipt.size || receipt.displaySize || "",
    lastModified: receipt.lastModified,
  };
}

function normalizeTripData(data, trip = {}) {
  const participants = ensureParticipants(data, trip);
  return {
    ...data,
    participants,
    expenses: (data.expenses || []).map((expense) => normalizeExpenseSharing(expense, participants)),
    packingItems: data.packingItems || [],
    reservationChecks: data.reservationChecks || {},
    dayModeChecks: data.dayModeChecks || {},
    settledDebts: data.settledDebts || [],
    polls: data.polls || [],
    currency: data.currency || { base: "EUR", target: "USD", rate: 1.08, amount: 100 },
    preparationTasks: data.preparationTasks || [],
    activityDone: data.activityDone || {},
    personalNotes: data.personalNotes || [],
    history: data.history || [],
    contacts: data.contacts || [],
    emergencyInfo: data.emergencyInfo || [],
    diaryEntries: data.diaryEntries || [],
    memories: data.memories || [],
    reviews: data.reviews || [],
  };
}

function historyItem(action, detail) {
  return { id: makeId("history"), action, detail, date: new Date().toISOString() };
}

function templateData(templateId) {
  const template = tripTemplates.find((item) => item.id === templateId);
  if (!template) return {};
  return {
    checklist: {
      ...clone(emptyChecklist),
      "Antes del viaje": template.checklist.map((title) => ({ title, done: false, priority: "media", due: "Antes del viaje", category: "Plantilla" })),
    },
    packingItems: template.packing.map((name, index) => ({ id: `tpl-pack-${template.id}-${index}`, name, category: "Plantilla", priority: "media", packed: false })),
    documents: template.documents.map((name, index) => ({ id: `tpl-doc-${template.id}-${index}`, name, type: name.includes("Pasaporte") ? "Pasaporte" : "Reserva", status: "pendiente", related: "Plantilla", relatedToType: "trip", relatedToId: "", date: "", size: "" })),
    preparationTasks: template.preparation.map((title, index) => ({ id: `tpl-prep-${template.id}-${index}`, title, phase: "14d", completed: false, priority: "Media", relatedSection: "checklist", notes: "" })),
    history: [historyItem("Plantilla aplicada", template.name)],
  };
}

function makeTripData({ example = false, trip = {}, templateId = "" } = {}) {
  const fromTemplate = templateData(templateId);
  if (example) {
    return normalizeTripData({
      itineraryDays: makeItineraryDaysForTrip(trip, clone(initialItineraryDays)),
      transports: clone(initialTransports),
      lodgings: clone(initialLodgings),
      places: clone(initialPlaces),
      restaurants: clone(initialRestaurants),
      budgetRows: clone(initialBudgetRows),
      expenses: clone(initialExpenses),
      documents: clone(initialDocuments),
      checklist: clone(initialChecklist),
      packingItems: clone(examplePackingItems),
      reservationChecks: {},
      dayModeChecks: {},
      settledDebts: [],
      polls: [{ id: "poll-1", question: "¿Qué plan priorizamos para el Día 4?", options: [{ id: "o1", text: "Ostia Antica", votes: ["p1"] }, { id: "o2", text: "Ruta gastronómica", votes: [] }] }],
      currency: { base: "EUR", target: "USD", rate: 1.08, amount: 100 },
      preparationTasks: [],
      activityDone: {},
      personalNotes: [{ id: "note-1", title: "Consejo personal", content: "Reservar las entradas principales con margen.", category: "Consejo" }],
      history: [historyItem("Viaje de ejemplo cargado", "Roma 2026")],
      contacts: [{ id: "contact-1", name: "Hotel Roma Centro", type: "Alojamiento", phone: "+39 000 000 000", email: "info@hotelroma.com", address: "Via del Corso, Roma", relatedToType: "accommodation", relatedToId: "", emergency: false, notes: "Recepción 24h" }],
      emergencyInfo: [{ id: "emergency-1", title: "Seguro de viaje", type: "Seguro", value: "Póliza pendiente de subir", priority: "alta", notes: "Guardar teléfono de asistencia." }],
      diaryEntries: [],
      memories: [],
      reviews: [],
    }, trip);
  }

  return normalizeTripData({
    itineraryDays: makeItineraryDaysForTrip(trip),
    transports: [],
    lodgings: [],
    places: [],
    restaurants: [],
    budgetRows: makeEmptyBudgetRows(),
    expenses: [],
    documents: [],
    checklist: clone(emptyChecklist),
    packingItems: [],
    reservationChecks: {},
    dayModeChecks: {},
    settledDebts: [],
    polls: [],
    currency: { base: "EUR", target: "USD", rate: 1, amount: 100 },
    preparationTasks: [],
    activityDone: {},
    personalNotes: [],
    history: [historyItem("Viaje creado", trip.name || "Nuevo viaje")],
    contacts: [],
    emergencyInfo: [],
    diaryEntries: [],
    memories: [],
    reviews: [],
    ...fromTemplate,
  }, trip);
}

function initialTripData() {
  return initialTrips.reduce((data, trip) => {
    const normalizedTrip = normalizeTrip(trip);
    data[String(trip.id)] = makeTripData({ example: String(trip.id) === EXAMPLE_TRIP_ID, trip: normalizedTrip });
    return data;
  }, {});
}

function normalizeTripDates(trip) {
  const range = parseTripDateRange(trip.dates, {
    startDate: trip.startDate,
    endDate: trip.endDate,
  });
  const hasRange = Boolean(range.startDate && range.endDate);

  return {
    ...trip,
    startDate: range.startDate || "",
    endDate: range.endDate || "",
    dates: hasRange ? formatDateRange(range.startDate, range.endDate) : trip.dates || "Por definir",
  };
}

function normalizeTrip(trip) {
  const withDates = normalizeTripDates(trip);
  return {
    ...withDates,
    id: withDates.id ?? makeId("trip"),
    archived: Boolean(withDates.archived),
    people: withDates.people || "2 personas",
    pendingTasks: withDates.pendingTasks ?? 0,
    progress: withDates.progress ?? 10,
  };
}

function itineraryDaysNeedSync(currentDays = [], nextDays = []) {
  if (currentDays.length !== nextDays.length) return true;
  return nextDays.some((day, index) => day.day !== currentDays[index]?.day || day.date !== currentDays[index]?.date);
}

function ideaFromTrip(trip) {
  return {
    id: trip.id,
    destination: trip.destination || trip.name,
    dates: trip.dates || "Por definir",
    budget: trip.budget || "0 €",
    type: trip.type || "Por definir",
    pros: trip.pros || ["Guardado en el dashboard"],
    cons: trip.cons || ["Pendiente de completar"],
    score: trip.score || "0.0",
    trip,
  };
}

export function AppStateProvider({ children }) {
  const [trips, setTrips] = useLocalStorage("viajelisto.trips", initialTrips.map(normalizeTrip));
  const [tripData, setTripData] = useLocalStorage("viajelisto.tripData", initialTripData());
  const [activeTripId, setActiveTripIdState] = useLocalStorage("viajelisto.activeTripId", EXAMPLE_TRIP_ID);
  const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage("viajelisto.onboardingCompleted", false);

  const normalizedTrips = useMemo(() => trips.map(normalizeTrip), [trips]);
  const activeTrip = normalizedTrips.find((trip) => String(trip.id) === String(activeTripId)) || normalizedTrips.find(Boolean) || null;
  const safeActiveTripId = activeTrip ? String(activeTrip.id) : "";
  const activeTripData = tripData[safeActiveTripId] || makeTripData({ example: safeActiveTripId === EXAMPLE_TRIP_ID, trip: activeTrip });
  const ideas = normalizedTrips.filter((trip) => trip.status === "Idea").map(ideaFromTrip);

  useEffect(() => {
    if (String(activeTripId || "") !== safeActiveTripId) {
      setActiveTripIdState(safeActiveTripId);
    }
  }, [activeTripId, safeActiveTripId, setActiveTripIdState]);

  useEffect(() => {
    setTrips((current) => {
      const normalized = current.map(normalizeTrip);
      const changed = normalized.some((trip, index) =>
        trip.dates !== current[index]?.dates ||
        trip.startDate !== current[index]?.startDate ||
        trip.endDate !== current[index]?.endDate
      );
      return changed ? normalized : current;
    });
  }, [setTrips]);

  useEffect(() => {
    setTripData((current) => {
      let changed = false;
      const next = { ...current };

      normalizedTrips.forEach((trip) => {
        const key = String(trip.id);
        const rawData = next[key] || makeTripData({ example: key === EXAMPLE_TRIP_ID, trip });
        const data = normalizeTripData(rawData, trip);
        const syncedItineraryDays = makeItineraryDaysForTrip(trip, data.itineraryDays);
        const sharingChanged = JSON.stringify(rawData.participants) !== JSON.stringify(data.participants) || JSON.stringify(rawData.expenses) !== JSON.stringify(data.expenses);
        if (!next[key] || sharingChanged || itineraryDaysNeedSync(data.itineraryDays, syncedItineraryDays)) {
          next[key] = { ...data, itineraryDays: syncedItineraryDays };
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [normalizedTrips, setTripData]);

  function ensureTripData(id, { example = false } = {}) {
    const key = String(id);
    const trip = normalizedTrips.find((item) => String(item.id) === key);
    setTripData((current) => (current[key] ? current : { ...current, [key]: makeTripData({ example, trip }) }));
  }

  function setActiveTripId(id) {
    if (!id) return;
    setActiveTripIdState(String(id));
    ensureTripData(id, { example: String(id) === EXAMPLE_TRIP_ID });
  }

  function makeTripFromForm(form) {
    const range = parseTripDateRange(form.dates, {
      startDate: form.startDate,
      endDate: form.endDate,
    });
    const dates = range.startDate && range.endDate ? formatDateRange(range.startDate, range.endDate) : form.dates;

    return {
      id: form.id || makeId("trip"),
      name: form.name,
      destination: form.destination,
      dates,
      startDate: range.startDate || "",
      endDate: range.endDate || "",
      people: form.people ? `${String(form.people).replace(/[^\d]/g, "") || 1} personas` : "1 persona",
      status: form.status,
      budget: `${parseBudget(form.budget)} €`,
      progress: form.status === "Confirmado" ? 85 : form.status === "En planificación" ? 35 : 10,
      pendingTasks: form.status === "Confirmado" ? 3 : 8,
      type: form.type,
      pros: form.pros,
      cons: form.cons,
      score: form.score,
      cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    };
  }

  function addTrip(form) {
    const trip = makeTripFromForm(form);
    setTrips((current) => [trip, ...current]);
    setTripData((current) => ({ ...current, [String(trip.id)]: makeTripData({ trip, templateId: form.templateId }) }));
    setActiveTripIdState(String(trip.id));
    return trip;
  }

  function updateTrip(id, form) {
    const nextTripFromForm = makeTripFromForm({ ...form, id });
    setTrips((current) =>
      current.map((trip) =>
        String(trip.id) === String(id)
          ? {
              ...trip,
              name: nextTripFromForm.name,
              destination: nextTripFromForm.destination,
              dates: nextTripFromForm.dates,
              startDate: nextTripFromForm.startDate,
              endDate: nextTripFromForm.endDate,
              people: form.people ? `${String(form.people).replace(/[^\d]/g, "") || 1} personas` : trip.people,
              status: form.status,
              budget: `${parseBudget(form.budget)} €`,
              progress:
                form.status === "Confirmado"
                  ? Math.max(trip.progress || 0, 85)
                  : form.status === "En planificación"
                    ? Math.max(trip.progress || 0, 35)
                    : Math.min(trip.progress || 10, 20),
            }
          : trip
      )
    );
    setTripData((current) => {
      const key = String(id);
      const data = current[key] || makeTripData({ trip: nextTripFromForm });
      return {
        ...current,
        [key]: {
          ...data,
          itineraryDays: makeItineraryDaysForTrip(nextTripFromForm, data.itineraryDays),
        },
      };
    });
  }

  function deleteTrip(id) {
    const key = String(id);
    setTrips((current) => {
      const next = current.filter((trip) => String(trip.id) !== key);
      if (String(activeTripId) === key) setActiveTripIdState(next[0] ? String(next[0].id) : "");
      return next;
    });
    setTripData((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function duplicateTrip(id) {
    const key = String(id);
    const sourceTrip = normalizedTrips.find((trip) => String(trip.id) === key);
    if (!sourceTrip) return null;
    const nextId = makeId("trip");
    const trip = {
      ...sourceTrip,
      id: nextId,
      name: `${sourceTrip.name} (copia)`,
      archived: false,
    };
    const sourceData = tripData[key] || makeTripData({ example: key === EXAMPLE_TRIP_ID, trip: sourceTrip });
    const data = {
      ...clone(sourceData),
      history: [historyItem("Viaje duplicado", sourceTrip.name), ...(sourceData.history || [])],
    };
    setTrips((current) => [trip, ...current]);
    setTripData((current) => ({ ...current, [String(nextId)]: data }));
    setActiveTripIdState(String(nextId));
    return trip;
  }

  function archiveTrip(id) {
    const key = String(id);
    setTrips((current) =>
      current.map((trip) =>
        String(trip.id) === key
          ? trip.archived
            ? { ...trip, archived: false, status: trip.previousStatus || "En planificación", previousStatus: undefined }
            : { ...trip, archived: true, previousStatus: trip.status, status: "Archivado" }
          : trip
      )
    );
  }

  function addIdea(form) {
    return addTrip({
      name: `${form.destination}`,
      destination: form.destination,
      dates: form.dates,
      startDate: form.startDate,
      endDate: form.endDate,
      people: "2",
      budget: form.budget,
      status: "Idea",
      type: form.type,
      pros: form.pros.split(",").map((item) => item.trim()).filter(Boolean),
      cons: form.cons.split(",").map((item) => item.trim()).filter(Boolean),
      score: form.score,
    });
  }

  function updateIdea(id, form) {
    const range = parseTripDateRange(form.dates, {
      startDate: form.startDate,
      endDate: form.endDate,
    });
    const dates = range.startDate && range.endDate ? formatDateRange(range.startDate, range.endDate) : form.dates;

    setTrips((current) =>
      current.map((trip) =>
        String(trip.id) === String(id)
          ? {
              ...trip,
              name: trip.name || form.destination,
              destination: form.destination,
              dates,
              startDate: range.startDate || "",
              endDate: range.endDate || "",
              budget: `${parseBudget(form.budget)} €`,
              status: "Idea",
              type: form.type,
              pros: form.pros.split(",").map((item) => item.trim()).filter(Boolean),
              cons: form.cons.split(",").map((item) => item.trim()).filter(Boolean),
              score: form.score,
            }
          : trip
      )
    );
    setTripData((current) => {
      const key = String(id);
      const data = current[key] || makeTripData();
      return {
        ...current,
        [key]: {
          ...data,
          itineraryDays: buildItineraryDaysFromRange(range.startDate, range.endDate, data.itineraryDays),
        },
      };
    });
  }

  function deleteIdea(id) {
    deleteTrip(id);
  }

  function chooseIdea(idea) {
    const id = idea.id;
    setTrips((current) =>
      current.map((trip) =>
        String(trip.id) === String(id)
          ? { ...trip, status: "En planificación", progress: Math.max(trip.progress || 0, 35), name: trip.name || `${trip.destination}` }
          : trip
      )
    );
    setActiveTripId(id);
  }

  function updateActiveTripData(updater) {
    if (!safeActiveTripId) return;
    setTripData((current) => {
      const currentData = current[safeActiveTripId] || makeTripData({ example: safeActiveTripId === EXAMPLE_TRIP_ID, trip: activeTrip });
      const updated = updater(currentData);
      return { ...current, [safeActiveTripId]: updated };
    });
  }

  function addHistory(action, detail = "") {
    updateActiveTripData((data) => ({ ...data, history: [historyItem(action, detail), ...(data.history || [])] }));
  }

  function addActivity(form) {
    updateActiveTripData((data) => ({
      ...data,
      itineraryDays: data.itineraryDays.map((day) => {
        if (day.day !== form.day) return day;
        const nextItems = [
          ...day.items,
          { time: form.time, name: form.name, type: form.type, address: form.address, duration: form.duration, travelTime: form.travelTime, cost: form.cost, notes: form.notes },
        ].sort((a, b) => a.time.localeCompare(b.time));
        return { ...day, items: nextItems };
      }),
    }));
    addHistory("Actividad añadida", form.name);
  }

  function updateActivity(dayName, index, form) {
    updateActiveTripData((data) => {
      const withoutOld = data.itineraryDays.map((day) =>
        day.day === dayName ? { ...day, items: day.items.filter((_, itemIndex) => itemIndex !== index) } : day
      );
      return {
        ...data,
        itineraryDays: withoutOld.map((day) => {
          if (day.day !== form.day) return day;
          const nextItems = [
            ...day.items,
            { time: form.time, name: form.name, type: form.type, address: form.address, duration: form.duration, travelTime: form.travelTime, cost: form.cost, notes: form.notes },
          ].sort((a, b) => a.time.localeCompare(b.time));
          return { ...day, items: nextItems };
        }),
      };
    });
  }

  function deleteActivity(dayName, index) {
    updateActiveTripData((data) => ({
      ...data,
      itineraryDays: data.itineraryDays.map((day) =>
        day.day === dayName ? { ...day, items: day.items.filter((_, itemIndex) => itemIndex !== index) } : day
      ),
    }));
    addHistory("Actividad actualizada", form.name);
  }

  function toggleTask(group, index) {
    updateActiveTripData((data) => ({
      ...data,
      checklist: {
        ...data.checklist,
        [group]: data.checklist[group].map((task, taskIndex) => (taskIndex === index ? { ...task, done: !task.done } : task)),
      },
    }));
    addHistory("Actividad eliminada", dayName);
  }

  function addTask(group, form) {
    const task = { title: form.title, done: form.done === "completada", priority: form.priority, due: form.due, category: form.category };
    updateActiveTripData((data) => ({ ...data, checklist: { ...data.checklist, [group]: [task, ...data.checklist[group]] } }));
  }

  function updateTask(group, index, nextGroup, form) {
    const task = { title: form.title, done: form.done === "completada", priority: form.priority, due: form.due, category: form.category };
    updateActiveTripData((data) => {
      const withoutOld = { ...data.checklist, [group]: data.checklist[group].filter((_, taskIndex) => taskIndex !== index) };
      return { ...data, checklist: { ...withoutOld, [nextGroup]: [task, ...withoutOld[nextGroup]] } };
    });
  }

  function deleteTask(group, index) {
    updateActiveTripData((data) => ({
      ...data,
      checklist: { ...data.checklist, [group]: data.checklist[group].filter((_, taskIndex) => taskIndex !== index) },
    }));
  }

  function addExpense(form) {
    updateActiveTripData((data) => {
      const participants = ensureParticipants(data, activeTrip);
      const expense = normalizeExpenseSharing({
        id: makeId("expense"),
        name: form.name,
        category: form.category,
        amount: parseBudget(form.amount),
        status: form.status,
        receipt: form.receipt,
        paidBy: form.paidBy,
        splitWith: form.splitWith,
        userAdded: true,
      }, participants);
      return { ...data, participants, expenses: [expense, ...data.expenses] };
    });
  }

  function updateExpense(index, form) {
    updateActiveTripData((data) => {
      const participants = ensureParticipants(data, activeTrip);
      const expense = normalizeExpenseSharing({
        id: form.id || makeId("expense"),
        name: form.name,
        category: form.category,
        amount: parseBudget(form.amount),
        status: form.status,
        receipt: form.receipt,
        paidBy: form.paidBy,
        splitWith: form.splitWith,
        userAdded: true,
      }, participants);
      return { ...data, participants, expenses: data.expenses.map((item, itemIndex) => (itemIndex === index ? expense : item)) };
    });
  }

  function deleteExpense(index) {
    updateActiveTripData((data) => ({ ...data, expenses: data.expenses.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addParticipant(name) {
    updateActiveTripData((data) => {
      const participants = ensureParticipants(data, activeTrip);
      const participant = { id: makeId("participant"), name };
      return {
        ...data,
        participants: [...participants, participant],
        expenses: data.expenses.map((expense) => ({
          ...expense,
          splitWith: expense.splitWith?.length ? expense.splitWith : participants.map((item) => item.id),
        })),
      };
    });
  }

  function updateParticipant(participantId, name) {
    updateActiveTripData((data) => {
      const participants = ensureParticipants(data, activeTrip);
      return {
        ...data,
        participants: participants.map((participant) =>
          participant.id === participantId ? { ...participant, name } : participant
        ),
      };
    });
  }

  function deleteParticipant(participantId) {
    updateActiveTripData((data) => {
      const participants = ensureParticipants(data, activeTrip);
      if (participants.length <= 1) return data;
      const nextParticipants = participants.filter((participant) => participant.id !== participantId);
      return {
        ...data,
        participants: nextParticipants,
        expenses: data.expenses.map((expense) => ({
          ...expense,
          paidBy: expense.paidBy === participantId ? nextParticipants[0].id : expense.paidBy,
          splitWith: (expense.splitWith || []).filter((id) => id !== participantId).length
            ? (expense.splitWith || []).filter((id) => id !== participantId)
            : nextParticipants.map((participant) => participant.id),
        })),
      };
    });
  }

  function addPackingItem(form) {
    const item = {
      id: makeId("packing"),
      name: form.name,
      category: form.category || "General",
      priority: form.priority || "media",
      packed: false,
      notes: form.notes || "",
    };
    updateActiveTripData((data) => ({ ...data, packingItems: [item, ...(data.packingItems || [])] }));
  }

  function togglePackingItem(id) {
    updateActiveTripData((data) => ({
      ...data,
      packingItems: (data.packingItems || []).map((item) => (item.id === id ? { ...item, packed: !item.packed } : item)),
    }));
  }

  function deletePackingItem(id) {
    updateActiveTripData((data) => ({
      ...data,
      packingItems: (data.packingItems || []).filter((item) => item.id !== id),
    }));
  }

  function toggleReservationCheck(key) {
    updateActiveTripData((data) => ({
      ...data,
      reservationChecks: { ...(data.reservationChecks || {}), [key]: !data.reservationChecks?.[key] },
    }));
  }

  function toggleDayModeCheck(key) {
    updateActiveTripData((data) => ({
      ...data,
      dayModeChecks: { ...(data.dayModeChecks || {}), [key]: !data.dayModeChecks?.[key] },
    }));
  }

  function toggleActivityDone(key) {
    updateActiveTripData((data) => ({
      ...data,
      activityDone: { ...(data.activityDone || {}), [key]: !data.activityDone?.[key] },
      history: [historyItem(data.activityDone?.[key] ? "Actividad marcada pendiente" : "Actividad realizada", key), ...(data.history || [])],
    }));
  }

  function addPreparationTask(form) {
    const task = { id: makeId("prep"), title: form.title, phase: form.phase, completed: false, priority: form.priority, relatedSection: form.relatedSection, notes: form.notes || "" };
    updateActiveTripData((data) => ({ ...data, preparationTasks: [task, ...(data.preparationTasks || [])], history: [historyItem("Tarea de preparación añadida", form.title), ...(data.history || [])] }));
  }

  function updatePreparationTask(id, form) {
    updateActiveTripData((data) => {
      const tasks = data.preparationTasks || [];
      const exists = tasks.some((task) => task.id === id);
      const nextTask = { ...form, id, completed: !form.completed };
      return {
        ...data,
        preparationTasks: exists ? tasks.map((task) => task.id === id ? { ...task, ...form } : task) : [nextTask, ...tasks],
        history: [historyItem("Tarea de preparación actualizada", form.title), ...(data.history || [])],
      };
    });
  }

  function togglePreparationTask(id) {
    updateActiveTripData((data) => ({ ...data, preparationTasks: (data.preparationTasks || []).map((task) => task.id === id ? { ...task, completed: !task.completed } : task) }));
  }

  function deletePreparationTask(id) {
    updateActiveTripData((data) => ({ ...data, preparationTasks: (data.preparationTasks || []).filter((task) => task.id !== id), history: [historyItem("Tarea de preparación eliminada", id), ...(data.history || [])] }));
  }

  function addPersonalNote(form) {
    const note = { id: makeId("note"), title: form.title, content: form.content, category: form.category || "Nota", pinned: false };
    updateActiveTripData((data) => ({ ...data, personalNotes: [note, ...(data.personalNotes || [])], history: [historyItem("Nota añadida", form.title), ...(data.history || [])] }));
  }

  function updatePersonalNote(id, form) {
    updateActiveTripData((data) => ({ ...data, personalNotes: (data.personalNotes || []).map((note) => note.id === id ? { ...note, ...form } : note), history: [historyItem("Nota actualizada", form.title), ...(data.history || [])] }));
  }

  function deletePersonalNote(id) {
    updateActiveTripData((data) => ({ ...data, personalNotes: (data.personalNotes || []).filter((note) => note.id !== id), history: [historyItem("Nota eliminada", id), ...(data.history || [])] }));
  }

  function addContact(form) {
    const contact = { id: makeId("contact"), ...form, emergency: form.emergency === true || form.emergency === "sí" };
    updateActiveTripData((data) => ({ ...data, contacts: [contact, ...(data.contacts || [])], history: [historyItem("Contacto añadido", form.name), ...(data.history || [])] }));
  }

  function updateContact(id, form) {
    updateActiveTripData((data) => ({ ...data, contacts: (data.contacts || []).map((item) => item.id === id ? { ...item, ...form, emergency: form.emergency === true || form.emergency === "sí" } : item), history: [historyItem("Contacto actualizado", form.name), ...(data.history || [])] }));
  }

  function deleteContact(id) {
    updateActiveTripData((data) => ({ ...data, contacts: (data.contacts || []).filter((item) => item.id !== id), history: [historyItem("Contacto eliminado", id), ...(data.history || [])] }));
  }

  function addEmergencyInfo(form) {
    const item = { id: makeId("emergency"), ...form };
    updateActiveTripData((data) => ({ ...data, emergencyInfo: [item, ...(data.emergencyInfo || [])], history: [historyItem("Dato de emergencia añadido", form.title), ...(data.history || [])] }));
  }

  function deleteEmergencyInfo(id) {
    updateActiveTripData((data) => ({ ...data, emergencyInfo: (data.emergencyInfo || []).filter((item) => item.id !== id) }));
  }

  function addDiaryEntry(form) {
    const entry = { id: makeId("diary"), ...form, date: form.date || new Date().toISOString().slice(0, 10) };
    updateActiveTripData((data) => ({ ...data, diaryEntries: [entry, ...(data.diaryEntries || [])], history: [historyItem("Entrada de diario añadida", form.title), ...(data.history || [])] }));
  }

  function deleteDiaryEntry(id) {
    updateActiveTripData((data) => ({ ...data, diaryEntries: (data.diaryEntries || []).filter((entry) => entry.id !== id) }));
  }

  function addMemory(form) {
    const memory = { id: makeId("memory"), ...form };
    updateActiveTripData((data) => ({ ...data, memories: [memory, ...(data.memories || [])], history: [historyItem("Recuerdo añadido", form.title), ...(data.history || [])] }));
  }

  function deleteMemory(id) {
    updateActiveTripData((data) => ({ ...data, memories: (data.memories || []).filter((memory) => memory.id !== id) }));
  }

  function addReview(form) {
    const review = { id: makeId("review"), ...form, rating: Number(form.rating || 0) };
    updateActiveTripData((data) => ({ ...data, reviews: [review, ...(data.reviews || [])], history: [historyItem("Valoración añadida", form.title), ...(data.history || [])] }));
  }

  function deleteReview(id) {
    updateActiveTripData((data) => ({ ...data, reviews: (data.reviews || []).filter((review) => review.id !== id) }));
  }

  function applyTemplate(templateId) {
    const additions = templateData(templateId);
    updateActiveTripData((data) => ({
      ...data,
      checklist: {
        ...data.checklist,
        "Antes del viaje": [...(additions.checklist?.["Antes del viaje"] || []), ...(data.checklist?.["Antes del viaje"] || [])],
      },
      packingItems: [...(additions.packingItems || []), ...(data.packingItems || [])],
      documents: [...(additions.documents || []), ...(data.documents || [])],
      preparationTasks: [...(additions.preparationTasks || []), ...(data.preparationTasks || [])],
      history: [historyItem("Plantilla aplicada", tripTemplates.find((item) => item.id === templateId)?.name || templateId), ...(data.history || [])],
    }));
  }

  function toggleDebtPaid(debt) {
    const key = `${debt.from}->${debt.to}:${Math.round(Number(debt.amount || 0) * 100)}`;
    updateActiveTripData((data) => {
      const settledDebts = data.settledDebts || [];
      return {
        ...data,
        settledDebts: settledDebts.includes(key) ? settledDebts.filter((item) => item !== key) : [...settledDebts, key],
      };
    });
  }

  function addPoll(form) {
    const options = form.options.split("\n").map((item) => item.trim()).filter(Boolean).map((text) => ({ id: makeId("option"), text, votes: [] }));
    updateActiveTripData((data) => ({ ...data, polls: [{ id: makeId("poll"), question: form.question, options }, ...(data.polls || [])] }));
  }

  function votePoll(pollId, optionId, participantId) {
    updateActiveTripData((data) => ({
      ...data,
      polls: (data.polls || []).map((poll) => poll.id === pollId ? {
        ...poll,
        options: poll.options.map((option) => {
          const votes = option.votes || [];
          if (option.id !== optionId) return { ...option, votes: votes.filter((id) => id !== participantId) };
          return {
            ...option,
            votes: votes.includes(participantId)
              ? votes.filter((id) => id !== participantId)
              : Array.from(new Set([...votes, participantId])),
          };
        }),
      } : poll),
    }));
  }

  function deletePoll(pollId) {
    updateActiveTripData((data) => ({ ...data, polls: (data.polls || []).filter((poll) => poll.id !== pollId) }));
  }

  function updateCurrency(form) {
    updateActiveTripData((data) => ({
      ...data,
      currency: { base: form.base || "EUR", target: form.target || "USD", rate: Number(form.rate || 1), amount: Number(form.amount || 0) },
    }));
  }

  function addPlace(form) {
    const place = {
      name: form.name,
      category: form.category,
      priority: form.priority,
      price: form.price,
      duration: form.duration,
      booking: form.needsBooking === "sí" ? "Necesita reserva" : "Sin reserva",
      day: form.day,
      needsBooking: form.needsBooking === "sí",
      zone: form.zone,
      mustSee: form.mustSee === "sí",
      note: form.note,
    };
    updateActiveTripData((data) => ({ ...data, places: [place, ...data.places] }));
  }

  function updatePlace(index, form) {
    const place = {
      name: form.name,
      category: form.category,
      priority: form.priority,
      price: form.price,
      duration: form.duration,
      booking: form.needsBooking === "sí" ? "Necesita reserva" : "Sin reserva",
      day: form.day,
      needsBooking: form.needsBooking === "sí",
      zone: form.zone,
      mustSee: form.mustSee === "sí",
      note: form.note,
    };
    updateActiveTripData((data) => ({ ...data, places: data.places.map((item, itemIndex) => (itemIndex === index ? place : item)) }));
  }

  function deletePlace(index) {
    updateActiveTripData((data) => ({ ...data, places: data.places.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addDocument(form) {
    const document = {
      id: form.id || makeId("document"),
      name: form.name,
      type: form.type,
      status: form.status,
      related: form.related,
      relatedToType: form.relatedToType || "trip",
      relatedToId: form.relatedToId || "",
      date: form.date,
      size: form.status === "subido" ? form.size || "Archivo local" : "",
      file: form.file || null,
      notes: form.notes || "",
    };
    updateActiveTripData((data) => ({ ...data, documents: [document, ...data.documents] }));
  }

  function updateDocument(index, form) {
    const document = {
      id: form.id || makeId("document"),
      name: form.name,
      type: form.type,
      status: form.status,
      related: form.related,
      relatedToType: form.relatedToType || "trip",
      relatedToId: form.relatedToId || "",
      date: form.date,
      size: form.status === "subido" ? form.size || "Archivo local" : "",
      file: form.file || null,
      notes: form.notes || "",
    };
    updateActiveTripData((data) => ({ ...data, documents: data.documents.map((item, itemIndex) => (itemIndex === index ? document : item)) }));
  }

  function deleteDocument(index) {
    updateActiveTripData((data) => ({ ...data, documents: data.documents.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addTransport(form) {
    const transport = {
      type: form.type,
      route: `${form.origin} -> ${form.destination}`,
      origin: form.origin,
      destination: form.destination,
      date: form.date,
      time: form.departure,
      departure: form.departure,
      arrival: form.arrival,
      company: form.company,
      price: `${parseBudget(form.price)} €`,
      status: form.status,
      locator: form.locator || "pendiente",
      notes: form.notes,
    };
    updateActiveTripData((data) => ({ ...data, transports: [transport, ...data.transports] }));
  }

  function updateTransport(index, form) {
    const transport = {
      type: form.type,
      route: `${form.origin} -> ${form.destination}`,
      origin: form.origin,
      destination: form.destination,
      date: form.date,
      time: form.departure,
      departure: form.departure,
      arrival: form.arrival,
      company: form.company,
      price: `${parseBudget(form.price)} €`,
      status: form.status,
      locator: form.locator || "pendiente",
      notes: form.notes,
    };
    updateActiveTripData((data) => ({ ...data, transports: data.transports.map((item, itemIndex) => (itemIndex === index ? transport : item)) }));
  }

  function deleteTransport(index) {
    updateActiveTripData((data) => ({ ...data, transports: data.transports.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addAccommodation(form) {
    const lodging = {
      name: form.name,
      type: form.type,
      address: form.address,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      nights: form.nights,
      price: `${parseBudget(form.price)} €`,
      status: form.status,
      services: form.services.split(",").map((item) => item.trim()).filter(Boolean),
      days: form.days,
      notes: form.notes,
    };
    updateActiveTripData((data) => ({ ...data, lodgings: [lodging, ...data.lodgings] }));
  }

  function updateAccommodation(index, form) {
    const lodging = {
      name: form.name,
      type: form.type,
      address: form.address,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      nights: form.nights,
      price: `${parseBudget(form.price)} €`,
      status: form.status,
      services: form.services.split(",").map((item) => item.trim()).filter(Boolean),
      days: form.days,
      bookingUrl: form.bookingUrl,
      notes: form.notes,
    };
    updateActiveTripData((data) => ({ ...data, lodgings: data.lodgings.map((item, itemIndex) => (itemIndex === index ? lodging : item)) }));
  }

  function deleteAccommodation(index) {
    updateActiveTripData((data) => ({ ...data, lodgings: data.lodgings.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addRestaurant(form) {
    const restaurant = {
      name: form.name,
      food: form.food,
      area: form.area,
      near: form.near,
      price: form.price,
      rating: form.rating,
      booking: form.needsBooking === "sí" ? "Recomendable" : "No",
      needsBooking: form.needsBooking === "sí",
      day: form.day,
      mapsUrl: form.mapsUrl,
      status: form.status,
      note: form.note,
    };
    updateActiveTripData((data) => ({ ...data, restaurants: [restaurant, ...data.restaurants] }));
  }

  function updateRestaurant(index, form) {
    const restaurant = {
      name: form.name,
      food: form.food,
      area: form.area,
      near: form.near,
      price: form.price,
      rating: form.rating,
      booking: form.needsBooking === "sí" ? "Recomendable" : "No",
      needsBooking: form.needsBooking === "sí",
      day: form.day,
      mapsUrl: form.mapsUrl,
      status: form.status,
      note: form.note,
    };
    updateActiveTripData((data) => ({ ...data, restaurants: data.restaurants.map((item, itemIndex) => (itemIndex === index ? restaurant : item)) }));
  }

  function deleteRestaurant(index) {
    updateActiveTripData((data) => ({ ...data, restaurants: data.restaurants.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function completeOnboarding() {
    setOnboardingCompleted(true);
  }

  function loadExampleTrip() {
    setTrips((current) => {
      const normalized = current.map(normalizeTrip);
      const hasExample = normalized.some((trip) => String(trip.id) === EXAMPLE_TRIP_ID);
      return hasExample ? normalized : [normalizeTrip(initialTrips[0]), ...normalized];
    });
    const exampleTrip = normalizeTrip(initialTrips[0]);
    setTripData((current) => ({ ...current, [EXAMPLE_TRIP_ID]: current[EXAMPLE_TRIP_ID] || makeTripData({ example: true, trip: exampleTrip }) }));
    setActiveTripIdState(EXAMPLE_TRIP_ID);
    setOnboardingCompleted(true);
    return EXAMPLE_TRIP_ID;
  }

  function resetDemo() {
    setTrips(initialTrips.map(normalizeTrip));
    setTripData(initialTripData());
    setActiveTripIdState(EXAMPLE_TRIP_ID);
    setOnboardingCompleted(false);
  }

  return (
    <AppStateContext.Provider
      value={{
        trips: normalizedTrips,
        ideas,
        tripData,
        activeTripId: safeActiveTripId,
        activeTrip,
        activeTripData,
        itineraryDays: activeTripData.itineraryDays,
        transports: activeTripData.transports,
        lodgings: activeTripData.lodgings,
        places: activeTripData.places,
        restaurants: activeTripData.restaurants,
        budgetRows: activeTripData.budgetRows,
        expenses: activeTripData.expenses,
        participants: activeTripData.participants,
        documents: activeTripData.documents,
        checklist: activeTripData.checklist,
        packingItems: activeTripData.packingItems,
        reservationChecks: activeTripData.reservationChecks,
        dayModeChecks: activeTripData.dayModeChecks,
        settledDebts: activeTripData.settledDebts,
        polls: activeTripData.polls,
        currency: activeTripData.currency,
        preparationTasks: activeTripData.preparationTasks,
        activityDone: activeTripData.activityDone,
        personalNotes: activeTripData.personalNotes,
        history: activeTripData.history,
        contacts: activeTripData.contacts,
        emergencyInfo: activeTripData.emergencyInfo,
        diaryEntries: activeTripData.diaryEntries,
        memories: activeTripData.memories,
        reviews: activeTripData.reviews,
        tripTemplates,
        onboardingCompleted,
        setActiveTripId,
        addTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        archiveTrip,
        addIdea,
        updateIdea,
        deleteIdea,
        chooseIdea,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        addExpense,
        updateExpense,
        deleteExpense,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addPackingItem,
        togglePackingItem,
        deletePackingItem,
        toggleReservationCheck,
        toggleDayModeCheck,
        toggleActivityDone,
        addPreparationTask,
        updatePreparationTask,
        togglePreparationTask,
        deletePreparationTask,
        addPersonalNote,
        updatePersonalNote,
        deletePersonalNote,
        addContact,
        updateContact,
        deleteContact,
        addEmergencyInfo,
        deleteEmergencyInfo,
        addDiaryEntry,
        deleteDiaryEntry,
        addMemory,
        deleteMemory,
        addReview,
        deleteReview,
        applyTemplate,
        toggleDebtPaid,
        addPoll,
        votePoll,
        deletePoll,
        updateCurrency,
        addPlace,
        updatePlace,
        deletePlace,
        addDocument,
        updateDocument,
        deleteDocument,
        addTransport,
        updateTransport,
        deleteTransport,
        addAccommodation,
        updateAccommodation,
        deleteAccommodation,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        completeOnboarding,
        loadExampleTrip,
        resetDemo,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
