import React from "react";
import { backgroundImageStyle, getVisualAsset } from "../utils/visualAssets.js";

export default function SectionCard({ title, action, children, className = "", description }) {
  const image = getVisualAsset(title, description);

  return (
    <section className={`card overflow-hidden bg-cover bg-center p-5 sm:p-6 ${className}`} style={backgroundImageStyle(image, "strong")}>
      <div className="relative mb-5 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="min-w-0 text-base font-bold text-ink sm:text-lg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
