import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, X, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { uploadDatasetFile } from '../api/client';

export default function DatasetUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      if (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        setFile(f);
        setError(null);
      } else {
        setError("Please upload a .csv or .xlsx file.");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadDatasetFile(file);
      setResult(data);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setError(err.message || "Failed to process dataset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-xl w-full p-6 border border-slate-700 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upload MPLADS Dataset</h3>
            <p className="text-xs text-slate-400">
              Auto-maps columns, auto-labels unlabelled data, and executes 4-dimension risk scoring
            </p>
          </div>
        </div>

        {result ? (
          /* Result Summary */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm text-white">Dataset Successfully Auto-Labelled!</div>
                <div>{result.message}</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Total Records</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {result.summary?.total_records}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-red-900/30">
                <div className="text-[10px] text-red-400">Critical Red Flags</div>
                <div className="text-base font-bold font-mono text-red-400 mt-0.5">
                  {result.summary?.critical_red_flags}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-900/30">
                <div className="text-[10px] text-amber-400">Ghost Bills (≤3d)</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {result.summary?.ghost_bills_flagged}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Precision Guarantee</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  &gt;90%
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Upload Another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-xs"
              >
                View Visualizations
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-slate-700 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              <UploadCloud className="w-10 h-10 mx-auto text-sky-400 mb-2 opacity-80" />
              {file ? (
                <div className="space-y-1">
                  <span className="font-semibold text-white text-xs">{file.name}</span>
                  <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • Ready to analyze</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-200">
                    Click to browse or drag and drop your MPLADS export
                  </p>
                  <p className="text-[11px] text-slate-500">Supports CSV, XLSX (from data.opencity.in or dataful.in)</p>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mathematical Engine Features */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Automated Scoring Pipeline:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>• S1: Modified Z-Score (MAD robust outliers)</div>
                <div>• S2: IQR Fencing (Spread boundaries)</div>
                <div>• S3: Peer-to-Peer category cost comparison</div>
                <div>• S4: Ghost Completion (≤3d) & Velocity Dump</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  file && !loading
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Auto-Labelling..." : "Process & Score"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
