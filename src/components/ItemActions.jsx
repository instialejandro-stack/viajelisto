import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ItemActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="icon-button h-9 w-9" onClick={onEdit} aria-label="Editar">
        <Pencil size={16} />
      </button>
      <button type="button" className="icon-button h-9 w-9 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={onDelete} aria-label="Eliminar">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
