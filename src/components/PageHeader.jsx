import React from "react";
import { Plus } from "lucide-react";
import { backgroundImageStyle, getVisualAsset } from "../utils/visualAssets.js";

export default function PageHeader({ eyebrow, title, subtitle, actionLabel, icon: Icon = Plus, onAction }) {
  const image = getVisualAsset(title, eyebrow, subtitle);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white bg-cover bg-center p-5 shadow-soft sm:p-8" style={backgroundImageStyle(image, "soft")}>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          {eyebrow && <p className="text-sm font-black uppercase text-primary-700">{eyebrow}</p>}
          <h1 className="mt-2 break-words text-3xl font-black text-ink sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{subtitle}</p>
        </div>
        {actionLabel && (
          <button className="primary-button shrink-0 px-5 py-3" onClick={onAction}>
            <Icon size={18} /> {actionLabel}
          </button>
        )}
      </div>
    </section>
  );
}
