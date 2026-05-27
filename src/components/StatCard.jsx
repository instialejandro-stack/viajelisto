import React from "react";
import { backgroundImageStyle, getVisualAsset } from "../utils/visualAssets.js";

const accents = {
  primary: {
    icon: "bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600",
    value: "text-ink",
  },
  emerald: {
    icon: "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600",
    value: "text-ink",
  },
  amber: {
    icon: "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600",
    value: "text-ink",
  },
  violet: {
    icon: "bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600",
    value: "text-ink",
  },
};

export default function StatCard({ icon: Icon, label, value, hint, accent = "primary" }) {
  const theme = accents[accent] || accents.primary;
  const image = getVisualAsset(label, hint);

  return (
    <div className="card overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover" style={backgroundImageStyle(image, "card")}>
      <div className="relative">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${theme.icon}`}>
          <Icon size={20} />
        </div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${theme.value}`}>{value}</p>
        {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
