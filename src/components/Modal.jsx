import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-line bg-white shadow-[0_30px_90px_rgba(24,39,75,0.22)]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white/95 p-5 backdrop-blur">
          <div>
            <h2 id="modal-title" className="text-2xl font-black text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
