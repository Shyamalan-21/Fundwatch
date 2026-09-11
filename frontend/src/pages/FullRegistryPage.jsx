import React, { useState, useMemo, useEffect } from 'react';
import { Shield, ArrowLeft, Search, Filter, Sparkles, Download, Flame, AlertTriangle, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { fetchAnomalies } from '../api/client';

function formatINR(val) {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function FullRegistryPage({ anomalies: initialAnomalies = [], onBack, onInvestigate }) {
  const [localAnomalies, setLocalAnomalies] = useState(initialAnomalies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('risk_score_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (initialAnomalies && initialAnomalies.length > 0) {
      setLocalAnomalies(initialAnomalies);
    } else {
      fetchAnomalies().then(data => {
        if (data && data.length > 0) setLocalAnomalies(data);
      }).catch(err => console.error(err));
    }
  }, [initialAnomalies]);

  const anomalies = localAnomalies;

  const states = useMemo(() => {
    return ['ALL', ...new Set(anomalies.map(a => a.state).filter(Boolean))];
  }, [anomalies]);

  // Filtered and sorted anomalies
  const processedAnomalies = useMemo(() => {
    let list = anomalies.filter(a => {
      const matchSearch =
        !searchTerm ||
        a.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.anomaly_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.trigger_reason?.toLowerCase().includes(searchTerm.toLowerCase());

      const score = Number(a.risk_score || 0);
      const matchScore = score >= minScore;
      const matchState = selectedState === 'ALL' || a.state?.toLowerCase() === selectedState.toLowerCase();

      let matchTier = true;
      if (selectedTier === 'CRITICAL') matchTier = score >= 80;
      else if (selectedTier === 'HIGH') matchTier = score >= 65 && score < 80;
      else if (selectedTier === 'MODERATE') matchTier = score >= 40 && score < 65;

      return matchSearch && matchScore && matchState && matchTier;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'risk_score_desc') return (b.risk_score || 0) - (a.risk_score || 0);
      if (sortBy === 'risk_score_asc') return (a.risk_score || 0) - (b.risk_score || 0);
      if (sortBy === 'amount_desc') return (b.monthly_amount || 0) - (a.monthly_amount || 0);
      if (sortBy === 'amount_asc') return (a.monthly_amount || 0) - (b.monthly_amount || 0);
      if (sortBy === 'z_score_desc') return (b.mod_z_score || 0) - (a.mod_z_score || 0);
      return 0;
    });

    return list;
  }, [anomalies, searchTerm, selectedState, selectedTier, minScore, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedAnomalies.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedAnomalies.slice(start, start + pageSize);
  }, [processedAnomalies, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (!processedAnomalies.length) return;
    const headers = ["Rank,Anomaly ID,Agency Name,State,District,Year Month,Disbursed INR,Risk Score,Risk Tier,Mod Z-Score,Peer Ratio,Velocity Ratio,Ghost Bill,Flag Reason\n"];
    const rows = processedAnomalies.map((a, i) => {
      return `"${i + 1}","${a.anomaly_id || ''}","${(a.agency_name || '').replace(/"/g, '""')}","${a.state || ''}","${a.district || ''}","${a.year_month || ''}","${a.monthly_amount || 0}","${a.risk_score || 0}","${a.risk_tier || ''}","${a.mod_z_score || 0}","${a.peer_cost_ratio || 1}","${a.velocity_spike_ratio || 1}","${a.is_ghost_bill ? 'YES' : 'NO'}","${(a.trigger_reason || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fundwatch_complete_anomaly_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#030507] text-slate-100 flex flex-col font-bold">
      {/* Top Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-xl border-b border-emerald-500/30 shadow-2xl shadow-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 text-emerald-400 hover:text-white hover:bg-emerald-950 hover:border-emerald-400 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>← Back to Analytics Dashboard</span>
            </button>
            <div className="hidden md:flex items-center gap-2 border-l border-emerald-900/80 pl-4">
              <span className="text-sm font-black text-emerald-300">Complete Anomaly Registry</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-mono">
                {processedAnomalies.length} / {anomalies.length} Records
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/25 hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Stats Overview */}
        <div className="bg-slate-950/90 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black tracking-wider uppercase shadow-md shadow-emerald-500/20">
                  FULL AUDIT REGISTRY
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                  Multi-Dimensional Outlier Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-emerald-300 mt-2 tracking-tight flex items-center gap-3">
                <Flame className="w-8 h-8 text-emerald-400 animate-pulse" />
                Complete MPLADS Spending Anomaly Registry
              </h1>

            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="bg-slate-900 border border-emerald-500/40 p-3.5 rounded-2xl text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase font-black">Total Flagged</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{anomalies.length}</div>
              </div>
              <div className="bg-slate-900 border border-emerald-500/40 p-3.5 rounded-2xl text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase font-black">Critical (≥80)</div>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-0.5">
                  {anomalies.filter(a => (a.risk_score || 0) >= 80).length}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mt-6 pt-6 border-t border-emerald-900/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search agency name, district, state, ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-bold shadow-inner"
              />
            </div>

            {/* State Filter */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-400 font-bold cursor-pointer"
              >
                {states.map(s => (
                  <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
                ))}
              </select>
            </div>

            {/* Risk Tier Filter */}
            <div>
              <select
                value={selectedTier}
                onChange={(e) => { setSelectedTier(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-400 font-bold cursor-pointer"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="CRITICAL">Critical (CRS ≥ 80)</option>
                <option value="HIGH">High Risk (CRS 65 - 79)</option>
                <option value="MODERATE">Moderate (CRS 40 - 64)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-400 font-bold cursor-pointer"
              >
                <option value="risk_score_desc">Sort: Risk Score (High → Low)</option>
                <option value="risk_score_asc">Sort: Risk Score (Low → High)</option>
                <option value="amount_desc">Sort: Amount (High → Low)</option>
                <option value="amount_asc">Sort: Amount (Low → High)</option>
                <option value="z_score_desc">Sort: Z-Score Outlier</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter: Min Score Slider & Page Size */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-emerald-500/30 flex-1 sm:max-w-md">
              <span className="text-slate-400 whitespace-nowrap text-[11px] font-bold">Min Risk Score:</span>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScore}
                onChange={(e) => { setMinScore(Number(e.target.value)); setCurrentPage(1); }}
                className="accent-emerald-400 h-1.5 bg-slate-800 rounded flex-1 cursor-pointer"
              />
              <span className="font-mono text-emerald-400 font-black text-sm">{minScore}+</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-bold">
              <span>Showing:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-slate-900 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-xs text-emerald-400 font-bold focus:outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={1000}>All Records</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complete Table Bento Container */}
        <div className="bg-slate-950/90 border-2 border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-950/50 text-emerald-300 uppercase font-mono text-[11px] border-b-2 border-emerald-500/30 font-black">
                  <th className="py-4 px-4"># Rank & Score</th>
                  <th className="py-4 px-4">Implementing Agency</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Monthly Disbursed</th>

                  <th className="py-4 px-4 text-right">Investigation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950 font-bold">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <AlertTriangle className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                        <p className="text-white text-sm font-black">No matching anomaly records found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search terms or lowering the minimum risk threshold.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((a, idx) => {
                    const globalRank = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={a.anomaly_id || idx} className="hover:bg-emerald-950/30 transition-colors">
                        {/* Rank & Risk Score */}
                        <td className="py-4 px-4 font-mono">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/40 shadow-sm">
                              #{globalRank}
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

                        {/* Amount */}
                        <td className="py-4 px-4 font-mono">
                          <div className="font-black text-base text-emerald-400">{formatINR(a.monthly_amount)}</div>
                          <div className="text-[10px] text-slate-400 font-bold">
                            {a.velocity_spike_ratio ? `${Number(a.velocity_spike_ratio).toFixed(1)}× velocity` : 'Disbursed'}
                          </div>
                        </td>



                        {/* Investigate Action */}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t-2 border-emerald-500/20 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 font-bold">
                Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, processedAnomalies.length)}</strong> of <strong>{processedAnomalies.length}</strong> records
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-slate-900 border border-emerald-500/40 rounded-xl text-emerald-300 font-mono font-black">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
