import React from "react";

export default function FilterPills({ filters }) {
  return (
    <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter, index) => (
        <button
          key={filter}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
            index === 0
              ? "border-primary-200 bg-primary-600 text-white shadow-sm"
              : "border-line bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
