import React from "react";
import Badge from "./Badge.jsx";

export default function ReviewCard({ title, subtitle, items }) {
  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-black text-ink">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={`${item.label}-${item.text}`} className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2">
              <Badge>{item.label}</Badge>
            </div>
            <p className="text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
