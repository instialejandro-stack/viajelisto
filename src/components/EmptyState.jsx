import React from "react";
import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ title, description, actionLabel, actionHref, onAction, icon: Icon = Inbox }) {
  const action = actionLabel ? (
    actionHref ? (
      <Link to={actionHref} className="primary-button mt-6 justify-center">
        {actionLabel}
      </Link>
    ) : (
      <button type="button" className="primary-button mt-6 justify-center" onClick={onAction}>
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 shadow-sm">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {action}
    </div>
  );
}
