import React from "react";

export default function FeatureCard({ icon: Icon, title, description, className = "" }) {
  return (
    <article className={`rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary-200 ${className}`}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
        <Icon size={21} />
      </div>
      <h3 className="text-base font-black text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}
