import React from "react";
import { Link } from "react-router-dom";

export default function QuickAccessCard({ label, path, icon: Icon }) {
  return (
    <Link
      to={path}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 font-bold text-ink transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary-700 transition group-hover:bg-white">
        <Icon size={19} />
      </span>
      {label}
    </Link>
  );
}
