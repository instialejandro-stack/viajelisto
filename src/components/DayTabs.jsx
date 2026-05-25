import React from "react";

export default function DayTabs({ days, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day, index) => (
        <button
          key={day.day}
          onClick={() => onChange(index)}
          className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
            active === index
              ? "border-primary-200 bg-primary-600 text-white shadow-soft"
              : "border-line bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50"
          }`}
        >
          <span className="block text-sm font-black">{day.day}</span>
          <span className={`mt-1 block text-xs font-semibold ${active === index ? "text-primary-50" : "text-slate-400"}`}>
            {day.date}
          </span>
        </button>
      ))}
    </div>
  );
}
