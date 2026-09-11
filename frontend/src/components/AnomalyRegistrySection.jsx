import React, { useState } from 'react';
import { Shield, AlertTriangle, ArrowRight, Sparkles, ExternalLink, Search, Filter, ChevronRight, X } from 'lucide-react';
import RiskBadge from './RiskBadge';

function formatINR(val) {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function AnomalyRegistrySection({ anomalies = [], onInvestigate }) {
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [selectedState, setSelectedState] = useState('ALL');

  // Top 5 anomalies for main page display
  const top5Anomalies = anomalies.slice(0, 5);

  // Filtered anomalies for the "Show More" full view modal
  const filteredAnomalies = anomalies.filter(a => {
    const matchSearch =
      !searchTerm ||
      a.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.anomaly_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchScore = (a.risk_score || 0) >= minScore;
    const matchState = selectedState === 'ALL' || a.state?.toLowerCase() === selectedState.toLowerCase();

    return matchSearch && matchScore && matchState;
  });

  // Extract unique states for filter
  const states = ['ALL', ...new Set(anomalies.map(a => a.state).filter(Boolean))];

  return (
    <div id="registry" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-bold">
              STEP 2: ANOMALY REGISTRY
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold">
              Top Ranked Outliers
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            MPLADS Spending-Anomaly Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Top flagged agency expenditures ranked by Composite Risk Score ($0-100$) derived from Modified Z-score ($S_1$), IQR ($S_2$), Peer Benchmarks ($S_3$), and Ghost Velocity ($S_4$).
          </p>
        </div>

        {/* Show More Button in Header */}
        <button
          onClick={() => setIsFullModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>View All ({anomalies.length} Flagged)</span>
          <ChevronRight className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* TOP 5 ANOMALIES TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <th className="py-3 px-4">Rank & Risk Score</th>
              <th className="py-3 px-4">Implementing Agency</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Monthly Disbursed</th>
              <th className="py-3 px-4">Primary Anomaly Triggers ($S_1 - S_4$)</th>
              <th className="py-3 px-4 text-right">Investigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {top5Anomalies.map((a, idx) => (
              <tr key={a.anomaly_id || idx} className="hover:bg-slate-900/50 transition-colors">
                {/* Rank & Risk Score */}
                <td className="py-3.5 px-4 font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px]">
                      #{idx + 1}
                    </span>
                    <RiskBadge score={a.risk_score} severity={a.severity} />
                  </div>
                </td>

                {/* Implementing Agency */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-200">{a.agency_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{a.agency_id}</div>
                </td>

                {/* Location */}
                <td className="py-3.5 px-4">
                  <div className="text-slate-300 font-medium">{a.district || "District"}</div>
                  <div className="text-[11px] text-slate-500">{a.state} • {a.year_month}</div>
                </td>

                {/* Monthly Disbursed */}
                <td className="py-3.5 px-4 font-mono">
                  <div className="font-bold text-emerald-400">{formatINR(a.monthly_amount)}</div>
                  <div className="text-[10px] text-slate-500">
                    {a.velocity_spike_ratio ? `${a.velocity_spike_ratio.toFixed(1)}× velocity` : 'Active'}
                  </div>
                </td>

                {/* Primary Triggers */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {a.is_ghost_bill && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        🚨 Ghost Bill (≤3d)
                      </span>
                    )}
                    {a.mod_z_score >= 3.5 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                        S1: Z={a.mod_z_score?.toFixed(1)}
                      </span>
                    )}
                    {a.peer_cost_ratio >= 2.0 && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                        S3: {a.peer_cost_ratio?.toFixed(1)}× Peer Med
                      </span>
                    )}
                    {a.trigger_reason && (
                      <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                        {a.trigger_reason}
                      </span>
                    )}
                  </div>
                </td>

                {/* Action */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onInvestigate(a)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Investigate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Trigger Callout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="text-xs text-slate-400">
          Showing <strong>5 of {anomalies.length}</strong> flagged expenditure records. Click below to explore the complete filterable registry.
        </div>
        <button
          onClick={() => setIsFullModalOpen(true)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Show More (Full Registry)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FULL REGISTRY MODAL (OPENS ON "SHOW MORE") */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Complete MPLADS Spending Anomaly Registry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full list of {filteredAnomalies.length} flagged records sorted by Composite Risk Score
                </p>
              </div>
              <button
                onClick={() => setIsFullModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search agency, district, state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* State Filter */}
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {states.map(s => (
                    <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
                  ))}
                </select>
              </div>

              {/* Min Risk Slider */}
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <span className="text-slate-400 text-[11px] whitespace-nowrap">Min Risk:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="accent-sky-500 h-1 bg-slate-800 rounded flex-1 cursor-pointer"
                />
                <span className="font-mono text-sky-400 font-bold">{minScore}+</span>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Implementing Agency</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Disbursed (INR)</th>
                    <th className="py-2.5 px-3">Mathematical Signals</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAnomalies.map((a, i) => (
                    <tr key={a.anomaly_id || i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <RiskBadge score={a.risk_score} severity={a.severity} />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{a.agency_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{a.agency_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-300">{a.district || "District"}</div>
                        <div className="text-[10px] text-slate-500">{a.state} • {a.year_month}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {formatINR(a.monthly_amount)}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-300">
                        {a.trigger_reason || "Multi-signal anomaly"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setIsFullModalOpen(false);
                            onInvestigate(a);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredAnomalies.length} records</span>
              <button
                onClick={() => setIsFullModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
