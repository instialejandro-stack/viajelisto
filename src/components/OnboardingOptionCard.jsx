import React from "react";
import { ArrowRight } from "lucide-react";

export default function OnboardingOptionCard({ icon: Icon, title, description, actionLabel, variant = "secondary", onClick }) {
  const buttonClass = variant === "primary" ? "primary-button w-full sm:w-fit" : "secondary-button w-full sm:w-fit bg-white";

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-line bg-white p-6 shadow-soft">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
        <Icon size={22} />
      </span>
      <div className="mt-5 grow">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <button type="button" onClick={onClick} className={`${buttonClass} mt-6`}>
        {actionLabel}
        <ArrowRight size={16} />
      </button>
    </article>
  );
}
