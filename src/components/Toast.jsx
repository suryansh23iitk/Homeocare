import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type }) {
  if (!message) return null;

  return (
    <div
      className={`absolute top-12 left-4 right-4 z-50 py-3 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-bounce ${
        type === 'error'
          ? 'bg-rose-500 text-white'
          : 'bg-emerald-500 text-slate-950'
      }`}
    >
      {type === 'error' ? (
        <AlertTriangle size={18} />
      ) : (
        <CheckCircle size={18} />
      )}
      <span className="font-semibold text-sm">{message}</span>
    </div>
  );
}
