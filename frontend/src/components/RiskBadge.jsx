import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, Info, HelpCircle } from 'lucide-react';

export default function RiskBadge({ score, tier, isColdStart = false, showLabel = true, size = "md" }) {
  if (isColdStart || tier === "Insufficient History") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-rose-50 text-rose-800 border border-rose-200">
        <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
        {showLabel ? "Cold Start (<3 mos)" : "Cold Start"}
      </span>
    );
  }

  let colorClasses = "";
  let icon = null;

  if (score >= 75 || tier === "Critical" || tier === "High") {
    colorClasses = "bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/30 font-black";
    icon = <Flame className="w-3.5 h-3.5 text-white animate-pulse" />;
  } else if (score >= 40 || tier === "Medium") {
    colorClasses = "bg-rose-100 text-rose-800 border-rose-300 font-bold";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
  } else {
    colorClasses = "bg-white text-rose-700 border-rose-200 font-bold shadow-sm";
    icon = <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />;
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
