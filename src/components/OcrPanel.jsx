import React from 'react';
import { Sparkles } from 'lucide-react';

export default function OcrPanel({ ocrScanning, ocrResult, setOcrScanning }) {
  if (!ocrScanning) return null;

  return (
    <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-2 relative shadow-inner animate-fadeIn">
      <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <Sparkles size={12} /> SIMULATED OCR EXTRACT
        </span>
        <button
          onClick={() => setOcrScanning(false)}
          type="button"
          className="text-[10px] text-slate-400 hover:text-slate-100 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 transition-colors"
        >
          Dismiss
        </button>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
        {ocrResult}
      </p>
    </div>
  );
}
