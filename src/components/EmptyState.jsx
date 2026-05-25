import React from "react";
import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ title, description, actionLabel, actionHref, onAction, icon: Icon = Inbox }) {
  const action = actionLabel ? (
    actionHref ? (
      <Link to={actionHref} className="primary-button mt-5 justify-center">
        {actionLabel}
      </Link>
    ) : (
      <button type="button" className="primary-button mt-5 justify-center" onClick={onAction}>
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <div className="rounded-3xl border border-dashed border-primary-200 bg-primary-50 p-8 text-center">
      <Icon className="mx-auto text-primary-700" size={28} />
      <h3 className="mt-3 text-lg font-black text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}
