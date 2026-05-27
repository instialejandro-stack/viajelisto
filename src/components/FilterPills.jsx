import React from "react";

export default function FilterPills({ filters, activeFilter, onFilter }) {
  const active = activeFilter ?? filters[0];

  return (
    <div className="scrollbar-soft flex gap-1.5 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilter?.(filter)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 ${
            active === filter
              ? "bg-primary-600 text-white shadow-sm"
              : "border border-line bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-500 dark:hover:bg-slate-700"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
