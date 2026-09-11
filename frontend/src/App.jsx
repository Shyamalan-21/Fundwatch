import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, Layers, Database, BarChart3, UploadCloud, GitBranch, ArrowUp } from 'lucide-react';
import { fetchStats, fetchAnomalies, fetchAgencies } from './api/client';
import UploadSection from './components/UploadSection';
import AnomalyRegistrySection from './components/AnomalyRegistrySection';
import VisualIntelligence from './pages/VisualIntelligence';
import InvestigationModal from './components/InvestigationModal';
import Footer from './components/Footer';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white scroll-smooth">
      {/* STICKY SINGLE-PAGE NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Statement */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text">
                    FUNDWATCH
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                    MoSPI Problem Statement 10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Explainable MPLADS Spending-Anomaly Detection</p>
              </div>
            </div>

            {/* Quick Section Anchor Links */}
            <nav className="hidden md:flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <a
                href="#upload"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Upload Dataset</span>
              </a>
              <a
                href="#registry"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>2. Anomaly Registry</span>
              </a>
              <a
                href="#visualizations"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Data Visualizations (5 Maps)</span>
              </a>
            </nav>

            {/* Live Status Badge */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>4-Signal Math Engine Live</span>
              </div>
              <a
                href="https://github.com/Shyamalan-21/Fundwatch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                title="GitHub Repository"
              >
                <GitBranch className="w-4 h-4 text-sky-400" />
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

      {/* SINGLE PAGE MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto animate-spin">
              <Activity className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">
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
            <div id="visualizations" className="space-y-6 pt-4 border-t border-slate-800/80">
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
          className="fixed bottom-6 right-6 p-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-xl shadow-sky-500/30 transition-all cursor-pointer z-30"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
