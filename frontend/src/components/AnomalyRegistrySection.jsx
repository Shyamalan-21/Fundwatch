import React, { useState } from 'react';
import { Shield, AlertTriangle, ArrowRight, Sparkles, ExternalLink, Search, Filter, ChevronRight, X, Flame } from 'lucide-react';
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

  const states = ['ALL', ...new Set(anomalies.map(a => a.state).filter(Boolean))];

  return (
    <div id="registry" className="bento-card space-y-6 relative overflow-hidden">
      {/* Decorative Red Flare */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-rose-600/20">
              STEP 2: ANOMALY REGISTRY
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black">
              Top Ranked Critical Outliers
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-600 animate-pulse" />
            MPLADS Spending-Anomaly Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 font-bold">
            Flagged agency expenditures ranked by Composite Risk Score ($0-100$) based on Modified Z-score ($S_1$), IQR spread ($S_2$), Peer disparity ($S_3$), and Velocity spikes ($S_4$).
          </p>
        </div>

        {/* View All Button in Header */}
        <button
          onClick={() => setIsFullModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 border-2 border-rose-600 text-rose-600 hover:text-rose-700 text-xs font-black transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          <span>View All ({anomalies.length} Records)</span>
          <ChevronRight className="w-4 h-4 text-rose-600" />
        </button>
      </div>

      {/* TOP 5 ANOMALIES TABLE BENTO CARD */}
      <div className="overflow-x-auto rounded-2xl border-2 border-rose-100 bg-white/90 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-rose-50/80 text-rose-900 uppercase font-mono text-[11px] border-b border-rose-200 font-black">
              <th className="py-3.5 px-4">Rank & Risk Score</th>
              <th className="py-3.5 px-4">Implementing Agency</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Monthly Disbursed</th>
              <th className="py-3.5 px-4">Primary Anomaly Triggers ($S_1 - S_4$)</th>
              <th className="py-3.5 px-4 text-right">Investigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100 font-bold">
            {top5Anomalies.map((a, idx) => (
              <tr key={a.anomaly_id || idx} className="hover:bg-rose-50/50 transition-colors">
                {/* Rank & Risk Score */}
                <td className="py-4 px-4 font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs border border-rose-300">
                      #{idx + 1}
                    </span>
                    <RiskBadge score={a.risk_score} tier={a.risk_tier || a.severity} />
                  </div>
                </td>

                {/* Agency */}
                <td className="py-4 px-4">
                  <div className="font-black text-slate-900 text-sm">{a.agency_name}</div>
                  <div className="text-[11px] text-rose-600 font-mono font-bold">{a.agency_id}</div>
                </td>

                {/* Location */}
                <td className="py-4 px-4">
                  <div className="text-slate-900 font-bold">{a.district || "District"}</div>
                  <div className="text-[11px] text-slate-500 font-bold">{a.state} • {a.year_month}</div>
                </td>

                {/* Monthly Amount */}
                <td className="py-4 px-4 font-mono">
                  <div className="font-black text-base text-rose-600">{formatINR(a.monthly_amount)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    {a.velocity_spike_ratio ? `${a.velocity_spike_ratio.toFixed(1)}× velocity` : 'Active'}
                  </div>
                </td>

                {/* Primary Triggers */}
                <td className="py-4 px-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {a.is_ghost_bill && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-sm">
                        🚨 Ghost Bill (≤3d)
                      </span>
                    )}
                    {a.mod_z_score >= 3.5 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                        S1: Z={a.mod_z_score?.toFixed(1)}
                      </span>
                    )}
                    {a.peer_cost_ratio >= 2.0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        S3: {a.peer_cost_ratio?.toFixed(1)}× Peer Med
                      </span>
                    )}
                    {a.trigger_reason && (
                      <span className="text-[11px] text-slate-700 line-clamp-1 max-w-xs font-bold">
                        {a.trigger_reason}
                      </span>
                    )}
                  </div>
                </td>

                {/* Action Button */}
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onInvestigate(a)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/25 hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Investigate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Callout Box */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50/70 p-4 sm:p-5 rounded-2xl border-2 border-rose-200">
        <div className="text-xs text-slate-700 font-bold">
          Showing <strong>5 of {anomalies.length}</strong> flagged expenditure records. Click below to inspect the complete filterable registry.
        </div>
        <button
          onClick={() => setIsFullModalOpen(true)}
          className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>Show More (Full Registry)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FULL REGISTRY MODAL IN RED & WHITE THEME */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white border-2 border-rose-300 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/80">
              <div>
                <h3 className="text-xl font-black text-rose-600 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  Complete MPLADS Spending Anomaly Registry
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  Full list of {filteredAnomalies.length} flagged records sorted by Composite Risk Score
                </p>
              </div>
              <button
                onClick={() => setIsFullModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-rose-100 bg-rose-50/40 grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search agency, district, state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-bold"
                />
              </div>

              {/* State Filter */}
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-bold"
                >
                  {states.map(s => (
                    <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
                  ))}
                </select>
              </div>

              {/* Min Risk Slider */}
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-rose-200 text-xs">
                <span className="text-slate-600 text-[11px] font-bold whitespace-nowrap">Min Risk:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="accent-rose-600 h-1.5 bg-rose-100 rounded flex-1 cursor-pointer"
                />
                <span className="font-mono text-rose-600 font-black text-sm">{minScore}+</span>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-rose-50 border-b border-rose-200 text-rose-900 font-mono text-[11px] font-black">
                  <tr>
                    <th className="py-3 px-3">Risk Score</th>
                    <th className="py-3 px-3">Implementing Agency</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Disbursed (INR)</th>
                    <th className="py-3 px-3">Mathematical Signals</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 font-bold">
                  {filteredAnomalies.map((a, i) => (
                    <tr key={a.anomaly_id || i} className="hover:bg-rose-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <RiskBadge score={a.risk_score} tier={a.risk_tier || a.severity} />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">{a.agency_name}</div>
                        <div className="text-[10px] text-rose-600 font-mono font-bold">{a.agency_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-900 font-bold">{a.district || "District"}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{a.state} • {a.year_month}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-rose-600">
                        {formatINR(a.monthly_amount)}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-700 font-bold">
                        {a.trigger_reason || "Multi-signal anomaly"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setIsFullModalOpen(false);
                            onInvestigate(a);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-black transition-all cursor-pointer shadow-sm"
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
            <div className="p-4 border-t border-rose-100 bg-rose-50/80 flex items-center justify-between text-xs text-slate-700 font-bold">
              <span>Showing {filteredAnomalies.length} records</span>
              <button
                onClick={() => setIsFullModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black cursor-pointer shadow-md"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
