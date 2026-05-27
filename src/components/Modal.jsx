import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-line bg-white shadow-modal animate-scale-in"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[2rem] border-b border-line bg-white/96 p-6 backdrop-blur">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            )}
          </div>
          <button
            className="icon-button shrink-0"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={17} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
