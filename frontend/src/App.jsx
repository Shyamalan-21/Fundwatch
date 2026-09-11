import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, Layers, Database, BarChart3, UploadCloud, GitBranch, ArrowUp, Flame, Lock } from 'lucide-react';
import { fetchStats, fetchAnomalies, fetchAgencies } from './api/client';
import UploadSection from './components/UploadSection';
import AnomalyRegistrySection from './components/AnomalyRegistrySection';
import VisualIntelligence from './pages/VisualIntelligence';
import InvestigationModal from './components/InvestigationModal';
import Footer from './components/Footer';
import CursorTrailRing from './components/CursorTrailRing';

export default function App() {
  const [stats, setStats] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  async function loadScoredData() {
    setLoading(true);
    try {
      const [statsData, anomaliesData, agenciesData] = await Promise.all([
        fetchStats(),
        fetchAnomalies(),
        fetchAgencies()
      ]);
      setStats(statsData);
      setAnomalies(anomaliesData || []);
      setAgencies(agenciesData || []);
      setHasUploaded(true);
    } catch (err) {
      console.error("Failed to load scored dataset", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInvestigate = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setIsInvestigationOpen(true);
  };

  const handleUploadSuccess = (uploadRes) => {
    loadScoredData();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black scroll-smooth relative font-bold">
      {/* Interactive Mouse Ring & Glowing Matrix Green/White Cursor Trail */}
      <CursorTrailRing />

      {/* Atmospheric Background Neon Green Lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/3 right-1/4 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      {/* STICKY BLACK & GREEN GLASS NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg shadow-black/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Statement */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl tracking-tight text-emerald-400">
                    FUNDWATCH
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-mono">
                    MoSPI PS10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-bold">Explainable MPLADS Spending-Anomaly Detection</p>
              </div>
            </div>

            {/* Quick Section Anchor Links */}
            <nav className="hidden md:flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-emerald-500/30 text-xs font-black">
              <a
                href="#upload"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-all"
              >
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>1. Upload Dataset</span>
              </a>

              {hasUploaded && (
                <>
                  <a
                    href="#registry"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-all"
                  >
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span>2. Anomaly Registry</span>
                  </a>
                  <a
                    href="#visualizations"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-all"
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>3. Visualizations (5 Maps)</span>
                  </a>
                </>
              )}
            </nav>

            {/* Live Status Badge */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{hasUploaded ? "Engine Active (Scored)" : "Awaiting Document Upload"}</span>
              </div>
              <a
                href="https://github.com/Shyamalan-21/Fundwatch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-slate-800 hover:border-emerald-400 transition-all shadow-sm"
                title="GitHub Repository"
              >
                <GitBranch className="w-5 h-5 text-emerald-400" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Grounded Copilot Investigation Modal */}
      <InvestigationModal
        anomaly={selectedAnomaly}
        isOpen={isInvestigationOpen}
        onClose={() => setIsInvestigationOpen(false)}
      />

      {/* SINGLE PAGE BENTO CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 1. UPLOAD TAB & INGESTION SECTION (ALWAYS VISIBLE FIRST) */}
        <UploadSection
          onUploadSuccess={handleUploadSuccess}
          hasUploaded={hasUploaded}
        />

        {/* LOADING INDICATOR DURING SCORING */}
        {loading && (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mx-auto animate-spin">
              <Activity className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-base font-black text-white">
              Ingesting & Scoring Dataset with 4-Dimension Mathematical Engine...
            </p>
            <p className="text-xs text-slate-400 font-mono font-bold">
              Modified Z-score (S1) • IQR Spread (S2) • Peer Comparison (S3) • Velocity Spikes (S4)
            </p>
          </div>
        )}

        {/* 2 & 3. ANOMALY REGISTRY & 5 DATA VISUALIZATION MAPS (ONLY SHOWN AFTER UPLOAD & REVIEW) */}
        {hasUploaded && !loading && (
          <>
            {/* 2. ANOMALY REGISTRY (TOP 5 + SHOW MORE FULL MODAL) */}
            <div className="animate-fadeIn">
              <AnomalyRegistrySection
                anomalies={anomalies}
                onInvestigate={handleInvestigate}
              />
            </div>

            {/* 3. DATA VISUALIZATION SECTION (ALL 5 VISUAL MAPS) */}
            <div id="visualizations" className="space-y-6 pt-4 border-t border-emerald-900/60 animate-fadeIn">
              <VisualIntelligence onSelectAnomaly={handleInvestigate} />
            </div>
          </>
        )}

        {/* PROMPT NOTICE WHEN NO DOCUMENT IS UPLOADED YET */}
        {!hasUploaded && !loading && (
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">
              Anomaly Registry & Data Visualizations Locked
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-bold">
              Upload a custom <code>.csv</code> / <code>.xlsx</code> file above or click <strong>"Load Sample Dataset"</strong> to automatically unlock the full Anomaly Registry, Grounded Copilot, and 5 Diagnostic Visualization Maps.
            </p>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <Footer />

      {/* Back To Top Floating Action Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl shadow-emerald-500/40 transition-all cursor-pointer z-30 hover:scale-110 active:scale-95"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
