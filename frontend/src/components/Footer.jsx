import React from 'react';
import { Shield, GitBranch, Heart, ExternalLink, Activity, Database, Sparkles, Flame } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/90 border-t-2 border-rose-200 mt-20 text-slate-700 text-xs font-bold backdrop-blur-xl shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Ministry Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-rose-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-black text-xl text-rose-600 tracking-tight">
                FUNDWATCH
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                MoSPI PS10
              </span>
            </div>
            <p className="text-xs text-slate-700 max-w-md leading-relaxed font-bold">
              An Explainable MPLADS Spending-Anomaly Detection & Visual Intelligence System. Built with 4-Dimension Mathematical Risk Scoring for the Ministry of Statistics and Programme Implementation.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono font-bold pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Mathematical Engine Live
              </span>
              <span>•</span>
              <span>FastAPI + React 19</span>
              <span>•</span>
              <span>Three.js 3D WebGL</span>
            </div>
          </div>

          {/* Mathematical Engine Dimensions */}
          <div className="space-y-2.5">
            <div className="text-xs font-black text-rose-600 uppercase tracking-wider font-mono">
              Scoring Dimensions
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-700 font-mono font-bold">
              <li>• <strong className="text-rose-600">S1:</strong> Modified Z-Score (MAD Baseline)</li>
              <li>• <strong className="text-rose-600">S2:</strong> IQR Extreme Fence Spread</li>
              <li>• <strong className="text-rose-600">S3:</strong> Peer Category & State Ratio</li>
              <li>• <strong className="text-rose-600">S4:</strong> Velocity & Ghost Bill (≤3d)</li>
            </ul>
          </div>

          {/* Repository & Quick Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-black text-rose-600 uppercase tracking-wider font-mono">
              Project Links
            </div>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <a
                  href="https://github.com/Shyamalan-21/Fundwatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-600 transition-colors flex items-center gap-1.5 text-slate-900"
                >
                  <GitBranch className="w-4 h-4 text-rose-600" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-600 transition-colors flex items-center gap-1.5 text-slate-900"
                >
                  <Database className="w-4 h-4 text-rose-600" />
                  <span>FastAPI Swagger Docs</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 font-bold">
                  Data Sources: Official MPLADS & DataOpenCity
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-6 border-t-2 border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-bold">
          <div>
            © {new Date().getFullYear()} FundWatch — Explainable MPLADS Spending-Anomaly Detection System
          </div>
          <div className="flex items-center gap-1 text-rose-600 font-black">
            Grounded AI Intelligence & Mathematical Precision Certified
          </div>
        </div>
      </div>
    </footer>
  );
}
