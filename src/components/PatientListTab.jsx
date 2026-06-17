import React, { useState } from 'react';
import { Search, User, Phone } from 'lucide-react';

export default function PatientListTab({ patients, setSelectedPatient, setCurrentTab }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.id.toLowerCase().includes(query) ||
      patient.name.toLowerCase().includes(query) ||
      patient.phone.includes(query)
    );
  });

  const totalFollowups = patients.reduce(
    (acc, p) => acc + Math.max(0, (p.visits?.length ?? 0) - 1),
    0
  );

  const totalDocs = patients.reduce((acc, p) => acc + (p.documents?.length ?? 0), 0);

  return (
    <div className="p-4 space-y-4">
      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Patients</p>
          <p className="text-lg font-bold text-slate-200">{patients.length}</p>
        </div>
        <div className="text-center border-x border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Follow-ups</p>
          <p className="text-lg font-bold text-emerald-400">{totalFollowups}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Docs Stored</p>
          <p className="text-lg font-bold text-blue-400">{totalDocs}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search Name, Patient ID, or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          {searchQuery ? `Search Results (${filteredPatients.length})` : "Recent Patient Records"}
        </h3>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
            <User className="mx-auto text-slate-600 mb-2" size={32} />
            <p className="text-slate-400 text-sm">No matched patient profiles</p>
            <p className="text-slate-600 text-xs mt-1">Check spelling or create a new entry</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => {
                setSelectedPatient(patient);
                setCurrentTab("profile");
              }}
              className="bg-slate-900 hover:bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {patient.id}
                  </span>
                  <span className="text-slate-500 text-xs">{patient.createdAt}</span>
                </div>
                <h4 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                  {patient.name}
                </h4>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{patient.gender}, {patient.age} Yrs</span>
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {patient.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                <span className="text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">
                  {patient.visits?.length ?? 0} Vis
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
