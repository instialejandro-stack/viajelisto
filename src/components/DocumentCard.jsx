import React from "react";
import { FileCheck2, FileText, FileUp, IdCard, ShieldCheck, Ticket } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

const icons = {
  Billete: Ticket,
  Reserva: FileCheck2,
  Entrada: Ticket,
  Seguro: ShieldCheck,
  Identificación: IdCard,
  Pasaporte: IdCard,
  DNI: IdCard,
};

export default function DocumentCard({ document, onEdit, onDelete }) {
  const Icon = icons[document.type] || FileText;
  const uploaded = ["subido", "Añadido"].includes(document.status);
  const fileName = document.file?.fileName || document.size;

  return (
    <article className="card p-5 transition hover:-translate-y-1 hover:border-primary-200">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${uploaded ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          <Icon size={22} />
        </span>
        <div className="flex items-center gap-2">
          <Badge>{document.status}</Badge>
          <ItemActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500">{document.type}</p>
      <h2 className="mt-1 text-xl font-black text-ink">{document.name}</h2>
      <div className="mt-4 grid gap-2 text-sm">
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">Relacionado con <strong className="text-ink">{document.related || "Viaje completo"}</strong></p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">Asociado a <strong className="text-ink">{document.relatedToType || "trip"}</strong></p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">Fecha <strong className="text-ink">{document.date || "Sin fecha"}</strong></p>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">Archivo <strong className="text-ink">{fileName || "Pendiente"}</strong></p>
      </div>
      <button className={`mt-5 w-full ${uploaded ? "secondary-button" : "primary-button"}`}>
        <FileUp size={16} /> {uploaded ? "Ver documento" : "Subir archivo"}
      </button>
    </article>
  );
}
