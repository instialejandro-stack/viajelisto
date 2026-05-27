import React, { useRef, useState } from "react";
import { CalendarDays, Check, Pencil } from "lucide-react";
import ItemActions from "./ItemActions.jsx";

const priorityStyles = {
  alta: "bg-rose-50 text-rose-700",
  media: "bg-amber-50 text-amber-700",
  baja: "bg-slate-100 text-slate-600",
};

export default function ChecklistItem({ label, done, item, onToggle, onEdit, onDelete, onRename }) {
  const task = item || { title: label, done };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  function startEdit() {
    setDraft(task.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title && onRename) {
      onRename(trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
    }
    if (event.key === "Escape") {
      setEditing(false);
      setDraft(task.title);
    }
  }

  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-line bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        onClick={onToggle}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary-200 ${
          task.done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent hover:border-primary-300 dark:border-slate-600 dark:bg-slate-700"
        }`}
        aria-label={task.done ? "Marcar como pendiente" : "Marcar como completada"}
      >
        <Check size={16} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 rounded-lg border border-primary-300 bg-white px-2 py-0.5 text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-primary-100 dark:border-primary-600 dark:bg-slate-700 dark:text-white"
            />
          ) : (
            <h3
              className={`font-black ${task.done ? "text-slate-400 line-through" : "text-ink dark:text-white"} ${onRename ? "cursor-text" : ""}`}
              title={onRename ? "Doble clic para editar" : undefined}
              onDoubleClick={onRename ? startEdit : undefined}
            >
              {task.title}
            </h3>
          )}

          {!editing && onRename && (
            <button
              type="button"
              onClick={startEdit}
              className="rounded-lg p-1 text-slate-300 opacity-0 transition hover:text-primary-500 focus:opacity-100 group-hover:opacity-100 dark:text-slate-600"
              aria-label="Renombrar tarea"
              title="Editar nombre"
            >
              <Pencil size={13} />
            </button>
          )}

          {task.priority && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${priorityStyles[task.priority] || priorityStyles.baja}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
        </div>

        {(task.category || task.due) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            {task.category && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-700">{task.category}</span>
            )}
            {task.due && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-700">
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
