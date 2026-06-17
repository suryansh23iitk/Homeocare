import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-full">
            <Trash2 size={20} className="text-rose-400" />
          </div>
          <h3 className="font-bold text-slate-100">Delete Patient?</h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          This will permanently erase all records, documents, and visit history for this patient. This cannot be undone.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
