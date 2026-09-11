import React, { useState } from 'react';
import { Shield, AlertTriangle, ArrowRight, Sparkles, ExternalLink, Search, Filter, ChevronRight, X, Flame, Target } from 'lucide-react';
import RiskBadge from './RiskBadge';

function formatINR(val) {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function AnomalyRegistrySection({ anomalies = [], onInvestigate, onViewAll, onCrossAgency }) {
  // Top 5 anomalies for main page display
  const top5Anomalies = anomalies.slice(0, 5);

  return (
    <div id="registry" className="bento-card space-y-6 relative overflow-hidden border-emerald-500/30">
      {/* Decorative Green Matrix Flare */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
              STEP 2: ANOMALY REGISTRY
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-black">
              Top Ranked Critical Outliers
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
            MPLADS Spending-Anomaly Registry
          </h2>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {onCrossAgency && (
            <button
              onClick={onCrossAgency}
              className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border-2 border-emerald-400 text-emerald-300 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95"
            >
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Cross-Agency Comparison</span>
            </button>
          )}
          <button
            onClick={onViewAll}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-emerald-500 text-emerald-400 hover:text-emerald-300 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <span>View All ({anomalies.length} Records)</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* TOP 5 ANOMALIES TABLE BENTO CARD */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-500/30 bg-slate-950/80 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-emerald-950/40 text-emerald-400 uppercase font-mono text-[11px] border-b border-emerald-900/60 font-black">
              <th className="py-3.5 px-4">Rank & Risk Score</th>
              <th className="py-3.5 px-4">Implementing Agency</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Monthly Disbursed</th>

              <th className="py-3.5 px-4 text-right">Investigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/40 font-bold">
            {top5Anomalies.map((a, idx) => (
              <tr key={a.anomaly_id || idx} className="hover:bg-emerald-950/20 transition-colors">
                {/* Rank & Risk Score */}
                <td className="py-4 px-4 font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/40">
                      #{idx + 1}
                    </span>
                    <RiskBadge score={a.risk_score} tier={a.risk_tier || a.severity} />
                  </div>
                </td>

                {/* Agency */}
                <td className="py-4 px-4">
                  <div className="font-black text-white text-sm">{a.agency_name}</div>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold">{a.agency_id || a.anomaly_id}</div>
                </td>

                {/* Location */}
                <td className="py-4 px-4">
                  <div className="text-slate-200 font-bold">{a.district || "District"}</div>
                  <div className="text-[11px] text-slate-400 font-bold">{a.state} • {a.year_month}</div>
                </td>

                {/* Monthly Amount */}
                <td className="py-4 px-4 font-mono">
                  <div className="font-black text-base text-emerald-400">{formatINR(a.monthly_amount)}</div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {a.velocity_spike_ratio ? `${Number(a.velocity_spike_ratio).toFixed(1)}× velocity` : 'Active'}
                  </div>
                </td>



                {/* Action Button */}
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onInvestigate(a)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/25 hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Investigate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Callout Box */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-emerald-500/30">
        <div className="text-xs text-slate-300 font-bold">
          Showing <strong>5 of {anomalies.length}</strong> flagged expenditure records. Click below to inspect the complete filterable registry on a separate webpage.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={onViewAll}
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Show More (Full Registry)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
