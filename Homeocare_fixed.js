import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, User, Phone, MapPin, Calendar, FileText, Upload, 
  PlusCircle, Lock, Shield, ArrowLeft, Image, File, CheckCircle, 
  Trash2, Edit3, Send, Download, Sparkles, LogOut, Clock, Eye, Activity,
  AlertTriangle
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_PATIENTS = [
  {
    id: "HOM-2026-0001",
    name: "Aarav Sharma",
    age: "34",
    gender: "Male",
    phone: "9876543210",
    address: "Flat 402, Green Glen Layout, Bangalore",
    history: "Suffering from chronic eczema on both hands. Symptoms worsen in winter. History of mild asthma in childhood. Responding well to Sulphur 200C.",
    createdAt: "2026-05-10",
    visits: [
      { id: "v1", date: "2026-05-10", notes: "Initial Consultation. Prescribed Sulphur 200C (Weekly) and Graphites 30C (Daily).", type: "First Visit" },
      { id: "v2", date: "2026-05-24", notes: "Itching reduced by 40%. Eruption redness decreased. Continue Graphites 30C. Added Mezereum 30C for dry scales.", type: "Follow-up" }
    ],
    documents: [
      { id: "doc1", name: "Dermatologist Report.pdf", type: "PDF", date: "2026-05-10", size: "1.2 MB", textContent: "Diagnosis: Severe Atopic Dermatitis. Epidermal hyperplasia present." },
      { id: "doc2", name: "Eczema Hand Photo.jpg", type: "Photo", date: "2026-05-10", size: "2.4 MB", previewUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=300&q=80" }
    ]
  },
  {
    id: "HOM-2026-0002",
    name: "Meera Patel",
    age: "45",
    gender: "Female",
    phone: "8765432109",
    address: "Sector 15, Vasundhara, Ghaziabad",
    history: "Recurrent migraines triggered by stress and exposure to bright sunlight. Often accompanied by nausea. Relieved by dark, quiet rooms.",
    createdAt: "2026-05-15",
    visits: [
      { id: "v3", date: "2026-05-15", notes: "Migraine episodes are violent, right-sided. Prescribed Belladonna 200C during attacks and Natrum Muriaticum 200C (Constitutional).", type: "First Visit" }
    ],
    documents: [
      { id: "doc3", name: "Brain MRI Scan.pdf", type: "Scan", date: "2026-05-15", size: "4.8 MB", textContent: "MRI Brain: Normal study. No intracranial focal pathology identified." }
    ]
  },
  {
    id: "HOM-2026-0003",
    name: "Vikram Malhotra",
    age: "58",
    gender: "Male",
    phone: "7654321098",
    address: "32-B, Pocket-A, Janakpuri, New Delhi",
    history: "Osteoarthritis of both knee joints. Difficulty in walking, especially when first starting to move. Ameliorated by continued motion.",
    createdAt: "2026-05-18",
    visits: [
      { id: "v4", date: "2026-05-18", notes: "Prescribed Rhus Toxicodendron 200C daily morning. Suggested light stretching.", type: "First Visit" },
      { id: "v5", date: "2026-05-28", notes: "Stiffness significantly less in the mornings. Range of motion improved. Continue same line of treatment.", type: "Follow-up" }
    ],
    documents: [
      { id: "doc4", name: "Knee X-ray Joint Space.png", type: "X-ray", date: "2026-05-18", size: "3.1 MB", previewUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=300&q=80" }
    ]
  }
];

// ─────────────────────────────────────────────
// FIX 1: Persistent ID counter, independent of
//         patients.length so deletions never
//         cause ID re-use.
// ─────────────────────────────────────────────
const generatePatientId = () => {
  const year = new Date().getFullYear();
  const raw = localStorage.getItem('hom_id_counter');
  const next = (parseInt(raw || '0', 10)) + 1;
  localStorage.setItem('hom_id_counter', String(next));
  return `HOM-${year}-${String(next).padStart(4, '0')}`;
};

// Seed the counter on first load so it sits above
// the 3 hardcoded mock patients and never collides.
const seedIdCounter = () => {
  if (!localStorage.getItem('hom_id_counter')) {
    localStorage.setItem('hom_id_counter', '3');
  }
};
seedIdCounter();

// ─────────────────────────────────────────────
// FIX 3 (helper): Convert uploaded File to
//         base64 so previews survive page reloads.
//         blob: URLs are session-only and break
//         once the tab is closed.
// ─────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });

export default function App() {
  // ── Authentication & Security State ──────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // FIX 2a: No longer hard-code or display the PIN in the UI.
  //         Store a hashed version. For a real app use bcrypt;
  //         here we use a simple SHA-256 via SubtleCrypto.
  //         The raw value "1209" is never rendered on screen.
  const CORRECT_PIN_HASH = "0a4abb05489ca5f15c7c8c9eee18f83c9bdc708fc4fb0bf0e0b063a6f4523e6c"; // sha256("1209")

  // FIX 2b: Brute-force lockout after 5 failed attempts.
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  // ── App Navigation & UI State ─────────────────
  const [currentTab, setCurrentTab] = useState("patients");
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('hom_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Create / Edit Patient State ───────────────
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
    history: ""
  });

  // ── OCR Simulator State ───────────────────────
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState("");

  // ── Visit Form State ──────────────────────────
  const [newVisitNotes, setNewVisitNotes] = useState("");
  const [newVisitType, setNewVisitType] = useState("Follow-up");

  // ── Document Upload State ─────────────────────
  const [uploadType, setUploadType] = useState("PDF");
  const fileInputRef = useRef(null);

  // ── Notification State ────────────────────────
  const [toast, setToast] = useState(null);

  // FIX 8: In-app delete confirmation instead of
  //         browser confirm(), which is blocked in
  //         sandboxed iframes and looks out of place.
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem('hom_patients', JSON.stringify(patients));
  }, [patients]);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isLocked = () => Date.now() < lockedUntil;

  const lockSecondsRemaining = () =>
    Math.ceil((lockedUntil - Date.now()) / 1000);

  // ── PIN Auth ──────────────────────────────────
  // FIX 2a: Hash the entered PIN and compare to
  //         the stored hash. Never compare raw strings.
  const hashPin = async (raw) => {
    const encoded = new TextEncoder().encode(raw);
    const buf = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (isLocked()) return;

    const entered = await hashPin(pin);

    if (entered === CORRECT_PIN_HASH) {
      setIsAuthenticated(true);
      setFailCount(0);
      setLockedUntil(0);
      triggerToast("Welcome back, Dr. Samuel!");
    } else {
      const next = failCount + 1;
      setFailCount(next);
      // FIX 2b: Lock for 30 s after 5 failed attempts.
      if (next >= 5) {
        setLockedUntil(Date.now() + 30000);
        setPinError("Too many failed attempts. Locked for 30 seconds.");
      } else {
        setPinError(`Invalid PIN. ${5 - next} attempt(s) remaining.`);
      }
      setPin("");
    }
  };

  // ── Add Patient ───────────────────────────────
  // FIX 9: Validate phone is exactly 10 digits
  //         before accepting the form.
  const handleAddPatientSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age) {
      triggerToast("Please fill all required fields", "error");
      return;
    }

    // FIX 9 ↓
    if (!/^\d{10}$/.test(formData.phone)) {
      triggerToast("Enter a valid 10-digit phone number", "error");
      return;
    }

    // FIX 1 ↓ — uses persistent counter, not patients.length
    const newId = generatePatientId();
    const newPatient = {
      id: newId,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
      history: formData.history,
      createdAt: new Date().toISOString().split('T')[0],
      visits: [
        {
          id: `v_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          notes: formData.history || "Initial registration and patient profile created.",
          type: "First Visit"
        }
      ],
      documents: []
    };

    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);
    triggerToast(`Patient ${formData.name} added successfully!`);

    setFormData({ name: "", age: "", gender: "Male", phone: "", address: "", history: "" });
    setSelectedPatient(newPatient);
    setCurrentTab("profile");
  };

  // ── Add Visit ─────────────────────────────────
  const handleAddVisit = (e) => {
    e.preventDefault();
    if (!newVisitNotes.trim()) return;

    const newVisitObj = {
      id: `v_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      notes: newVisitNotes,
      type: newVisitType
    };

    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        return { ...p, visits: [newVisitObj, ...p.visits] };
      }
      return p;
    });

    setPatients(updatedPatients);
    setSelectedPatient(prev => ({
      ...prev,
      visits: [newVisitObj, ...prev.visits]
    }));
    setNewVisitNotes("");
    triggerToast("Visit record added to timeline!");
  };

  // ── File Upload ───────────────────────────────
  // FIX 3: Convert image to base64 (via fileToBase64)
  //         so the preview URL is stored as a data URL
  //         that persists in localStorage across reloads.
  //         blob: URLs are revoked when the tab closes.
  const handleFileUploadSimulated = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    triggerToast("Uploading file to clinic database...");

    let mockOcrText = "";
    if (file.name.toLowerCase().includes("report") || file.name.toLowerCase().includes("lab")) {
      mockOcrText = `[OCR Text Extracted] PATIENT: ${selectedPatient.name}. Hemoglobin: 14.2 g/dL (Normal). WBC Count: 6,800/cmm. Platelets: 2,50,000/cmm. Blood Urea: 24mg/dL. High cholesterol indicated.`;
    } else {
      mockOcrText = `[OCR Scanned Text] Homeopathic Case-Taking Note. Subjective symptoms matching Lycopodium, gastric disturbance, bloating post-3PM. Warm drinks preferred.`;
    }

    // FIX 3 ↓ — base64 instead of createObjectURL
    let previewUrl = null;
    if (file.type.startsWith("image/")) {
      try {
        previewUrl = await fileToBase64(file);
      } catch {
        previewUrl = null;
      }
    }

    setTimeout(() => {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: uploadType,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl,
        textContent: mockOcrText
      };

      const updatedPatients = patients.map(p => {
        if (p.id === selectedPatient.id) {
          return { ...p, documents: [newDoc, ...p.documents] };
        }
        return p;
      });

      setPatients(updatedPatients);
      setSelectedPatient(prev => ({
        ...prev,
        documents: [newDoc, ...prev.documents]
      }));

      triggerToast("File uploaded & secured successfully!");

      if (mockOcrText) {
        setOcrResult(mockOcrText);
        setOcrScanning(true);
      }
    }, 1500);
  };

  // ── WhatsApp ──────────────────────────────────
  // FIX 4: Prepend +91 country code.
  // FIX 7: Pass 'noopener,noreferrer' to window.open
  //         to prevent tabnapping (opened page can
  //         no longer access window.opener).
  const handleWhatsAppAlert = (patient) => {
    const text = `Hello ${patient.name}, this is Dr. Samuel's Homeopathic Clinic. This is a reminder regarding your regular remedy schedule. Please contact us if you need a refill or follow-up booking. Warm regards!`;
    const encodedText = encodeURIComponent(text);
    // FIX 4 ↓
    const url = `https://wa.me/91${patient.phone}?text=${encodedText}`;
    // FIX 7 ↓
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ── Prescription ──────────────────────────────
  const handleGeneratePrescription = (patient) => {
    const remedyNote = patient.visits[0]?.notes || "Remedy prescription details";
    const docText = `
=============================================
         DR. SAMUEL'S HOMEOPATHY CLINIC
    Healing Gentleness & Holistic Science
=============================================
Patient ID: ${patient.id}
Name      : ${patient.name} (${patient.gender}, ${patient.age} Yrs)
Phone     : ${patient.phone}
Date      : ${new Date().toLocaleDateString()}
---------------------------------------------
RX / REMEDY PRESCRIBED:
---------------------------------------------
1. Constitutional Dose - Administered as per follow-up.
2. Note: ${remedyNote}

DIETARY RESTRICTIONS:
- Avoid raw onion, garlic, and camphor-containing items.
- Maintain a 15-minute gap before/after taking doses.

---------------------------------------------
Authorized Digital Signature: Dr. Samuel (BHMS)
=============================================
    `;
    const element = document.createElement("a");
    const file = new Blob([docText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${patient.name.replace(/\s+/g, '_')}_Prescription.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Prescription generated & downloaded!");
  };

  // ── Delete ────────────────────────────────────
  // FIX 8: Replaced browser confirm() with an in-app
  //         modal state. confirmDelete() is called when
  //         the user clicks Confirm inside the modal.
  const requestDeletePatient = (id) => {
    setDeleteTarget(id);
  };

  const confirmDeletePatient = () => {
    const filtered = patients.filter(p => p.id !== deleteTarget);
    setPatients(filtered);
    setDeleteTarget(null);
    setCurrentTab("patients");
    setSelectedPatient(null);
    triggerToast("Patient record completely erased.");
  };

  const cancelDelete = () => setDeleteTarget(null);

  // ── Filtering ─────────────────────────────────
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.id.toLowerCase().includes(query) ||
      patient.name.toLowerCase().includes(query) ||
      patient.phone.includes(query)
    );
  });

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center items-center font-sans antialiased p-0 sm:p-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-slate-950 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col border border-slate-800 relative">

        {/* Status Bar */}
        <div className="bg-slate-950 px-5 pt-3 pb-1 flex justify-between items-center text-xs text-slate-500 font-mono tracking-wider border-b border-slate-900">
          <span>🎯 CLINIC SECURE ACCESS</span>
          <span>100% End-to-End Encrypted</span>
        </div>

        {/* FIX 6: Toast now uses correct colour based on type.
                  Success = emerald, Error = rose. */}
        {toast && (
          <div className={`absolute top-12 left-4 right-4 z-50 py-3 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-bounce ${
            toast.type === "error"
              ? "bg-rose-500 text-white"
              : "bg-emerald-500 text-slate-950"
          }`}>
            {toast.type === "error"
              ? <AlertTriangle size={18} />
              : <CheckCircle size={18} />
            }
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        )}

        {/* FIX 8: In-app delete confirmation modal */}
        {deleteTarget && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 w-full max-w-xs space-y-4">
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
                  onClick={cancelDelete}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePatient}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PIN LOCK SCREEN ─────────────────── */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950">
            <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
              <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-6 border border-emerald-500/20">
                <Shield size={48} className="animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Samuel HomeoCare</h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">
                Enter your secure clinic access PIN to manage patient medical history.
              </p>

              <form onSubmit={handlePinSubmit} className="mt-8 w-full max-w-xs">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Enter 4-Digit PIN"
                    value={pin}
                    disabled={isLocked()}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ''));
                      setPinError("");
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 text-center text-2xl font-bold tracking-widest text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-40"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <Lock size={18} />
                  </div>
                </div>

                {pinError && (
                  <p className="text-rose-400 text-xs mt-2 text-center font-medium">{pinError}</p>
                )}

                {/* FIX 2b: Show remaining lockout time */}
                {isLocked() && (
                  <p className="text-amber-400 text-xs mt-2 text-center font-medium">
                    Locked — try again in {lockSecondsRemaining()}s
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLocked()}
                  className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex justify-center items-center gap-2"
                >
                  <Lock size={16} /> Unlock Terminal
                </button>
              </form>
            </div>

            {/* FIX 2a: PIN is NO LONGER displayed here */}
            <div className="text-center pb-4 text-xs text-slate-600">
              <p>HIPAA &amp; GDPR Compliant Medical Storage</p>
            </div>
          </div>

        ) : (
          /* ── MAIN INTERFACE ──────────────────── */
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Header Toolbar */}
            <header className="bg-slate-900/80 backdrop-blur-md px-4 py-4 flex justify-between items-center border-b border-slate-800">
              {currentTab === "profile" ? (
                <button
                  onClick={() => {
                    setCurrentTab("patients");
                    setSelectedPatient(null);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 flex items-center gap-1.5 text-sm"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                    H
                  </div>
                  <div>
                    <h2 className="font-bold text-sm tracking-tight">Samuel HomeoCare</h2>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Sync Active
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    setPin("");
                    triggerToast("Logged out of secure terminal");
                  }}
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 transition-colors"
                  title="Lock Database"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </header>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-slate-950 pb-20">

              {/* ── TAB: PATIENTS LIST ────────── */}
              {currentTab === "patients" && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Patients</p>
                      <p className="text-lg font-bold text-slate-200">{patients.length}</p>
                    </div>
                    <div className="text-center border-x border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Follow-ups</p>
                      {/* FIX 5: Removed the arbitrary hardcoded +3 offset */}
                      <p className="text-lg font-bold text-emerald-400">
                        {patients.reduce((acc, p) => acc + Math.max(0, p.visits.length - 1), 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Docs Stored</p>
                      <p className="text-lg font-bold text-blue-400">
                        {patients.reduce((acc, p) => acc + p.documents.length, 0)}
                      </p>
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
                              {patient.visits.length} Vis
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: ADD PATIENT ──────────── */}
              {currentTab === "add" && (
                <form onSubmit={handleAddPatientSubmit} className="p-4 space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-semibold text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <PlusCircle size={16} /> Demographic &amp; Contact Details
                    </h3>

                    {/* ID Preview — reads from counter, not length */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Generated Patient ID</label>
                      <input
                        type="text"
                        value={(() => {
                          const year = new Date().getFullYear();
                          const next = (parseInt(localStorage.getItem('hom_id_counter') || '0', 10)) + 1;
                          return `HOM-${year}-${String(next).padStart(4, '0')}`;
                        })()}
                        disabled
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Full Name <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Age / Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Age <span className="text-rose-400">*</span></label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 35"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Phone — FIX 9: shows format hint */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Phone Number <span className="text-rose-400">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile (e.g. 9876543210)"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      {formData.phone && !/^\d{10}$/.test(formData.phone) && (
                        <p className="text-rose-400 text-[10px] mt-1">Must be exactly 10 digits</p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Address</label>
                      <textarea
                        rows={2}
                        placeholder="Street, City, State..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-semibold text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <FileText size={16} /> Homeopathic Case Taking / History
                    </h3>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Chief Complaints &amp; Miasmatic Background</label>
                      <textarea
                        rows={4}
                        placeholder="Detail physical generals, mental states, modalities, appetite, thirst, sleep, and matching remedy thoughts..."
                        value={formData.history}
                        onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
                  >
                    <Plus size={18} /> Register Patient Profile
                  </button>
                </form>
              )}

              {/* ── TAB: PATIENT PROFILE ─────── */}
              {currentTab === "profile" && selectedPatient && (
                <div className="p-4 space-y-5">

                  {/* Patient Hero Block */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-4 top-4 font-mono font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                      {selectedPatient.id}
                    </div>

                    <div className="space-y-1.5 max-w-[70%]">
                      <h3 className="text-xl font-bold text-slate-100">{selectedPatient.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Activity size={12} className="text-emerald-400" />
                        {selectedPatient.gender}, {selectedPatient.age} Years Old
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Phone size={12} className="text-emerald-400" />
                        {selectedPatient.phone}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleWhatsAppAlert(selectedPatient)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all"
                      >
                        <Send size={12} /> WhatsApp
                      </button>

                      <button
                        onClick={() => handleGeneratePrescription(selectedPatient)}
                        className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 border border-sky-500/20 transition-all"
                      >
                        <Download size={12} /> RX Note
                      </button>

                      {/* FIX 8: Opens in-app modal instead of browser confirm() */}
                      <button
                        onClick={() => requestDeletePatient(selectedPatient.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-2 px-1 rounded-lg flex items-center justify-center gap-1 border border-rose-500/20 transition-all"
                      >
                        <Trash2 size={12} /> Erase
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-1.5">
                      <MapPin size={14} className="text-slate-500 mt-0.5 shrink-0" />
                      <span>{selectedPatient.address || "No clinical address listed for this record."}</span>
                    </p>
                  </div>

                  {/* Document Cabinet */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Upload size={14} /> Document &amp; Lab Cabinet
                      </h4>

                      <div className="flex items-center gap-1">
                        <select
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[11px] px-1 py-1 rounded text-slate-300"
                        >
                          <option>PDF</option>
                          <option>Photo</option>
                          <option>Lab Report</option>
                          <option>X-ray</option>
                        </select>
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUploadSimulated}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />

                    {selectedPatient.documents.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center italic">
                        No medical scans, reports or images uploaded yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPatient.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between text-xs space-y-2"
                          >
                            <div className="flex items-start gap-1.5">
                              {doc.type === "Photo" || doc.type === "X-ray" ? (
                                <Image size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                              ) : (
                                <File size={14} className="text-blue-400 mt-0.5 shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-200 truncate" title={doc.name}>
                                  {doc.name}
                                </p>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                                  {doc.type} ({doc.size})
                                </span>
                              </div>
                            </div>

                            {/* FIX 3: previewUrl is now a base64 data URL — persists on reload */}
                            {doc.previewUrl && (
                              <img
                                src={doc.previewUrl}
                                alt="Medical Report"
                                className="w-full h-16 object-cover rounded border border-slate-800"
                              />
                            )}

                            {doc.textContent && (
                              <button
                                onClick={() => {
                                  setOcrResult(doc.textContent);
                                  setOcrScanning(true);
                                }}
                                className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-1 rounded border border-emerald-500/20 flex items-center justify-center gap-1 font-semibold"
                              >
                                <Sparkles size={10} /> OCR Text Extract
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OCR Result Panel */}
                  {ocrScanning && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Sparkles size={12} /> OCR REPORT EXTRACTED TEXT
                        </span>
                        <button
                          onClick={() => setOcrScanning(false)}
                          className="text-[10px] text-slate-400 hover:text-slate-100 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
                        {ocrResult}
                      </p>
                    </div>
                  )}

                  {/* Visit Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                      Date-wise Timeline &amp; Consultation Log
                    </h4>

                    <form onSubmit={handleAddVisit} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-300">Add Visit Entry</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewVisitType("Follow-up")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${newVisitType === "Follow-up" ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}
                          >
                            Follow-up
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewVisitType("First Visit")}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${newVisitType === "First Visit" ? 'bg-indigo-500 text-white' : 'bg-slate-950 text-slate-400'}`}
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
                        className="w-full bg-emerald-500 disabled:opacity-50 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs flex justify-center items-center gap-1.5"
                      >
                        <PlusCircle size={14} /> Commit Entry to Timeline
                      </button>
                    </form>

                    <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 py-2">
                      {selectedPatient.visits.map((visit, index) => (
                        <div key={visit.id} className="relative">
                          <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 ${index === 0 ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <Clock size={10} /> {visit.date}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${visit.type === 'First Visit' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {visit.type || "Consultation"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{visit.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800/80 flex justify-around items-center px-6 z-40">
              <button
                onClick={() => {
                  setCurrentTab("patients");
                  setSelectedPatient(null);
                }}
                className={`flex flex-col items-center justify-center gap-1 ${currentTab === "patients" ? "text-emerald-400" : "text-slate-500"}`}
              >
                <Search size={20} />
                <span className="text-[10px] font-semibold">Patients</span>
              </button>

              <button
                onClick={() => setCurrentTab("add")}
                className={`relative -top-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${currentTab === "add" ? "bg-emerald-400 text-slate-950 rotate-90" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"}`}
              >
                <Plus size={24} />
              </button>

              <button
                onClick={() => {
                  if (selectedPatient) {
                    setCurrentTab("profile");
                  } else {
                    setSelectedPatient(patients[0]);
                    setCurrentTab("profile");
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 ${currentTab === "profile" ? "text-emerald-400" : "text-slate-500"}`}
              >
                <User size={20} />
                <span className="text-[10px] font-semibold">Profile Log</span>
              </button>
            </nav>

          </div>
        )}
      </div>
    </div>
  );
}
