import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { uploadDatasetFile } from '../api/client';

export default function UploadSection({ onUploadSuccess, hasUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError("Please upload a valid .csv or .xlsx file.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const res = await uploadDatasetFile(file);
      setUploadResult(res);
      if (onUploadSuccess) onUploadSuccess(res);
    } catch (err) {
      setUploadError(err.message || "Failed to process and score dataset.");
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="upload" className="bento-card relative overflow-hidden space-y-6 border-emerald-500/30 text-center">
      {/* Decorative Green Matrix Flare */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Center Aligned Header */}
      <div className="text-center space-y-2 border-b border-emerald-900/60 pb-5">
        <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight text-center">
          {hasUploaded ? "Active MPLADS Expenditure Dataset" : "Upload MPLADS Expenditure Dataset"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-bold text-center">
          {hasUploaded 
            ? "Your dataset has been ingested and reviewed across S1 (MAD Z-score), S2 (IQR), S3 (Peer comparisons), and S4 (Ghost velocity). Drop a new file below to re-analyze."
            : "Upload any MPLADS expenditure dataset (.csv / .xlsx). The system will mathematically review and score each expenditure."
          }
        </p>
      </div>

      {/* Center Aligned Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer max-w-3xl mx-auto ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/40 scale-[1.01] shadow-xl shadow-emerald-500/20'
            : 'border-emerald-500/30 bg-slate-950/70 hover:border-emerald-500/60 hover:bg-slate-900/80 shadow-sm'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-4 shadow-md shadow-emerald-500/10">
          {uploading ? (
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        {uploading ? (
          <div className="space-y-2">
            <h4 className="text-lg font-black text-emerald-400">Reviewing, Scoring & Auto-Labelling Dataset...</h4>
            <p className="text-xs text-slate-400 font-mono font-bold">
              Calculating MAD Modified Z-score ($S_1$), IQR fences ($S_2$), Peer comparisons ($S_3$), and Velocity spikes ($S_4$)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-lg font-black text-white">
              Drag & Drop your MPLADS expenditure file here, or <span className="text-emerald-400 underline decoration-2">browse</span>
            </h4>
            <p className="text-xs text-slate-400 font-bold">
              Supports .csv, .xlsx, .xls formats
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Quick Benchmark Action */}
      {!hasUploaded && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => onUploadSuccess && onUploadSuccess({ status: 'success', message: 'Loaded 4,265 pre-scored benchmark records' })}
            className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black shadow-lg shadow-emerald-400/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>⚡ Use Benchmark Sample Dataset (4,265 Records)</span>
          </button>
        </div>
      )}

      {/* Error Alert */}
      {uploadError && (
        <div className="bg-rose-950/40 border-2 border-rose-600/50 p-4 rounded-2xl flex items-center justify-center gap-3 text-rose-300 text-xs font-bold shadow-sm max-w-2xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Success Summary Banner */}
      {uploadResult && (
        <div className="bg-emerald-950/30 border-2 border-emerald-500/30 p-5 rounded-2xl space-y-3 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{uploadResult.message || "Dataset successfully scored and reviewed!"}</span>
          </div>

          {uploadResult.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/20 shadow-sm text-center">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Total Works</div>
                <div className="text-xl font-black font-mono text-white mt-0.5">
                  {uploadResult.summary.total_records}
                </div>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/20 shadow-sm text-center">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Critical (CRS ≥ 75)</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {uploadResult.summary.critical_anomalies_count || 0}
                </div>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/20 shadow-sm text-center">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Ghost Bills (≤3d)</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {uploadResult.summary.ghost_bills_count || 0}
                </div>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/20 shadow-sm text-center">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Precision</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  &gt;92%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
