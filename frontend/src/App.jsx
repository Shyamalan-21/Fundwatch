import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, Layers, Database, BarChart3, UploadCloud, GitBranch, ArrowUp, Flame } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  async function loadAppData() {
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
    } catch (err) {
      console.error("Failed to load app data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppData();

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

  const handleUploadSuccess = () => {
    loadAppData();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-rose-600 selection:text-white scroll-smooth relative font-bold">
      {/* Interactive Mouse Ring & Dissipating Red/White Cursor Trail */}
      <CursorTrailRing />

      {/* Atmospheric Background Glow Lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/3 right-1/4 w-[32rem] h-[32rem] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* STICKY RED & WHITE GLASS NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b-2 border-rose-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Statement */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl tracking-tight text-rose-600">
                    FUNDWATCH
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                    MoSPI Problem Statement 10
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-bold">Explainable MPLADS Spending-Anomaly Detection</p>
              </div>
            </div>

            {/* Quick Section Anchor Links */}
            <nav className="hidden md:flex items-center gap-2 bg-rose-50/80 p-1.5 rounded-2xl border-2 border-rose-200 text-xs font-black">
              <a
                href="#upload"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-800 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
              >
                <UploadCloud className="w-4 h-4 text-rose-600" />
                <span>1. Upload Dataset</span>
              </a>
              <a
                href="#registry"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-800 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
              >
                <Flame className="w-4 h-4 text-rose-600" />
                <span>2. Anomaly Registry</span>
              </a>
              <a
                href="#visualizations"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-800 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
              >
                <BarChart3 className="w-4 h-4 text-rose-600" />
                <span>3. Visualizations (5 Maps)</span>
              </a>
            </nav>

            {/* Live Status Badge */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-black font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span>Math Engine Live</span>
              </div>
              <a
                href="https://github.com/Shyamalan-21/Fundwatch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
                title="GitHub Repository"
              >
                <GitBranch className="w-5 h-5 text-rose-600" />
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
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto animate-spin">
              <Activity className="w-7 h-7 text-rose-600" />
            </div>
            <p className="text-base font-black text-slate-900">
              Initializing FundWatch MPLADS Spending Intelligence Engine...
            </p>
          </div>
        ) : (
          <>
            {/* 1. UPLOAD TAB & INGESTION SECTION */}
            <UploadSection onUploadSuccess={handleUploadSuccess} />

            {/* 2. ANOMALY REGISTRY (TOP 5 + SHOW MORE FULL MODAL) */}
            <AnomalyRegistrySection
              anomalies={anomalies}
              onInvestigate={handleInvestigate}
            />

            {/* 3. DATA VISUALIZATION SECTION (ALL 5 VISUAL MAPS) */}
            <div id="visualizations" className="space-y-6 pt-4 border-t-2 border-rose-100">
              <VisualIntelligence onSelectAnomaly={handleInvestigate} />
            </div>
          </>
        )}
      </main>

      {/* 4. FOOTER */}
      <Footer />

      {/* Back To Top Floating Action Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/40 transition-all cursor-pointer z-30 hover:scale-110 active:scale-95"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
