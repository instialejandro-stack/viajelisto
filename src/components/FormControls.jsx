import React from "react";

const inputClass = "mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-primary-200 focus:ring-2 focus:ring-primary-100";

export function FormInput({ label, ...props }) {
  return (
    <label className="block text-sm font-black text-ink">
      {label}
      <input className={inputClass} {...props} />
    </label>
  );
}

export function FormSelect({ label, children, ...props }) {
  return (
    <label className="block text-sm font-black text-ink">
      {label}
      <select className={inputClass} {...props}>
        {children}
      </select>
    </label>
  );
}

export function FormTextarea({ label, ...props }) {
  return (
    <label className="block text-sm font-black text-ink">
      {label}
      <textarea className={`${inputClass} min-h-24 resize-y`} {...props} />
    </label>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{children}</p>;
}
