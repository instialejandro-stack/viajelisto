import React, { useMemo, useState } from "react";
import { AlertTriangle, Backpack, BedDouble, CheckSquare, FileUp, MapPinned, NotebookPen, Phone, Plane, Plus, ReceiptText, Route, ShieldCheck, Soup } from "lucide-react";
import Modal from "./Modal.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "./FormControls.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import TransportFormModal from "./TransportFormModal.jsx";
import AccommodationFormModal from "./AccommodationFormModal.jsx";
import RestaurantFormModal from "./RestaurantFormModal.jsx";

const actions = [
  ["place", "Lugar", MapPinned],
  ["activity", "Actividad", Route],
  ["transport", "Transporte", Plane],
  ["accommodation", "Alojamiento", BedDouble],
  ["restaurant", "Restaurante", Soup],
  ["expense", "Gasto", ReceiptText],
  ["document", "Documento", FileUp],
  ["requirement", "Requisito", ShieldCheck],
  ["task", "Tarea", CheckSquare],
  ["packing", "Maleta", Backpack],
  ["note", "Nota", NotebookPen],
  ["contact", "Contacto", Phone],
  ["emergency", "Emergencia", AlertTriangle],
];

const initialForms = {
  place: { name: "", category: "Monumento", priority: "Alta", price: "Gratis", duration: "", needsBooking: "no", mustSee: "no", day: "Sin asignar", zone: "", note: "" },
  activity: { day: "Día 1", time: "", name: "", type: "Visita", address: "", duration: "", travelTime: "", cost: "", notes: "" },
  transport: { type: "Vuelo", origin: "", destination: "", date: "", departure: "", arrival: "", company: "", price: "", status: "pendiente", locator: "", notes: "" },
  accommodation: { name: "", type: "Hotel", address: "", checkIn: "", checkOut: "", nights: "", price: "", status: "pendiente", services: "", days: "", notes: "" },
  restaurant: { name: "", food: "", area: "", near: "", price: "€€", rating: "", needsBooking: "no", day: "Sin asignar", note: "" },
  expense: { name: "", category: "Extras", amount: "", status: "pagado", receipt: "" },
  document: { name: "", type: "Reserva", status: "subido", related: "", date: "", size: "" },
  requirement: { title: "", priority: "alta", due: "", category: "Documentación", document: "", notes: "", done: "pendiente" },
  task: { title: "", group: "Antes del viaje", priority: "media", due: "", category: "", done: "pendiente" },
  packing: { name: "", category: "Ropa", priority: "media", notes: "" },
  note: { title: "", category: "Nota", content: "" },
  contact: { name: "", type: "Alojamiento", phone: "", email: "", address: "", emergency: "no", notes: "" },
  emergency: { title: "", type: "Salud", value: "", priority: "alta", notes: "" },
};

const titles = {
  place: "Añadir lugar",
  activity: "Añadir actividad",
  transport: "Añadir transporte",
  accommodation: "Añadir alojamiento",
  restaurant: "Añadir restaurante",
  expense: "Añadir gasto",
  document: "Añadir documento",
  requirement: "Añadir requisito",
  task: "Añadir tarea",
  packing: "Añadir a maleta",
  note: "Añadir nota",
  contact: "Añadir contacto",
  emergency: "Añadir dato de emergencia",
};

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToReceipt(file) {
  if (!file) return null;
  const fileType = file.type || "Archivo";
  return {
    fileName: file.name,
    fileType,
    fileSize: file.size,
    fileCategory: fileType.includes("pdf") ? "pdf" : fileType.startsWith("image/") ? "image" : "file",
    displaySize: formatFileSize(file.size),
    lastModified: file.lastModified,
  };
}

function fileToDocumentMeta(file) {
  if (!file) return null;
  return {
    fileName: file.name,
    fileType: file.type || "Archivo",
    fileSize: file.size,
    fileCategory: file.type?.startsWith("image/") ? "image" : "pdf",
  };
}

function fileLabel(file) {
  if (!file) return "";
  const size = file.fileSize ? formatFileSize(file.fileSize) : "";
  return size ? `${file.fileName} · ${size}` : file.fileName;
}

function receiptName(receipt) {
  if (!receipt) return "";
  if (typeof receipt === "string") return receipt;
  const name = receipt.fileName || receipt.name;
  const size = receipt.displaySize || receipt.size || "";
  return size ? `${name} · ${size}` : name;
}

export default function QuickCreatePanel() {
  const state = useAppState();
  const [type, setType] = useState(null);
  const [form, setForm] = useState(initialForms.place);
  const [error, setError] = useState("");
  const dayOptions = useMemo(() => state.itineraryDays.map((day) => day.day), [state.itineraryDays]);

  function open(nextType) {
    setType(nextType);
    setForm({
      ...initialForms[nextType],
      ...(nextType === "activity" ? { day: dayOptions[0] || "Día 1" } : {}),
    });
    setError("");
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const required = {
      place: ["name", "category", "zone"],
      activity: ["day", "time", "name", "type", "address"],
      transport: ["type", "origin", "destination", "date", "departure"],
      accommodation: ["name", "address", "checkIn", "checkOut"],
      restaurant: ["name", "food", "area"],
      expense: ["name", "category", "amount"],
      document: ["name", "type"],
      requirement: ["title", "category"],
      task: ["title", "category"],
      packing: ["name", "category"],
      note: ["title", "content"],
      contact: ["name", "type"],
      emergency: ["title", "value"],
    }[type];
    if (required.some((field) => !form[field])) {
      setError("Completa los campos principales para guardar.");
      return;
    }

    if (type === "place") state.addPlace(form);
    if (type === "activity") state.addActivity(form);
    if (type === "transport") state.addTransport(form);
    if (type === "accommodation") state.addAccommodation(form);
    if (type === "restaurant") state.addRestaurant(form);
    if (type === "expense") state.addExpense(form);
    if (type === "document") state.addDocument(form);
    if (type === "requirement") state.addTask("Antes del viaje", { title: form.title, priority: form.priority, due: form.due, category: form.category, done: form.done });
    if (type === "task") state.addTask(form.group, form);
    if (type === "packing") state.addPackingItem(form);
    if (type === "note") state.addPersonalNote(form);
    if (type === "contact") state.addContact(form);
    if (type === "emergency") state.addEmergencyInfo(form);
    setType(null);
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-black text-ink">Crear rápido</h2>
          <p className="mt-1 text-sm text-slate-500">Añade información importante al viaje sin salir del resumen.</p>
        </div>
        <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">Viaje activo</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map(([key, label, Icon]) => (
          <button key={key} type="button" className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left font-black text-ink transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700" onClick={() => open(key)}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <Icon size={18} />
            </span>
            {label}
          </button>
        ))}
      </div>

      <Modal open={Boolean(type) && !["transport", "accommodation", "restaurant"].includes(type)} onClose={() => setType(null)} title={titles[type] || "Crear elemento"} description="Se guardará únicamente dentro del viaje activo.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          {type === "place" && <PlaceFields form={form} update={update} />}
          {type === "activity" && <ActivityFields form={form} update={update} days={dayOptions} places={state.places} />}
          {type === "transport" && <TransportFields form={form} update={update} />}
          {type === "accommodation" && <AccommodationFields form={form} update={update} />}
          {type === "restaurant" && <RestaurantFields form={form} update={update} />}
          {type === "expense" && <ExpenseFields form={form} update={update} />}
          {type === "document" && <DocumentFields form={form} update={update} />}
          {type === "requirement" && <RequirementFields form={form} update={update} documents={state.documents} />}
          {type === "task" && <TaskFields form={form} update={update} groups={Object.keys(state.checklist)} />}
          {type === "packing" && <PackingFields form={form} update={update} />}
          {type === "note" && <NoteFields form={form} update={update} />}
          {type === "contact" && <ContactFields form={form} update={update} />}
          {type === "emergency" && <EmergencyFields form={form} update={update} />}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => setType(null)}>Cancelar</button>
            <button type="submit" className="primary-button"><Plus size={16} /> Guardar</button>
          </div>
        </form>
      </Modal>
      <TransportFormModal open={type === "transport"} onClose={() => setType(null)} />
      <AccommodationFormModal open={type === "accommodation"} onClose={() => setType(null)} />
      <RestaurantFormModal open={type === "restaurant"} onClose={() => setType(null)} />
    </section>
  );
}

function PlaceFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Nombre" value={form.name} onChange={(e) => update("name", e.target.value)} /><FormInput label="Zona" value={form.zone} onChange={(e) => update("zone", e.target.value)} /><FormSelect label="Categoría" value={form.category} onChange={(e) => update("category", e.target.value)}>{["Monumento", "Museo", "Barrio", "Mirador", "Experiencia"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormSelect label="Prioridad" value={form.priority} onChange={(e) => update("priority", e.target.value)}>{["Alta", "Media", "Baja"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormInput label="Precio" value={form.price} onChange={(e) => update("price", e.target.value)} /><FormInput label="Duración" value={form.duration} onChange={(e) => update("duration", e.target.value)} /><FormInput label="Día asignado" value={form.day} onChange={(e) => update("day", e.target.value)} /><FormSelect label="Necesita reserva" value={form.needsBooking} onChange={(e) => update("needsBooking", e.target.value)}><option value="no">No</option><option value="sí">Sí</option></FormSelect><FormTextarea label="Nota" value={form.note} onChange={(e) => update("note", e.target.value)} /></div>;
}
function ActivityFields({ form, update, days, places }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Día" value={form.day} onChange={(e) => update("day", e.target.value)}>{days.map((d) => <option key={d}>{d}</option>)}</FormSelect><FormInput label="Hora" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} /><FormInput label="Nombre" value={form.name} onChange={(e) => update("name", e.target.value)} list="places-list" /><datalist id="places-list">{places.map((p) => <option key={p.name} value={p.name} />)}</datalist><FormSelect label="Tipo" value={form.type} onChange={(e) => update("type", e.target.value)}>{["Transporte", "Visita", "Comida", "Alojamiento", "Experiencia"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormInput label="Dirección o zona" value={form.address} onChange={(e) => update("address", e.target.value)} /><FormInput label="Duración" value={form.duration} onChange={(e) => update("duration", e.target.value)} /><FormInput label="Desplazamiento" value={form.travelTime} onChange={(e) => update("travelTime", e.target.value)} /><FormInput label="Coste" value={form.cost} onChange={(e) => update("cost", e.target.value)} /><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}
function TransportFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Tipo" value={form.type} onChange={(e) => update("type", e.target.value)}>{["Vuelo", "Tren", "Bus", "Taxi", "Metro"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormInput label="Compañía" value={form.company} onChange={(e) => update("company", e.target.value)} /><FormInput label="Origen" value={form.origin} onChange={(e) => update("origin", e.target.value)} /><FormInput label="Destino" value={form.destination} onChange={(e) => update("destination", e.target.value)} /><FormInput label="Fecha" value={form.date} onChange={(e) => update("date", e.target.value)} /><FormInput label="Salida" type="time" value={form.departure} onChange={(e) => update("departure", e.target.value)} /><FormInput label="Llegada" type="time" value={form.arrival} onChange={(e) => update("arrival", e.target.value)} /><FormInput label="Precio" value={form.price} onChange={(e) => update("price", e.target.value)} /><FormSelect label="Estado" value={form.status} onChange={(e) => update("status", e.target.value)}><option value="pendiente">Pendiente</option><option value="comprado">Comprado</option><option value="confirmado">Confirmado</option></FormSelect><FormInput label="Localizador" value={form.locator} onChange={(e) => update("locator", e.target.value)} /><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}
function AccommodationFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Nombre" value={form.name} onChange={(e) => update("name", e.target.value)} /><FormSelect label="Tipo" value={form.type} onChange={(e) => update("type", e.target.value)}>{["Hotel", "Apartamento", "Hostal"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormInput label="Dirección" value={form.address} onChange={(e) => update("address", e.target.value)} /><FormInput label="Check-in" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} /><FormInput label="Check-out" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} /><FormInput label="Noches" value={form.nights} onChange={(e) => update("nights", e.target.value)} /><FormInput label="Precio" value={form.price} onChange={(e) => update("price", e.target.value)} /><FormSelect label="Estado" value={form.status} onChange={(e) => update("status", e.target.value)}><option value="pendiente">Pendiente</option><option value="reservado">Reservado</option><option value="cancelado">Cancelado</option></FormSelect><FormInput label="Servicios" value={form.services} onChange={(e) => update("services", e.target.value)} placeholder="Desayuno, recepción 24h" /><FormInput label="Días del viaje" value={form.days} onChange={(e) => update("days", e.target.value)} /><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}
function RestaurantFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Nombre" value={form.name} onChange={(e) => update("name", e.target.value)} /><FormInput label="Tipo de comida" value={form.food} onChange={(e) => update("food", e.target.value)} /><FormInput label="Zona" value={form.area} onChange={(e) => update("area", e.target.value)} /><FormInput label="Cerca de" value={form.near} onChange={(e) => update("near", e.target.value)} /><FormSelect label="Precio" value={form.price} onChange={(e) => update("price", e.target.value)}><option>€</option><option>€€</option><option>€€€</option></FormSelect><FormInput label="Valoración" value={form.rating} onChange={(e) => update("rating", e.target.value)} /><FormSelect label="Reserva" value={form.needsBooking} onChange={(e) => update("needsBooking", e.target.value)}><option value="no">No</option><option value="sí">Sí</option></FormSelect><FormInput label="Día sugerido" value={form.day} onChange={(e) => update("day", e.target.value)} /><FormTextarea label="Nota" value={form.note} onChange={(e) => update("note", e.target.value)} /></div>;
}
function ExpenseFields({ form, update }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormInput label="Concepto" value={form.name} onChange={(e) => update("name", e.target.value)} />
      <FormSelect label="Categoría" value={form.category} onChange={(e) => update("category", e.target.value)}>{["Vuelos", "Alojamiento", "Transporte", "Comida", "Entradas", "Extras"].map((x) => <option key={x}>{x}</option>)}</FormSelect>
      <FormInput label="Importe" type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
      <FormSelect label="Estado" value={form.status} onChange={(e) => update("status", e.target.value)}><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option></FormSelect>
      <div className="sm:col-span-2 rounded-2xl border border-line bg-slate-50 p-4">
        <label className="block text-sm font-black text-ink">
          Justificante
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(event) => update("receipt", fileToReceipt(event.target.files?.[0]))}
            className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-primary-700 hover:file:bg-primary-100"
          />
        </label>
        <p className="mt-2 text-xs font-semibold text-slate-500">Se guardan solo nombre, tipo y tamaño del archivo para esta demo.</p>
        {form.receipt ? (
          <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-bold text-primary-800">{receiptName(form.receipt)}</span>
            <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => update("receipt", null)}>
              Quitar archivo
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
function DocumentFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Nombre" value={form.name} onChange={(e) => update("name", e.target.value)} /><FormSelect label="Tipo" value={form.type} onChange={(e) => update("type", e.target.value)}>{["Billete", "Reserva", "Entrada", "Seguro", "Identificación", "Factura", "Ticket", "Recibo"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormSelect label="Estado" value={form.status} onChange={(e) => update("status", e.target.value)}><option value="subido">Subido</option><option value="pendiente">Pendiente</option></FormSelect><FormInput label="Relacionado con" value={form.related} onChange={(e) => update("related", e.target.value)} /><FormInput label="Fecha" value={form.date} onChange={(e) => update("date", e.target.value)} /><div className="sm:col-span-2 rounded-2xl border border-line bg-slate-50 p-4"><label className="block text-sm font-black text-ink">Archivo PDF o imagen<input type="file" accept=".pdf,image/*" onChange={(event) => { const file = fileToDocumentMeta(event.target.files?.[0]); update("file", file); update("size", file ? fileLabel(file) : ""); }} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-primary-700 hover:file:bg-primary-100" /></label>{form.file ? <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-primary-800">{fileLabel(form.file)}</p> : null}</div></div>;
}
function RequirementFields({ form, update, documents }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Requisito" value={form.title} onChange={(e) => update("title", e.target.value)} /><FormInput label="Categoría" value={form.category} onChange={(e) => update("category", e.target.value)} /><FormSelect label="Prioridad" value={form.priority} onChange={(e) => update("priority", e.target.value)}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></FormSelect><FormSelect label="Estado" value={form.done} onChange={(e) => update("done", e.target.value)}><option value="pendiente">Pendiente</option><option value="completada">Completada</option></FormSelect><FormInput label="Fecha límite" value={form.due} onChange={(e) => update("due", e.target.value)} /><FormSelect label="Documento vinculado" value={form.document} onChange={(e) => update("document", e.target.value)}><option value="">Sin vincular</option>{documents.map((doc) => <option key={doc.name}>{doc.name}</option>)}</FormSelect><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}
function TaskFields({ form, update, groups }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Tarea" value={form.title} onChange={(e) => update("title", e.target.value)} /><FormSelect label="Sección" value={form.group} onChange={(e) => update("group", e.target.value)}>{groups.map((g) => <option key={g}>{g}</option>)}</FormSelect><FormSelect label="Prioridad" value={form.priority} onChange={(e) => update("priority", e.target.value)}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></FormSelect><FormInput label="Fecha límite" value={form.due} onChange={(e) => update("due", e.target.value)} /><FormInput label="Categoría" value={form.category} onChange={(e) => update("category", e.target.value)} /><FormSelect label="Estado" value={form.done} onChange={(e) => update("done", e.target.value)}><option value="pendiente">Pendiente</option><option value="completada">Completada</option></FormSelect></div>;
}

function PackingFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Elemento" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Cargador, pasaporte, chaqueta..." /><FormSelect label="Categoría" value={form.category} onChange={(e) => update("category", e.target.value)}>{["Ropa", "Documentación", "Tecnología", "Aseo", "Salud", "Otros"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormSelect label="Prioridad" value={form.priority} onChange={(e) => update("priority", e.target.value)}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></FormSelect><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}

function NoteFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Título" value={form.title} onChange={(e) => update("title", e.target.value)} /><FormInput label="Categoría" value={form.category} onChange={(e) => update("category", e.target.value)} /><FormTextarea label="Contenido" value={form.content} onChange={(e) => update("content", e.target.value)} /></div>;
}

function ContactFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Nombre" value={form.name} onChange={(e) => update("name", e.target.value)} /><FormSelect label="Tipo" value={form.type} onChange={(e) => update("type", e.target.value)}>{["Alojamiento", "Guía", "Agencia", "Conductor", "Embajada", "Seguro", "Restaurante", "Familiar", "Otro"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormInput label="Teléfono" value={form.phone} onChange={(e) => update("phone", e.target.value)} /><FormInput label="Email" value={form.email} onChange={(e) => update("email", e.target.value)} /><FormInput label="Dirección" value={form.address} onChange={(e) => update("address", e.target.value)} /><FormSelect label="Emergencia" value={form.emergency} onChange={(e) => update("emergency", e.target.value)}><option value="no">No</option><option value="sí">Sí</option></FormSelect><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}

function EmergencyFields({ form, update }) {
  return <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Título" value={form.title} onChange={(e) => update("title", e.target.value)} /><FormSelect label="Tipo" value={form.type} onChange={(e) => update("type", e.target.value)}>{["Salud", "Seguro", "Documentación", "Embajada", "Dinero", "Otro"].map((x) => <option key={x}>{x}</option>)}</FormSelect><FormInput label="Dato importante" value={form.value} onChange={(e) => update("value", e.target.value)} /><FormSelect label="Prioridad" value={form.priority} onChange={(e) => update("priority", e.target.value)}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></FormSelect><FormTextarea label="Notas" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></div>;
}
