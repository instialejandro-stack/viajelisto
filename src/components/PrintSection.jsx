import React from "react";

export default function PrintSection({ title, subtitle, children }) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-5 print:rounded-none print:border-slate-300 print:p-4">
      <div className="mb-4">
        <h2 className="text-lg font-black text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
