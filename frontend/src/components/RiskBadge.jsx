import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, Info, HelpCircle } from 'lucide-react';

export default function RiskBadge({ score, tier, isColdStart = false, showLabel = true, size = "md" }) {
  if (isColdStart || tier === "Insufficient History") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        {showLabel ? "Cold Start (<3 mos)" : "Cold Start"}
      </span>
    );
  }

  let colorClasses = "";
  let icon = null;

  if (score >= 75 || tier === "Critical" || tier === "High") {
    colorClasses = "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30 font-black";
    icon = <Flame className="w-3.5 h-3.5 text-black animate-pulse" />;
  } else if (score >= 40 || tier === "Medium") {
    colorClasses = "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-bold";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />;
  } else {
    colorClasses = "bg-slate-900 text-emerald-400 border border-emerald-500/30 font-bold";
    icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
  }

  const sizeClasses = size === "lg" 
    ? "px-3.5 py-1.5 text-sm gap-2" 
    : size === "sm"
    ? "px-2 py-0.5 text-xs gap-1"
    : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-sm ${colorClasses} ${sizeClasses}`}>
      {icon}
      <span>{score !== undefined ? `${score}/100` : tier}</span>
      {showLabel && tier && (
        <span className="opacity-90">• {tier}</span>
      )}
    </span>
  );
}
