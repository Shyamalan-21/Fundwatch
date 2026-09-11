import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, LineChart, Line, ComposedChart
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
      const matchCat   = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchRisk  = (p.composite_risk || 0) >= minRisk;
      const matchGhost = onlyGhostBills ? p.is_ghost : true;
      const matchQuad  = selectedQuadrant === 'ALL' || p.quadrant === selectedQuadrant;
      // Only show points with positive X and Y (first quadrant)
      const matchPositive = (p.x ?? 0) >= 0 && (p.y ?? 0) >= 0;
      return matchCat && matchRisk && matchGhost && matchQuad && matchPositive;
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
      {/* Visual Intelligence Section Header (CENTER ALIGNED) */}
      <div className="text-center space-y-3 border-b border-emerald-900/40 pb-6 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-black text-emerald-300 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
          Visual Fraud &amp; Anomaly Intelligence Suite
        </h2>
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
                CHART 2: SCATTER MATRIX
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-black">
                +X, +Y Axes
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Cost Deviation vs Turnaround Velocity Matrix
            </h3>
            <p className="text-xs text-slate-300 font-bold">
              Positive-axis view: Over-budget (+X) vs Hyper-velocity turnaround (+Y). Only flagged anomaly zone shown.
            </p>
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
                domain={[0, 350]}
                stroke="#10b981"
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                label={{ value: "+X → Cost Deviation above Peer Median (%)", position: "insideBottom", offset: -20, fill: "#10b981", fontSize: 11, fontWeight: 'bold' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Turnaround Velocity"
                unit="%"
                domain={[0, 350]}
                stroke="#10b981"
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                label={{ value: "+Y → Turnaround Velocity Surge (%)", angle: -90, position: "insideLeft", offset: -15, fill: "#10b981", fontSize: 11, fontWeight: 'bold' }}
              />
              <ZAxis type="number" dataKey="composite_risk" range={[50, 300]} />

              {/* No crosshair needed — axis origin is at 0,0 */}

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
                  // Color by risk: red ≥70, amber ≥50, bright green otherwise
                  const risk = entry.composite_risk || 0;
                  const fillColor = risk >= 70
                    ? '#ef4444'
                    : risk >= 50
                    ? '#f59e0b'
                    : '#10b981';
                  const strokeColor = risk >= 70 ? '#ff6666' : risk >= 50 ? '#fbbf24' : '#ffffff';
                  return (
                    <Cell
                      key={`scatter-cell-${index}`}
                      fill={fillColor}
                      fillOpacity={0.92}
                      stroke={strokeColor}
                      strokeWidth={risk >= 70 ? 2.5 : 1.5}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: MONTHLY SPEND & ANOMALY TREND (AREA + LINE) */}
      <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                CHART 3: MONTHLY TREND
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-black">
                Spend &amp; Anomaly Line
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Monthly Expenditure &amp; Anomaly Count Trend
            </h3>
            <p className="text-xs text-slate-300 font-bold">
              12-month spend area (emerald) overlaid with high-risk anomaly count (red line). Spikes reveal fiscal-year-end dumping.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-[3px] bg-emerald-500 inline-block rounded" />
              Monthly Spend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-[3px] bg-red-500 inline-block rounded" />
              Anomaly Count
            </span>
          </div>
        </div>

        <div className="h-72 bg-slate-950 p-3 rounded-2xl border border-emerald-500/20 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={calendarData.monthly_summary} margin={{ top: 16, right: 40, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#10b981"
                tick={{ fontSize: 11, fontWeight: 'bold', fill: '#6ee7b7' }}
              />
              {/* Left Y — spend */}
              <YAxis
                yAxisId="spend"
                orientation="left"
                stroke="#10b981"
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#6ee7b7' }}
                tickFormatter={v => formatINR(v)}
                width={60}
              />
              {/* Right Y — anomaly count */}
              <YAxis
                yAxisId="anom"
                orientation="right"
                stroke="#ef4444"
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#f87171' }}
                width={35}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-slate-950 border-2 border-emerald-500/50 p-3 rounded-2xl shadow-xl text-xs space-y-1 font-bold">
                      <div className="font-black text-emerald-400 text-sm">{d?.month}</div>
                      <div className="text-slate-300">Total Spend: <strong className="text-emerald-400 font-black">{formatINR(d?.total_spend_inr)}</strong></div>
                      <div className="text-slate-300">Works: <strong className="text-white">{d?.works_count}</strong></div>
                      <div className="text-slate-300">Anomalies: <strong className="text-red-400 font-black">{d?.anomaly_count}</strong></div>
                      {d?.is_fiscal_surge && (
                        <div className="text-emerald-300 font-black">🔥 Fiscal Surge Month</div>
                      )}
                    </div>
                  );
                }}
              />
              {/* Spend — filled area */}
              <Area
                yAxisId="spend"
                type="monotone"
                dataKey="total_spend_inr"
                name="Monthly Spend"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#spendGradient)"
                dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#00ff88', strokeWidth: 0 }}
              />
              {/* Anomaly count — red line */}
              <Line
                yAxisId="anom"
                type="monotone"
                dataKey="anomaly_count"
                name="Anomaly Count"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.month}
                      cx={cx}
                      cy={cy}
                      r={payload.anomaly_count >= 10 ? 7 : 4}
                      fill={payload.is_fiscal_surge ? '#ff0000' : '#ef4444'}
                      stroke={payload.is_fiscal_surge ? '#fff' : 'transparent'}
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: '#ff4444', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* KPI strip below the chart */}
        <div className="grid grid-cols-3 gap-3 text-xs font-bold">
          {[
            {
              label: 'Peak Spend Month',
              value: calendarData.monthly_summary?.length
                ? calendarData.monthly_summary.reduce((a, b) => a.total_spend_inr > b.total_spend_inr ? a : b, {}).month ?? '—'
                : '—',
              color: 'text-emerald-400',
            },
            {
              label: 'Peak Anomaly Month',
              value: calendarData.monthly_summary?.length
                ? calendarData.monthly_summary.reduce((a, b) => a.anomaly_count > b.anomaly_count ? a : b, {}).month ?? '—'
                : '—',
              color: 'text-red-400',
            },
            {
              label: 'Total Anomalies',
              value: calendarData.stats?.total_fiscal_anomalies ?? 0,
              color: 'text-amber-400',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-3">
              <div className="text-slate-400 font-black uppercase text-[10px] tracking-wider">{label}</div>
              <div className={`text-2xl font-black mt-0.5 ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: 3D CONTOUR SURFACE ANOMALY TERRAIN (MATPLOTLIB CONTOURF3D STYLE) */}
      <ContourHeatmap3D dataPoints={scatterData.points} />

      {/* SECTION 5: MULTI-SIGNAL RADAR & PARETO WATERFALL MONOPOLY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agency Risk Score Horizontal Bar Chart */}
        <div className="bento-card space-y-4 relative overflow-hidden border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                CHART 5A: AGENCY RISK RANKING
              </span>
              <h3 className="text-xl font-black text-emerald-400 mt-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Agency Composite Risk Score Ranking
              </h3>
              <p className="text-xs text-slate-300 font-bold mt-0.5">Ranked high → low. Red = Critical (≥70), Amber = Elevated (≥50).</p>
            </div>
          </div>

          <div className="h-64 bg-slate-950 p-3 rounded-2xl border border-emerald-500/20 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...( radarData.agencies || [])]
                  .filter(a => !a.agency_name.includes('Benchmark'))
                  .sort((a, b) => b.composite_risk - a.composite_risk)
                  .slice(0, 8)
                  .map(a => ({
                    name: a.agency_name.length > 22 ? a.agency_name.slice(0, 22) + '…' : a.agency_name,
                    risk: a.composite_risk,
                    full_name: a.agency_name,
                  }))}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#0d2418" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#10b981"
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#6ee7b7' }}
                  tickFormatter={v => `${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  width={150}
                  stroke="transparent"
                />
                <ReferenceLine x={70} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: 'Critical', position: 'insideTopRight', fill: '#ef4444', fontSize: 9, fontWeight: 700 }} />
                <ReferenceLine x={50} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: 'Elevated', position: 'insideTopRight', fill: '#f59e0b', fontSize: 9, fontWeight: 700 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3 text-xs shadow-2xl">
                        <p className="font-black text-white mb-1">{d.full_name}</p>
                        <p className={`font-black ${
                          d.risk >= 70 ? 'text-red-400' : d.risk >= 50 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>Risk Score: {d.risk} / 100</p>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'rgba(16,185,129,0.06)' }}
                />
                <Bar dataKey="risk" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {[...( radarData.agencies || [])]
                    .filter(a => !a.agency_name.includes('Benchmark'))
                    .sort((a, b) => b.composite_risk - a.composite_risk)
                    .slice(0, 8)
                    .map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.composite_risk >= 70 ? '#ef4444' : entry.composite_risk >= 50 ? '#f59e0b' : '#10b981'}
                        fillOpacity={0.88}
                      />
                    ))}
                </Bar>
              </BarChart>
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
