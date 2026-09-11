import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BarChart3 as BarChartIcon, TrendingUp, AlertTriangle, Layers, Building, Flame,
  ShieldCheck, HelpCircle, Filter, Activity, Zap, Calendar, Target, Box, Sparkles, Plus, CheckCircle
} from 'lucide-react';
import {
  fetchHistogram,
  fetchQuadrantScatter,
  fetchCalendarHeatmap,
  fetchRadarProfiler,
  fetchWaterfallMonopoly
} from '../api/client';
import ContourHeatmap3D from '../components/ContourHeatmap3D';

function formatINR(val) {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function VisualIntelligence({ onSelectAnomaly }) {
  const [minRisk, setMinRisk] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyGhostBills, setOnlyGhostBills] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL');

  // Chart data states
  const [histogramData, setHistogramData] = useState({ risk_bins: [], cost_bins: [] });
  const [scatterData, setScatterData] = useState({ points: [], axes: {} });
  const [calendarData, setCalendarData] = useState({ monthly_summary: [], daily_matrix: [], stats: {} });
  const [radarData, setRadarData] = useState({ radar_axes: [], agencies: [] });
  const [waterfallData, setWaterfallData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected agency for Radar Profiler
  const [selectedRadarAgency, setSelectedRadarAgency] = useState('');

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [hist, scatter, cal, radar, waterfall] = await Promise.all([
          fetchHistogram(),
          fetchQuadrantScatter(),
          fetchCalendarHeatmap(),
          fetchRadarProfiler(),
          fetchWaterfallMonopoly()
        ]);
        setHistogramData(hist || { risk_bins: [], cost_bins: [] });
        setScatterData(scatter || { points: [], axes: {} });
        setCalendarData(cal || { monthly_summary: [], daily_matrix: [], stats: {} });
        setRadarData(radar || { radar_axes: [], agencies: [] });
        setWaterfallData(waterfall || []);

        if (radar?.agencies?.length > 1) {
          setSelectedRadarAgency(radar.agencies[1].agency_name);
        }
      } catch (err) {
        console.error("Failed to load visual intelligence charts", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(scatterData.points.map(p => p.category).filter(Boolean));
    return ['ALL', ...set];
  }, [scatterData]);

  const filteredScatterPoints = useMemo(() => {
    return scatterData.points.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchRisk = (p.composite_risk || 0) >= minRisk;
      const matchGhost = onlyGhostBills ? p.is_ghost : true;
      const matchQuad = selectedQuadrant === 'ALL' || p.quadrant === selectedQuadrant;
      return matchCat && matchRisk && matchGhost && matchQuad;
    });
  }, [scatterData, selectedCategory, minRisk, onlyGhostBills, selectedQuadrant]);

  const formattedRadarData = useMemo(() => {
    if (!radarData.radar_axes || !radarData.agencies) return [];

    const baseline = radarData.agencies.find(a => a.agency_name.includes("Benchmark")) || radarData.agencies[0];
    const target = radarData.agencies.find(a => a.agency_name === selectedRadarAgency) || radarData.agencies[1];

    if (!baseline || !target) return [];

    return [
      { metric: "S1 (Cost Outlier)", baseline: baseline.s1_score || 15, agency: target.s1_score || 0, fullMark: 100 },
      { metric: "S2 (IQR Fence)", baseline: baseline.s2_score || 12, agency: target.s2_score || 0, fullMark: 100 },
      { metric: "S3 (Peer Ratio)", baseline: baseline.s3_score || 18, agency: target.s3_score || 0, fullMark: 100 },
      { metric: "S4 (Velocity & Ghost)", baseline: baseline.s4_score || 10, agency: target.s4_score || 0, fullMark: 100 },
      { metric: "Composite Risk", baseline: baseline.composite_risk || 14.5, agency: target.composite_risk || 0, fullMark: 100 }
    ];
  }, [radarData, selectedRadarAgency]);

  return (
    <div className="space-y-8 font-bold">
      {/* Visual Intelligence Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
              STEP 3: VISUAL INTELLIGENCE
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-black">
              5 Core Diagnostic Maps
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            Visual Fraud & Anomaly Intelligence Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-bold">
            Multivariate diagnostics: Histograms, 4-Quadrant Cartesian Crosshairs (+X, -X, +Y, -Y), Temporal Calendar Heatmaps & 3D Contour Surfaces
          </p>
        </div>

        {/* Global Controls Filter Pill */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 shadow-sm font-bold">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Filter Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-0.5">
              <span>MIN RISK</span>
              <span className="font-mono text-emerald-400 font-black">{minRisk}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="85"
              step="5"
              value={minRisk}
              onChange={(e) => setMinRisk(Number(e.target.value))}
              className="accent-emerald-400 h-1.5 bg-slate-800 rounded w-24 cursor-pointer"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setOnlyGhostBills(!onlyGhostBills)}
              className={`px-4 py-1.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                onlyGhostBills
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-950 border-emerald-500/40 text-emerald-400 hover:bg-slate-900'
              }`}
            >
              {onlyGhostBills ? "Ghost Bills Only (≤3d)" : "Highlight Ghost Bills"}
            </button>
          </div>
        </div>
      </div>

      {/* BENTO KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bento-card !p-5 relative overflow-hidden border-emerald-500/30">
          <div className="text-[11px] text-slate-400 uppercase font-black">March Fiscal Surge Ratio</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {calendarData.stats?.march_dumping_ratio || '3.4'}×
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">vs annual baseline monthly spend</div>
        </div>
        <div className="bento-card !p-5 relative overflow-hidden border-emerald-500/30">
          <div className="text-[11px] text-slate-400 uppercase font-black">Total Fiscal Outliers</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {calendarData.stats?.total_fiscal_anomalies || '142'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Flagged with CRS ≥ 70</div>
        </div>
        <div className="bento-card !p-5 relative overflow-hidden border-emerald-500/30">
          <div className="text-[11px] text-slate-400 uppercase font-black">Cartel & Ghost Quadrant (Q1)</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {scatterData.points.filter(p => p.quadrant === 'Q1_CRITICAL').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">High Cost + Hyper Velocity</div>
        </div>
        <div className="bento-card !p-5 relative overflow-hidden border-emerald-500/30">
          <div className="text-[11px] text-slate-400 uppercase font-black">Monopoly Concentration</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {waterfallData[0]?.share_pct || '34.2'}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Captured by single contractor</div>
        </div>
      </div>

      {/* SECTION 1: HISTOGRAM (DISTRIBUTION OF RISK SCORES & COST BRACKETS) */}
      <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                CHART 1: HISTOGRAM
              </span>
              <span className="text-xs text-slate-400 font-bold">Risk Score & Expenditure Distribution</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-emerald-400" />
              Composite Risk Score Frequency Histogram
            </h3>
          </div>
          <div className="text-xs text-slate-400 font-bold">
            Binned separation: Safe ($0-40$) vs Critical Anomalies ($75-100$)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Frequency Bars */}
          <div className="lg:col-span-2 h-72 bg-slate-950 p-3 rounded-2xl border border-emerald-500/20 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData.risk_bins} margin={{ top: 15, right: 15, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                <XAxis dataKey="bin" stroke="#10b981" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis stroke="#10b981" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border-2 border-emerald-500/50 p-3 rounded-2xl shadow-xl text-xs space-y-1 font-bold">
                          <div className="font-black text-emerald-400 text-sm">{d.bin}</div>
                          <div className="text-slate-300">Total Projects: <strong className="text-emerald-400 font-black">{d.count}</strong></div>
                          <div className="text-slate-300">Total Spend: <strong className="text-emerald-400 font-black">{formatINR(d.total_spend_inr)}</strong></div>
                          {d.ghost_count > 0 && (
                            <div className="text-emerald-300 font-black">🚨 Ghost Bills (≤3d): {d.ghost_count}</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {histogramData.risk_bins.map((entry, index) => {
                    const barColor = index < 2 ? '#047857' : (index < 4 ? '#10b981' : '#00ff66');
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Bracket Anomaly Breakdown */}
          <div className="bg-slate-950/80 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Cost Bracket Risk Breakdown
              </h4>
              <p className="text-[11px] text-slate-400 mb-3 font-bold">
                Normal vs Anomaly count per contract size
              </p>
              <div className="space-y-3">
                {histogramData.cost_bins.map((c, i) => {
                  const pct = c.total_count > 0 ? ((c.anomaly_count / c.total_count) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} className="text-xs space-y-1">
                      <div className="flex justify-between text-slate-200 font-bold">
                        <span>{c.bracket}</span>
                        <span className="font-mono text-emerald-400 font-black">{c.anomaly_count} / {c.total_count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div style={{ width: `${100 - pct}%` }} className="bg-slate-600 h-full"></div>
                        <div style={{ width: `${pct}%` }} className="bg-emerald-500 h-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Normal Baseline</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Flagged Outlier</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 4-QUADRANT CARTESIAN CROSSHAIR SCATTER PLOT (+X, -X, +Y, -Y) */}
      <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                CHART 2: 4-QUADRANT CARTESIAN CROSSHAIR
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-black">
                (+X, -X, +Y, -Y) Axes
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Cost Deviation vs Turnaround Velocity Matrix
            </h3>
            <p className="text-xs text-slate-300 font-bold">
              Crosshair centered at origin (0,0) baseline. Explicitly separates over-budget (+X) vs hyper-velocity (+Y) anomalies.
            </p>
          </div>

          {/* Quadrant Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-emerald-500/30 text-xs font-black">
            <button
              onClick={() => setSelectedQuadrant('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${selectedQuadrant === 'ALL' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              All 4 Quadrants
            </button>
            <button
              onClick={() => setSelectedQuadrant('Q1_CRITICAL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${selectedQuadrant === 'Q1_CRITICAL' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              Q1 (+X, +Y)
            </button>
            <button
              onClick={() => setSelectedQuadrant('Q2_MICRO_SPLIT')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${selectedQuadrant === 'Q2_MICRO_SPLIT' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              Q2 (-X, +Y)
            </button>
            <button
              onClick={() => setSelectedQuadrant('Q3_COMPLIANT')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${selectedQuadrant === 'Q3_COMPLIANT' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              Q3 (-X, -Y)
            </button>
          </div>
        </div>

        {/* Quadrant Banner Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
          <div className="bg-emerald-950/40 border border-emerald-500/50 p-3.5 rounded-2xl shadow-sm">
            <div className="font-black text-emerald-400 flex items-center gap-1">
              <span>Q1 (+X, +Y)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[12px] text-white font-black mt-0.5">Cartel & Ghost Velocity</div>
            <div className="text-[10px] text-slate-400">Extreme Overprice + ≤3d finish</div>
          </div>
          <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-2xl shadow-sm">
            <div className="font-black text-emerald-400">Q2 (-X, +Y)</div>
            <div className="text-[12px] text-white font-black mt-0.5">Rapid Micro-Splitting</div>
            <div className="text-[10px] text-slate-400">Low Cost + Instant Invoicing</div>
          </div>
          <div className="bg-slate-900/90 border border-emerald-500/20 p-3.5 rounded-2xl shadow-sm">
            <div className="font-black text-emerald-400">Q3 (-X, -Y)</div>
            <div className="text-[12px] text-white font-black mt-0.5">Compliant Baseline</div>
            <div className="text-[10px] text-slate-400">Normal Lead Time & Cost</div>
          </div>
          <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-2xl shadow-sm">
            <div className="font-black text-emerald-400">Q4 (+X, -Y)</div>
            <div className="text-[12px] text-white font-black mt-0.5">Stalled Mega-Projects</div>
            <div className="text-[10px] text-slate-400">High Cost + Severe Delays</div>
          </div>
        </div>

        {/* 4-Quadrant Crosshair Scatter Chart */}
        <div className="h-96 relative bg-slate-950 border border-emerald-500/30 rounded-2xl p-3 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 35, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
              
              <XAxis
                type="number"
                dataKey="x"
                name="Cost Deviation"
                unit="%"
                domain={[-100, 350]}
                stroke="#10b981"
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                label={{ value: "← -X (Under-Budget) | +X (Over-Budget vs Peer Median %) →", position: "insideBottom", offset: -20, fill: "#10b981", fontSize: 11, fontWeight: 'bold' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Turnaround Velocity"
                unit="%"
                domain={[-100, 350]}
                stroke="#10b981"
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                label={{ value: "← -Y (Stalled Latency) | +Y (Hyper Velocity Surge %) →", angle: -90, position: "insideLeft", offset: -15, fill: "#10b981", fontSize: 11, fontWeight: 'bold' }}
              />
              <ZAxis type="number" dataKey="composite_risk" range={[50, 300]} />

              {/* BOLD GREEN '+' CROSSHAIR AT ORIGIN (0,0) */}
              <ReferenceLine x={0} stroke="#10b981" strokeWidth={3} strokeDasharray="4 4" label={{ value: "+Y Axis", position: "insideTopLeft", fill: "#10b981", fontSize: 12, fontWeight: 'bold' }} />
              <ReferenceLine y={0} stroke="#10b981" strokeWidth={3} strokeDasharray="4 4" label={{ value: "+X Axis", position: "insideBottomRight", fill: "#10b981", fontSize: 12, fontWeight: 'bold' }} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border-2 border-emerald-500/50 p-4 rounded-2xl shadow-2xl text-xs space-y-1.5 max-w-xs font-bold">
                        <div className="font-black text-emerald-400 text-sm border-b border-emerald-900 pb-1">{d.name || d.id}</div>
                        <div className="text-slate-300">Category: <strong className="text-emerald-400">{d.category}</strong></div>
                        <div className="text-slate-300">Agency: <span className="text-white">{d.agency}</span></div>
                        <div className="text-slate-300">Cost: <strong className="text-emerald-400 font-black">{formatINR(d.cost_inr)}</strong> ({d.x_dev_pct > 0 ? `+${d.x_dev_pct}%` : `${d.x_dev_pct}%`})</div>
                        <div className="text-slate-300">Execution: <strong className="text-white">{d.delta_days} days</strong></div>
                        <div className="flex items-center justify-between pt-1 border-t border-emerald-900">
                          <span className="font-black text-slate-300">Risk Score:</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-mono font-black text-xs shadow-sm">
                            {d.composite_risk.toFixed(1)} / 100
                          </span>
                        </div>
                        {d.is_ghost && (
                          <div className="text-emerald-300 font-black bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-500/40 text-[11px]">
                            🚨 Zero-Latency Ghost Bill (≤3 Days)
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">{d.quadrant_label}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Scatter name="Projects" data={filteredScatterPoints} cursor="pointer">
                {filteredScatterPoints.map((entry, index) => {
                  let fillColor = entry.is_ghost || entry.quadrant === 'Q1_CRITICAL' ? "#00ff66" : (entry.quadrant === 'Q2_MICRO_SPLIT' ? "#10b981" : "#059669");
                  return (
                    <Cell
                      key={`scatter-cell-${index}`}
                      fill={fillColor}
                      fillOpacity={0.9}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: CALENDAR HEATMAP (TEMPORAL ACTIVITY & MARCH DUMPING MATRIX) */}
      <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                CHART 3: CALENDAR HEATMAP
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-black">
                Fiscal Velocity & Surge Matrix
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Annual Expenditure & Anomaly Intensity Heatmap
            </h3>
            <p className="text-xs text-slate-300 font-bold">
              Interactive 12-Month Calendar Grid. Pinpoints rapid end-of-financial-year (March Madness) fund dumping.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-400">Intensity:</span>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-900"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-700"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-300 shadow-md"></span>
              <span className="text-emerald-400 font-black ml-1">Critical Surge</span>
            </div>
          </div>
        </div>

        {/* Monthly Bar Overview + Daily Activity Heatmap Matrix */}
        <div className="space-y-4">
          {/* Monthly Spend Bar Strip */}
          <div className="h-44 bg-slate-950 p-3 rounded-2xl border border-emerald-500/20 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calendarData.monthly_summary} margin={{ top: 10, right: 15, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                <XAxis dataKey="month" stroke="#10b981" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis stroke="#10b981" tick={{ fontSize: 11, fontWeight: 'bold' }} tickFormatter={(v) => formatINR(v)} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border-2 border-emerald-500/50 p-3 rounded-2xl shadow-xl text-xs space-y-1 font-bold">
                          <div className="font-black text-emerald-400 text-sm">{d.month} Expenditure</div>
                          <div className="text-slate-300">Total Sanctioned: <strong className="text-emerald-400 font-black">{formatINR(d.total_spend_inr)}</strong></div>
                          <div className="text-slate-300">Works Count: <strong className="text-white font-bold">{d.works_count}</strong></div>
                          <div className="text-slate-300">High Risk Anomalies: <strong className="text-emerald-400 font-black">{d.anomaly_count}</strong></div>
                          {d.is_fiscal_surge && (
                            <div className="text-emerald-300 font-black">🔥 Fiscal Surge Spike Month</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total_spend_inr" radius={[8, 8, 0, 0]}>
                  {calendarData.monthly_summary?.map((entry, index) => (
                    <Cell
                      key={`month-cell-${index}`}
                      fill={entry.month === 'Mar' ? '#00ff66' : (entry.anomaly_count >= 3 ? '#10b981' : '#047857')}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Calendar Matrix Grid */}
          <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl overflow-x-auto shadow-sm">
            <div className="text-[11px] font-black text-emerald-400 mb-2 flex items-center justify-between">
              <span>DAILY EXPENDITURE & ANOMALY DENSITY MATRIX</span>
              <span className="text-slate-500 font-mono text-[10px]">Days 1 → 31 (Horizontal) × Months (Vertical)</span>
            </div>
            
            <div className="min-w-[700px] space-y-1.5">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => {
                const monthCells = calendarData.daily_matrix?.filter(d => d.month === m) || [];
                return (
                  <div key={m} className="flex items-center gap-1.5">
                    <span className="w-8 text-[11px] font-mono font-black text-emerald-400">{m}</span>
                    <div className="flex items-center gap-1 flex-1">
                      {Array.from({ length: 31 }, (_, dayIdx) => {
                        const cell = monthCells.find(c => c.day === dayIdx + 1);
                        const lvl = cell?.intensity_level || 0;
                        let bgClass = "bg-slate-900 border-slate-800";
                        if (lvl === 1) bgClass = "bg-emerald-950 border-emerald-900";
                        if (lvl === 2) bgClass = "bg-emerald-800 border-emerald-700";
                        if (lvl === 3) bgClass = "bg-emerald-500 border-emerald-400 shadow-sm";
                        if (lvl === 4) bgClass = "bg-emerald-300 border-white shadow-md";

                        return (
                          <div
                            key={dayIdx}
                            title={`${m} ${dayIdx + 1}: ${cell?.works_count || 0} works, ${formatINR(cell?.total_spend_inr || 0)}`}
                            className={`flex-1 h-4 rounded-[4px] border transition-transform hover:scale-125 cursor-pointer ${bgClass}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: 3D CONTOUR SURFACE ANOMALY TERRAIN (MATPLOTLIB CONTOURF3D STYLE) */}
      <ContourHeatmap3D dataPoints={scatterData.points} />

      {/* SECTION 5: MULTI-SIGNAL RADAR & PARETO WATERFALL MONOPOLY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Profiler */}
        <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                CHART 5A: SPIDER RADAR
              </span>
              <h3 className="text-xl font-black text-emerald-400 mt-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                4-Dimension Multi-Signal Profiler
              </h3>
            </div>
            
            {/* Agency Selector */}
            <select
              value={selectedRadarAgency}
              onChange={(e) => setSelectedRadarAgency(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-bold max-w-[180px] truncate"
            >
              {radarData.agencies?.filter(a => !a.agency_name.includes("Benchmark")).map(a => (
                <option key={a.agency_name} value={a.agency_name}>
                  {a.agency_name} (CRS: {a.composite_risk})
                </option>
              ))}
            </select>
          </div>

          <div className="h-64 bg-slate-950 p-3 rounded-2xl border border-emerald-500/20 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={formattedRadarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#064e3b" />
                <PolarAngleAxis dataKey="metric" stroke="#10b981" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#047857" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <Radar name="State Compliant Benchmark" dataKey="baseline" stroke="#047857" fill="#047857" fillOpacity={0.4} />
                <Radar name={selectedRadarAgency || "Selected Agency"} dataKey="agency" stroke="#00ff66" fill="#00ff66" fillOpacity={0.6} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 'bold' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border-2 border-emerald-500/50 p-3 rounded-2xl shadow-xl text-xs space-y-1 font-bold">
                          <div className="font-black text-emerald-400">{payload[0]?.payload?.metric}</div>
                          <div className="text-slate-400">Benchmark: {payload[0]?.payload?.baseline} / 100</div>
                          <div className="text-emerald-400 font-black">{selectedRadarAgency}: {payload[0]?.payload?.agency} / 100</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pareto Waterfall Monopoly */}
        <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
          <div className="border-b border-emerald-900/60 pb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
              CHART 5B: PARETO WATERFALL
            </span>
            <h3 className="text-xl font-black text-emerald-400 mt-2 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              Contractor Monopoly & Cumulative Risk
            </h3>
            <p className="text-xs text-slate-300 font-bold">
              Cumulative fund share vs high-risk anomalies concentrated in top agencies
            </p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
            {waterfallData.map((a, i) => (
              <div key={i} className="bg-slate-950 border border-emerald-500/20 p-3 rounded-2xl text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white truncate max-w-[220px]">
                    #{i + 1} {a.agency_name}
                  </span>
                  <span className="font-mono font-black text-emerald-400">{formatINR(a.spend_inr)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>Single Share: <strong className="text-white">{a.share_pct}%</strong></span>
                  <span>Cumulative Pareto: <strong className="text-emerald-400 font-black">{a.cumulative_share_pct}%</strong></span>
                  {a.anomaly_count > 0 && (
                    <span className="text-emerald-400 font-black">🚨 {a.anomaly_count} Anomalies</span>
                  )}
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div style={{ width: `${a.cumulative_share_pct}%` }} className="bg-gradient-to-r from-emerald-600 to-emerald-300 h-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
