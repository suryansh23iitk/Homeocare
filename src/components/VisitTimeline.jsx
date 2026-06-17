import React, { useState } from 'react';
import { PlusCircle, Clock } from 'lucide-react';

export default function VisitTimeline({ patient, onAddVisit, triggerToast }) {
  const [newVisitNotes, setNewVisitNotes] = useState('');
  const [newVisitType, setNewVisitType] = useState('Follow-up');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newVisitNotes.trim()) return;

    const newVisitObj = {
      id: `v_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      notes: newVisitNotes,
      type: newVisitType,
    };

    onAddVisit(newVisitObj);
    setNewVisitNotes('');
    triggerToast('Visit record added to timeline!');
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
        Date-wise Timeline &amp; Consultation Log
      </h4>

      {/* Add Visit Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-300">Add Visit Entry</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewVisitType('Follow-up')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                newVisitType === 'Follow-up'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400'
              }`}
            >
              Follow-up
            </button>
            <button
              type="button"
              onClick={() => setNewVisitType('First Visit')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                newVisitType === 'First Visit'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-950 text-slate-400'
              }`}
            >
              First Visit
            </button>
          </div>
        </div>

        <textarea
          rows={2}
          placeholder="Log symptoms, prescription alterations, remedy scale or general improvements..."
          value={newVisitNotes}
          onChange={(e) => setNewVisitNotes(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <button
          type="submit"
          disabled={!newVisitNotes.trim()}
          className="w-full bg-emerald-500 disabled:opacity-50 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs flex justify-center items-center gap-1.5 transition-all"
        >
          <PlusCircle size={14} /> Commit Entry to Timeline
        </button>
      </form>

      {/* Visit List */}
      <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 py-2">
        {patient.visits?.map((visit, index) => (
          <div key={visit.id} className="relative">
            <span
              className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 ${
                index === 0 ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
            ></span>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock size={10} /> {visit.date}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    visit.type === 'First Visit'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {visit.type || 'Consultation'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{visit.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
