import React from "react";
import EmptyState from "./EmptyState.jsx";
import ChecklistItem from "./ChecklistItem.jsx";
import SectionCard from "./SectionCard.jsx";

export default function ChecklistSection({ title, items, group, onToggle, onEdit, onDelete, onRename }) {
  const done = items.filter((item) => item.done).length;

  return (
    <SectionCard
      title={title}
      action={
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {done}/{items.length}
        </span>
      }
    >
      <div className="grid gap-3">
        {items.length ? (
          items.map((item, index) => (
            <ChecklistItem
              key={item.title || item[0]}
              item={item}
              onToggle={onToggle ? () => onToggle(group, index) : undefined}
              onEdit={onEdit ? () => onEdit(group, index, item) : undefined}
              onDelete={onDelete ? () => onDelete(group, index, item) : undefined}
              onRename={onRename ? (newTitle) => onRename(group, index, newTitle) : undefined}
            />
          ))
        ) : (
          <EmptyState title="Sin tareas en esta sección" description="Añade tareas cuando quieras preparar esta parte del viaje." />
        )}
      </div>
    </SectionCard>
  );
}
