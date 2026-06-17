import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function Header({ currentTab, onBack, onLogout }) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md px-4 py-4 flex justify-between items-center border-b border-slate-800">
      {currentTab === 'profile' ? (
        <button
          onClick={onBack}
          type="button"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 flex items-center gap-1.5 text-sm transition-all"
        >
          <ArrowLeft size={18} /> Back
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            H
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-slate-100">Samuel HomeoCare</h2>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Offline Ready
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={onLogout}
          type="button"
          className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 transition-colors"
          title="Lock Database"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
