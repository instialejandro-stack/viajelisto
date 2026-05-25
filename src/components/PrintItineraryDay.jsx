import React from "react";

export default function PrintItineraryDay({ day }) {
  return (
    <article className="break-inside-avoid rounded-xl border border-slate-200 p-4 print:rounded-none">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-black text-ink">
            {day.day} - {day.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{day.date}</p>
        </div>
        <p className="text-sm font-bold text-slate-500">{day.items.length} actividades</p>
      </div>
      <ul className="mt-4 grid gap-2">
        {day.items.map((item, index) => (
          <li key={`${item.time}-${item.name}-${index}`} className="grid grid-cols-[58px_1fr] gap-3 text-sm">
            <span className="font-black text-primary-700">{item.time}</span>
            <span className="text-slate-700">
              <strong className="font-black text-ink">{item.name}</strong>
              <span className="text-slate-500"> - {item.type}</span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
