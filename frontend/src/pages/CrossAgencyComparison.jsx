import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts';
import {
  ArrowLeft, Shield, AlertTriangle, TrendingUp, Users,
  Flame, Activity, Target, Layers, Eye,
  BarChart2, Zap
} from 'lucide-react';
import { fetchCrossAgencyComparison } from '../api/client';

/* ─────────────────────────────────────
   Helpers
───────────────────────────────────── */
function formatINR(val) {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000)   return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000)     return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function OutlierBadge({ tier }) {
  const cfg = {
    OUTLIER:  { bg: 'bg-red-500/20',    border: 'border-red-500/60',    text: 'text-red-400',    label: '⚠ OUTLIER'  },
    ELEVATED: { bg: 'bg-amber-500/20',  border: 'border-amber-500/60',  text: 'text-amber-400',  label: '↑ ELEVATED' },
    NORMAL:   { bg: 'bg-emerald-900/30',border: 'border-emerald-500/30',text: 'text-emerald-400',label: '✓ NORMAL'   },
  };
  const c = cfg[tier] || cfg.NORMAL;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${c.bg} ${c.border} ${c.text}`}>
      {c.label}
    </span>
  );
}

function DeviationBar({ pct }) {
  const clamped = Math.max(-100, Math.min(300, pct));
  const isPositive = clamped >= 0;
  const width = Math.abs(clamped) / 3;
  return (
    <div className="flex items-center gap-2">
      <span className={`font-black text-sm font-mono w-16 text-right ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
        {isPositive ? '+' : ''}{pct.toFixed(1)}%
      </span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden min-w-[60px]">
        <div
          className={`h-full rounded-full transition-all ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(100, width)}%` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Custom Recharts Tooltip
───────────────────────────────────── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3 text-xs shadow-2xl max-w-[220px]">
      <p className="font-black text-white mb-1 truncate">{d.agency_name}</p>
      <p className="text-emerald-400">Median Cost: <strong>{formatINR(d.median_cost_inr)}</strong></p>
      <p className="text-slate-300">
        Deviation:{' '}
        <strong className={d.deviation_pct >= 0 ? 'text-red-400' : 'text-emerald-400'}>
          {d.deviation_pct >= 0 ? '+' : ''}{d.deviation_pct?.toFixed(1)}%
        </strong>
      </p>
      <p className="text-slate-400">Works: {d.works_count} • Avg Risk: {d.avg_risk_score}</p>
      <div className="mt-1"><OutlierBadge tier={d.outlier_tier} /></div>
    </div>
  );
}

/* ─────────────────────────────────────
   Main Page Component
───────────────────────────────────── */
export default function CrossAgencyComparison({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedAgency, setExpandedAgency] = useState(null);

  useEffect(() => {
    fetchCrossAgencyComparison().then(d => {
      setData(d);
      if (d?.categories?.length) setSelectedCategory(d.categories[0].category);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories  = data?.categories  || [];
  const byCategory  = data?.by_category || {};
  const activeCat   = selectedCategory ? byCategory[selectedCategory] : null;
  const agencies    = activeCat?.agencies  || [];
  const benchmark   = activeCat?.benchmark;

  const chartData = agencies.map(a => ({
    ...a,
    short_name: a.agency_name.length > 24 ? a.agency_name.slice(0, 24) + '…' : a.agency_name,
  }));

  const barColor = (tier) =>
    tier === 'OUTLIER' ? '#ef4444' : tier === 'ELEVATED' ? '#f59e0b' : '#10b981';

  const totalOutliers  = categories.reduce((s, c) => s + c.outlier_count,  0);
  const totalElevated  = categories.reduce((s, c) => s + c.elevated_count, 0);
  const totalAgencies  = categories.reduce((s, c) => s + c.total_agencies,  0);

  return (
    <div className="min-h-screen bg-[#020406] text-slate-100 flex flex-col relative">
      {/* Atmospheric orbs */}
      <div
        className="fixed top-0 left-1/4 w-[28rem] h-[28rem] rounded-full blur-[160px] pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(110,255,200,0.09) 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-1/3 right-1/4 w-[36rem] h-[36rem] rounded-full blur-[180px] pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)' }}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-xl border-b border-emerald-500/30 shadow-2xl shadow-black/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-black hidden sm:inline">Back to Dashboard</span>
              </button>
              <div className="w-px h-8 bg-emerald-500/20" />
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-xl text-emerald-300 tracking-tight">
                    Cross-Agency Peer Comparison
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-bold">
                  Systemic Outlier Detection — Category-Grouped Peer Benchmarking Engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalOutliers > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-black animate-pulse">
                  {totalOutliers} OUTLIER{totalOutliers !== 1 ? 'S' : ''} DETECTED
                </span>
              )}
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                <Shield className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center animate-spin">
              <Activity className="w-7 h-7 text-emerald-300" />
            </div>
            <p className="font-black text-white">Grouping agencies by work category…</p>
            <p className="text-xs text-slate-400 font-mono">
              Peer median • IQR fence • Outlier threshold computation
            </p>
          </div>
        ) : (
          <>
            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Layers,        label: 'Work Categories',   value: categories.length, color: 'text-emerald-400' },
                { icon: Users,         label: 'Total Agencies',     value: totalAgencies,     color: 'text-emerald-300' },
                { icon: AlertTriangle, label: 'Outlier Agencies',   value: totalOutliers,     color: 'text-red-400'     },
                { icon: TrendingUp,    label: 'Elevated Agencies',  value: totalElevated,     color: 'text-amber-400'   },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 space-y-1 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{label}</span>
                  </div>
                  <div className={`text-3xl font-black ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* ── Two-Panel Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

              {/* Left: Category Selector */}
              <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-emerald-900/60 bg-emerald-950/20">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">
                      Work Categories
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {categories.map((cat) => {
                    const isActive    = selectedCategory === cat.category;
                    const hasOutliers = cat.outlier_count > 0;
                    return (
                      <button
                        key={cat.category}
                        onClick={() => { setSelectedCategory(cat.category); setExpandedAgency(null); }}
                        className={`w-full text-left px-4 py-3.5 border-b border-slate-800/60 transition-all cursor-pointer flex flex-col gap-1
                          ${isActive
                            ? 'bg-emerald-950/50 border-l-[3px] border-l-emerald-400'
                            : 'hover:bg-slate-900/60 border-l-[3px] border-l-transparent'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {cat.category}
                          </span>
                          {hasOutliers && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black">
                              {cat.outlier_count} OUT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                          <span>{cat.total_agencies} agencies</span>
                          <span>•</span>
                          <span>{cat.works_count} works</span>
                        </div>
                        <div className="text-[10px] text-emerald-500 font-mono font-bold">
                          Peer median: {formatINR(cat.peer_median_inr)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Charts + Table */}
              <div className="space-y-6">

                {/* Benchmark Info Bar */}
                {benchmark && (
                  <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl px-5 py-4 flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-sm font-black text-emerald-300">{selectedCategory}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold">
                        {benchmark.works_count} works across {benchmark.total_agencies} agencies
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {[
                        { label: 'Peer Median',          value: formatINR(benchmark.peer_median_inr),       color: 'text-emerald-400' },
                        { label: 'Outlier Threshold (2×)',value: formatINR(benchmark.outlier_threshold_inr), color: 'text-amber-400'   },
                        { label: 'Outliers',              value: benchmark.outlier_count,                    color: 'text-red-400'     },
                        { label: 'Total Spend',           value: formatINR(benchmark.total_spend_inr),       color: 'text-white'       },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                          <div className={`font-black ${color}`}>{value}</div>
                          <div className="text-slate-500 font-bold text-[10px]">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Horizontal Bar Chart */}
                {chartData.length > 0 && (
                  <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                        Agency Median Cost Ranking
                      </span>
                      <span className="ml-auto text-[10px] text-slate-500 font-bold hidden sm:inline">
                        Green dashed = peer median · Red dashed = 2× outlier threshold
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 44)}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0d2418" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: '#6ee7b7', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={v => formatINR(v)}
                          stroke="#1a3a2a"
                        />
                        <YAxis
                          type="category"
                          dataKey="short_name"
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          width={170}
                          stroke="transparent"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.06)' }} />
                        <ReferenceLine
                          x={benchmark?.peer_median_inr || 0}
                          stroke="#10b981"
                          strokeDasharray="6 3"
                          strokeWidth={2}
                          label={{ value: 'Peer Median', position: 'insideTopRight', fill: '#10b981', fontSize: 9, fontWeight: 700 }}
                        />
                        <ReferenceLine
                          x={benchmark?.outlier_threshold_inr || 0}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{ value: '2× Outlier', position: 'insideTopRight', fill: '#ef4444', fontSize: 9, fontWeight: 700 }}
                        />
                        <Bar dataKey="median_cost_inr" radius={[0, 6, 6, 0]} maxBarSize={26}>
                          {chartData.map((entry, idx) => (
                            <Cell key={idx} fill={barColor(entry.outlier_tier)} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-5 text-[10px] font-bold flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-500 inline-block" />
                        Outlier (≥ 2× median)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                        Elevated (≥ 1.5× median)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                        Normal
                      </span>
                    </div>
                  </div>
                )}

                {/* Agency Leaderboard */}
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-emerald-900/60 bg-emerald-950/20 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      Agency Leaderboard — {selectedCategory}
                    </span>
                    <span className="ml-auto text-[10px] text-slate-500 font-bold hidden sm:inline">
                      Ranked by Median Cost ↓ · Click row to expand flagged works
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-emerald-950/30 text-emerald-400 uppercase font-mono text-[10px] border-b border-emerald-900/60 font-black">
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Agency</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Works</th>
                          <th className="py-3 px-4">Median Cost</th>
                          <th className="py-3 px-4 min-w-[200px]">Peer Deviation</th>
                          <th className="py-3 px-4">Avg Risk</th>
                          <th className="py-3 px-4">Ghosts</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-900/30 font-bold">
                        {agencies.map((ag, idx) => {
                          const isOutlier  = ag.outlier_tier === 'OUTLIER';
                          const isExpanded = expandedAgency === ag.agency_name;
                          return (
                            <React.Fragment key={ag.agency_name}>
                              <tr
                                className={`transition-colors cursor-pointer select-none
                                  ${isOutlier
                                    ? 'bg-red-950/10 hover:bg-red-950/20'
                                    : 'hover:bg-emerald-950/10'}
                                  ${isExpanded ? (isOutlier ? 'bg-red-950/20' : 'bg-emerald-950/10') : ''}`}
                                onClick={() => setExpandedAgency(isExpanded ? null : ag.agency_name)}
                              >
                                <td className="py-4 px-4 font-mono">
                                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border
                                    ${isOutlier
                                      ? 'bg-red-950/60 border-red-500/40 text-red-400'
                                      : 'bg-slate-900 border-emerald-500/30 text-emerald-400'}`}>
                                    #{idx + 1}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className={`font-black text-sm ${isOutlier ? 'text-red-200' : 'text-white'}`}>
                                    {ag.agency_name}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-slate-300">{ag.district}</div>
                                  <div className="text-[10px] text-slate-500">{ag.state}</div>
                                </td>
                                <td className="py-4 px-4 text-slate-300">{ag.works_count}</td>
                                <td className="py-4 px-4 font-mono">
                                  <span className={`font-black ${isOutlier ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {formatINR(ag.median_cost_inr)}
                                  </span>
                                  <div className="text-[10px] text-slate-500">{formatINR(ag.total_spend_inr)} total</div>
                                </td>
                                <td className="py-4 px-4">
                                  <DeviationBar pct={ag.deviation_pct} />
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`font-mono font-black ${
                                    ag.avg_risk_score >= 70 ? 'text-red-400' :
                                    ag.avg_risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {ag.avg_risk_score}
                                  </span>
                                  <div className="text-[10px] text-slate-500">max {ag.max_risk_score}</div>
                                </td>
                                <td className="py-4 px-4">
                                  {ag.ghost_bill_count > 0
                                    ? <span className="text-red-400 font-black">{ag.ghost_bill_count} 👻</span>
                                    : <span className="text-slate-500">—</span>}
                                </td>
                                <td className="py-4 px-4">
                                  <OutlierBadge tier={ag.outlier_tier} />
                                </td>
                                <td className="py-4 px-4 text-right">
                                  {ag.top_works?.length > 0 && (
                                    <button
                                      onClick={e => { e.stopPropagation(); setExpandedAgency(isExpanded ? null : ag.agency_name); }}
                                      className={`p-1.5 rounded-lg border transition-all cursor-pointer
                                        ${isExpanded
                                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400'}`}
                                      title="View flagged works"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>

                              {/* Expandable Flagged Works Drill-Down */}
                              {isExpanded && ag.top_works?.length > 0 && (
                                <tr className={isOutlier ? 'bg-red-950/10' : 'bg-emerald-950/10'}>
                                  <td colSpan={10} className="px-8 pb-4 pt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                                        Top Flagged Works
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {ag.top_works.map((w, wi) => (
                                        <div
                                          key={wi}
                                          className="flex items-center justify-between gap-4 bg-slate-900/60 rounded-xl px-3 py-2.5 border border-slate-700/60 hover:border-emerald-500/30 transition-all"
                                        >
                                          <span className="text-slate-300 font-bold text-xs truncate flex-1">{w.work_name}</span>
                                          <span className="font-mono font-black text-emerald-400 text-xs whitespace-nowrap">
                                            {formatINR(w.cost_inr)}
                                          </span>
                                          <span className={`font-mono font-black text-xs whitespace-nowrap ${w.risk_score >= 70 ? 'text-red-400' : 'text-amber-400'}`}>
                                            Risk {w.risk_score}
                                          </span>
                                          <span className="text-slate-500 text-[10px] font-bold whitespace-nowrap">{w.year_month}</span>
                                          {w.is_ghost_bill && (
                                            <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black whitespace-nowrap">
                                              👻 GHOST
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                    {agencies.length === 0 && (
                      <div className="py-12 text-center text-slate-500 font-bold text-sm">
                        No agency data for this category.
                      </div>
                    )}
                  </div>
                </div>

                {/* Intelligence Note */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 text-xs text-slate-400 font-bold space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-black text-[11px] uppercase tracking-wider">Intelligence Note</span>
                  </div>
                  <p>
                    An agency is classified as <strong className="text-red-400">OUTLIER</strong> when its
                    median cost across all works in this category is ≥ 2× the category's peer median. This
                    catches <em>systemic overchargers</em> — agencies that look clean transaction-by-transaction
                    but are consistently 2–4× more expensive than every peer doing identical work in the same region.
                  </p>
                  <p>
                    <strong className="text-amber-400">ELEVATED</strong> = 1.5–2× peer median (watch &amp; verify).&nbsp;
                    <strong className="text-emerald-400">NORMAL</strong> = within expected cost band.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
