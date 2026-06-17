import React from 'react';
import { Search, Plus, User } from 'lucide-react';

export default function Navbar({
  currentTab,
  setCurrentTab,
  patients,
  selectedPatient,
  setSelectedPatient,
  triggerToast,
}) {
  const handleProfileClick = () => {
    if (selectedPatient) {
      setCurrentTab('profile');
      return;
    }

    if (patients.length > 0) {
      setSelectedPatient(patients[0]);
      setCurrentTab('profile');
      return;
    }

    triggerToast('No patients yet — register one first.', 'error');
    setCurrentTab('add');
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800/80 flex justify-around items-center px-6 z-40">
      <button
        onClick={() => {
          setCurrentTab('patients');
          setSelectedPatient(null);
        }}
        type="button"
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          currentTab === 'patients' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Search size={20} />
        <span className="text-[10px] font-semibold">Patients</span>
      </button>

      <button
        onClick={() => setCurrentTab('add')}
        type="button"
        className={`relative -top-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          currentTab === 'add'
            ? 'bg-emerald-400 text-slate-950 rotate-90'
            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
        }`}
      >
        <Plus size={24} />
      </button>

      <button
        onClick={handleProfileClick}
        type="button"
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          currentTab === 'profile' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <User size={20} />
        <span className="text-[10px] font-semibold">Profile Log</span>
      </button>
    </nav>
  );
}
