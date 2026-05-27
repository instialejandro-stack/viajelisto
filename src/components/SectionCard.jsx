import React from "react";

export default function SectionCard({ title, action, children, className = "", description }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="min-w-0 text-base font-bold text-ink sm:text-lg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
