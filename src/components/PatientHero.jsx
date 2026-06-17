import React from 'react';
import { Activity, Phone, Send, Download, Trash2, MapPin } from 'lucide-react';
import { handleWhatsAppAlert, handleGeneratePrescription } from '../utils/helpers';

export default function PatientHero({ patient, onRequestDelete, triggerToast }) {
  const onDownloadPrescription = () => {
    handleGeneratePrescription(patient, () => {
      triggerToast("Prescription generated & downloaded!");
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden shadow-md">
      <div className="absolute right-4 top-4 font-mono font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
        {patient.id}
      </div>

      <div className="space-y-1.5 max-w-[70%]">
        <h3 className="text-xl font-bold text-slate-100">{patient.name}</h3>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Activity size={12} className="text-emerald-400" />
          {patient.gender}, {patient.age} Years Old
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Phone size={12} className="text-emerald-400" />
          {patient.phone}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2">
        <button
          onClick={() => handleWhatsAppAlert(patient)}
          type="button"
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 border border-emerald-500/20 transition-all"
        >
          <Send size={12} /> WhatsApp
        </button>

        <button
          onClick={onDownloadPrescription}
          type="button"
          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 border border-sky-500/20 transition-all"
        >
          <Download size={12} /> RX Note
        </button>

        <button
          onClick={() => onRequestDelete(patient.id)}
          type="button"
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 border border-rose-500/20 transition-all"
        >
          <Trash2 size={12} /> Erase
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-4 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-1.5">
        <MapPin size={14} className="text-slate-500 mt-0.5 shrink-0" />
        <span>{patient.address || "No clinical address listed for this record."}</span>
      </p>
    </div>
  );
}
