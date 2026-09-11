import React, { useState, useEffect } from 'react';
import { Shield, GitBranch, ArrowUp, Activity } from 'lucide-react';
import { fetchStats, fetchAnomalies, fetchAgencies } from './api/client';
import UploadSection from './components/UploadSection';
import AnomalyRegistrySection from './components/AnomalyRegistrySection';
import VisualIntelligence from './pages/VisualIntelligence';
import FullRegistryPage from './pages/FullRegistryPage';
import CrossAgencyComparison from './pages/CrossAgencyComparison';
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
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#registry') return 'registry';
    if (hash === '#comparison') return 'comparison';
    return 'dashboard';
  });

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
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#registry') {
        setCurrentView('registry');
      } else if (hash === '#comparison') {
        setCurrentView('comparison');
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateToRegistry = () => {
    window.location.hash = '#registry';
    setCurrentView('registry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToComparison = () => {
    window.location.hash = '#comparison';
    setCurrentView('comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDashboard = () => {
    window.location.hash = '#dashboard';
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInvestigate = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setIsInvestigationOpen(true);
  };

  const handleUploadSuccess = (uploadRes) => {
    loadScoredData();
  };

  return (
    <div className="min-h-screen bg-[#020406] text-slate-100 flex flex-col scroll-smooth relative font-bold">
      {/* Interactive Mouse Ring & Glowing Matrix Green/White Cursor Trail */}
      <CursorTrailRing />

      {/* Atmospheric Background Mint Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[28rem] h-[28rem] rounded-full blur-[160px] pointer-events-none -z-10" style={{background: 'radial-gradient(circle, rgba(110,255,200,0.10) 0%, transparent 70%)'}}></div>
      <div className="fixed bottom-1/3 right-1/4 w-[36rem] h-[36rem] rounded-full blur-[180px] pointer-events-none -z-10" style={{background: 'radial-gradient(circle, rgba(110,255,200,0.08) 0%, transparent 70%)'}}></div>

      {/* Grounded Copilot Investigation Modal */}
      <InvestigationModal
        anomaly={selectedAnomaly}
        isOpen={isInvestigationOpen}
        onClose={() => setIsInvestigationOpen(false)}
      />

      {/* SEPARATE FULL WEBPAGE VIEW FOR COMPLETE REGISTRY OR CROSS-AGENCY COMPARISON */}
      {currentView === 'registry' ? (
        <FullRegistryPage
          anomalies={anomalies}
          onBack={navigateToDashboard}
          onInvestigate={handleInvestigate}
        />
      ) : currentView === 'comparison' ? (
        <CrossAgencyComparison
          onBack={navigateToDashboard}
          onInvestigate={handleInvestigate}
        />
      ) : (
        <>
          {/* MINIMALISTIC STICKY BLACK & BRIGHT GREEN HEADER */}
          <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-emerald-500/30 shadow-2xl shadow-black/80 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-28">
                {/* Brand Logo & Statement */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                    <Shield className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-4xl tracking-tight text-emerald-300">
                        FUNDWATCH
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-400 font-bold mt-0.5">Explainable MPLADS Spending-Anomaly Detection</p>
                  </div>
                </div>

                {/* Right Action: GitHub Repository Link */}
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://github.com/Shyamalan-21/Fundwatch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-900 border border-emerald-400/30 text-emerald-300 hover:bg-slate-800 hover:border-emerald-300 transition-all shadow-sm flex items-center gap-2"
                    title="GitHub Repository"
                  >
                    <GitBranch className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-black hidden sm:inline">GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* DASHBOARD SINGLE PAGE CONTAINER */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 w-full">
            {/* 1. UPLOAD SECTION (CENTER ALIGNED) */}
            <UploadSection
              onUploadSuccess={handleUploadSuccess}
              hasUploaded={hasUploaded}
            />

            {/* LOADING INDICATOR DURING SCORING */}
            {loading && (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center mx-auto animate-spin">
                  <Activity className="w-7 h-7 text-emerald-300" />
                </div>
                <p className="text-base font-black text-white">
                  Ingesting & Scoring Dataset with 4-Dimension Mathematical Engine...
                </p>
                <p className="text-xs text-slate-400 font-mono font-bold">
                  Modified Z-score (S1) • IQR Spread (S2) • Peer Comparison (S3) • Velocity Spikes (S4)
                </p>
              </div>
            )}

            {/* 2 & 3. ANOMALY REGISTRY & 5 DATA VISUALIZATION MAPS (ONLY SHOWN AFTER USER UPLOADS) */}
            {hasUploaded && !loading && (
              <>
                {/* 2. ANOMALY REGISTRY (TOP 5 + SEPARATE WEBPAGE NAVIGATOR) */}
                <div className="animate-fadeIn">
                  <AnomalyRegistrySection
                    anomalies={anomalies}
                    onInvestigate={handleInvestigate}
                    onViewAll={navigateToRegistry}
                    onCrossAgency={navigateToComparison}
                  />
                </div>

                {/* 3. DATA VISUALIZATION SECTION (ALL 5 VISUAL MAPS) */}
                <div id="visualizations" className="space-y-6 pt-4 border-t border-emerald-900/60 animate-fadeIn">
                  <VisualIntelligence onSelectAnomaly={handleInvestigate} />
                </div>
              </>
            )}
          </main>

          {/* 4. FOOTER */}
          <Footer />
        </>
      )}

      {/* Back To Top Floating Action Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black shadow-2xl shadow-emerald-400/40 transition-all cursor-pointer z-30 hover:scale-110 active:scale-95"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
