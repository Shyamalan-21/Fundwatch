import React from 'react';
import { Shield, GitBranch, Heart, ExternalLink, Activity, Database, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Ministry Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-sky-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                FUNDWATCH
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                MoSPI PS10
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An Explainable MPLADS Spending-Anomaly Detection & Visual Intelligence System. Designed for the Ministry of Statistics and Programme Implementation (Problem Statement 10).
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Engine Operational
              </span>
              <span>•</span>
              <span>FastAPI + React 19</span>
              <span>•</span>
              <span>Three.js 3D Engine</span>
            </div>
          </div>

          {/* Mathematical Engine Dimensions */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Scoring Dimensions
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400 font-mono">
              <li>• <strong className="text-slate-300">S1:</strong> Modified Z-Score (MAD Baseline)</li>
              <li>• <strong className="text-slate-300">S2:</strong> IQR Extreme Fence Spread</li>
              <li>• <strong className="text-slate-300">S3:</strong> Peer Category & State Ratio</li>
              <li>• <strong className="text-slate-300">S4:</strong> Velocity & Ghost Bill (≤3d)</li>
            </ul>
          </div>

          {/* Repository & Quick Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Project Links
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/Shyamalan-21/Fundwatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <GitBranch className="w-4 h-4 text-sky-400" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Database className="w-4 h-4" />
                  <span>FastAPI Swagger Docs</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-500">
                  Data Sources: Official MPLADS & DataOpenCity
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} FundWatch — Explainable MPLADS Spending-Anomaly Detection System
          </div>
          <div className="flex items-center gap-1">
            Grounded AI Intelligence & Mathematical Integrity Guaranteed
          </div>
        </div>
      </div>
    </footer>
  );
}
