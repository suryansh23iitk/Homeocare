import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import DeleteModal from './components/DeleteModal';
import PinLockScreen from './components/PinLockScreen';
import PatientListTab from './components/PatientListTab';
import AddPatientTab from './components/AddPatientTab';
import PatientProfileTab from './components/PatientProfileTab';
import { INITIAL_PATIENTS } from './constants/initialData';
import { seedIdCounter, loadPatientsFromStorage, savePatientsToStorage } from './utils/helpers';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('patients');
  const [patients, setPatients] = useState(() => loadPatientsFromStorage(INITIAL_PATIENTS));
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toastTimerRef = useRef(null);

  const triggerToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    seedIdCounter();
  }, []);

  useEffect(() => {
    const saved = savePatientsToStorage(patients);
    if (!saved) {
      triggerToast(
        'Storage limit reached — remove old documents or patients to save new data.',
        'error'
      );
    }
  }, [patients, triggerToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleRegisterPatient = (newPatient) => {
    const updated = [newPatient, ...patients];
    setPatients(updated);
    setSelectedPatient(newPatient);
    triggerToast(`Patient ${newPatient.name} added successfully!`);
    setCurrentTab('profile');
  };

  const handleUploadDocument = (newDoc) => {
    if (!selectedPatient) return;

    const updated = patients.map((p) => {
      if (p.id === selectedPatient.id) {
        return { ...p, documents: [newDoc, ...p.documents] };
      }
      return p;
    });
    setPatients(updated);
    setSelectedPatient((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }));
  };

  const handleAddVisit = (newVisit) => {
    if (!selectedPatient) return;

    const updated = patients.map((p) => {
      if (p.id === selectedPatient.id) {
        return { ...p, visits: [newVisit, ...p.visits] };
      }
      return p;
    });
    setPatients(updated);
    setSelectedPatient((prev) => ({
      ...prev,
      visits: [newVisit, ...prev.visits],
    }));
  };

  const handleConfirmDelete = () => {
    const filtered = patients.filter((p) => p.id !== deleteTarget);
    setPatients(filtered);
    setDeleteTarget(null);
    setSelectedPatient(null);
    setCurrentTab('patients');
    triggerToast('Patient record completely erased.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center items-center font-sans antialiased p-0 sm:p-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-slate-950 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col border border-slate-800 relative">
        <div className="bg-slate-950 px-5 pt-3 pb-1 flex justify-between items-center text-xs text-slate-500 font-mono tracking-wider border-b border-slate-900 select-none">
          <span>CLINIC SECURE ACCESS</span>
          <span>Device-Local Storage</span>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}

        <DeleteModal
          isOpen={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />

        {!isAuthenticated ? (
          <PinLockScreen
            onUnlockSuccess={() => setIsAuthenticated(true)}
            triggerToast={triggerToast}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Header
              currentTab={currentTab}
              onBack={() => {
                setCurrentTab('patients');
                setSelectedPatient(null);
              }}
              onLogout={() => {
                setIsAuthenticated(false);
                triggerToast('Logged out of secure terminal');
              }}
            />

            <div className="flex-1 overflow-y-auto bg-slate-950 pb-20">
              {currentTab === 'patients' && (
                <PatientListTab
                  patients={patients}
                  setSelectedPatient={setSelectedPatient}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === 'add' && (
                <AddPatientTab
                  onRegisterPatient={handleRegisterPatient}
                  triggerToast={triggerToast}
                />
              )}

              {currentTab === 'profile' && selectedPatient && (
                <PatientProfileTab
                  patient={selectedPatient}
                  onUploadDocument={handleUploadDocument}
                  onAddVisit={handleAddVisit}
                  onRequestDelete={(id) => setDeleteTarget(id)}
                  triggerToast={triggerToast}
                />
              )}

              {currentTab === 'profile' && !selectedPatient && (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm font-medium text-slate-400">No patient selected</p>
                  <p className="text-xs mt-2">Choose a patient from the list or register a new one.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('patients')}
                    className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Go to Patients
                  </button>
                </div>
              )}
            </div>

            <Navbar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              patients={patients}
              selectedPatient={selectedPatient}
              setSelectedPatient={setSelectedPatient}
              triggerToast={triggerToast}
            />
          </div>
        )}
      </div>
    </div>
  );
}
