import React from "react";

export default function StepCard({ step, title, description }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-soft">
      <span className="absolute right-5 top-4 text-6xl font-black text-slate-100">{step}</span>
      <div className="relative">
        <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-black text-white">{step}</span>
        <h3 className="text-xl font-black text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </article>
  );
}
