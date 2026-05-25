import React from "react";
import { CalendarDays, Check } from "lucide-react";
import ItemActions from "./ItemActions.jsx";

const priorityStyles = {
  alta: "bg-rose-50 text-rose-700",
  media: "bg-amber-50 text-amber-700",
  baja: "bg-slate-100 text-slate-600",
};

export default function ChecklistItem({ label, done, item, onToggle, onEdit, onDelete }) {
  const task = item || { title: label, done };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        onClick={onToggle}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary-200 ${task.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent hover:border-primary-300"}`}
        aria-label={task.done ? "Marcar como pendiente" : "Marcar como completada"}
      >
        <Check size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-black ${task.done ? "text-slate-400 line-through" : "text-ink"}`}>{task.title}</h3>
          {task.priority && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${priorityStyles[task.priority] || priorityStyles.baja}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
        </div>
        {(task.category || task.due) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            {task.category && <span className="rounded-full bg-slate-100 px-2.5 py-1">{task.category}</span>}
            {task.due && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                <CalendarDays size={13} /> {task.due}
              </span>
            )}
          </div>
        )}
      </div>
      <ItemActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
