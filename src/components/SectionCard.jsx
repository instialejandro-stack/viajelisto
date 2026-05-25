import React from "react";

export default function SectionCard({ title, action, children, className = "" }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
        <h2 className="min-w-0 text-base font-black text-ink sm:text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
