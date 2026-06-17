import React, { useState } from 'react';
import { PlusCircle, FileText, Plus } from 'lucide-react';
import { generatePatientId, peekNextPatientId } from '../utils/helpers';

export default function AddPatientTab({ onRegisterPatient, triggerToast }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    history: '',
  });
  const [idPreview, setIdPreview] = useState(peekNextPatientId);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age) {
      triggerToast('Please fill all required fields', 'error');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      triggerToast('Enter a valid 10-digit phone number', 'error');
      return;
    }

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
          notes: formData.history || 'Initial registration and patient profile created.',
          type: 'First Visit',
        },
      ],
      documents: [],
    };

    onRegisterPatient(newPatient);
    setFormData({ name: '', age: '', gender: 'Male', phone: '', address: '', history: '' });
    setIdPreview(peekNextPatientId());
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-semibold text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
          <PlusCircle size={16} /> Demographic &amp; Contact Details
        </h3>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Generated Patient ID</label>
          <input
            type="text"
            value={idPreview}
            disabled
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Age <span className="text-rose-400">*</span>
            </label>
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

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Phone Number <span className="text-rose-400">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="10-digit mobile (e.g. 9876543210)"
            maxLength={10}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          {formData.phone && !/^\d{10}$/.test(formData.phone) && (
            <p className="text-rose-400 text-[10px] mt-1">Must be exactly 10 digits</p>
          )}
        </div>

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

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-semibold text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
          <FileText size={16} /> Homeopathic Case Taking / History
        </h3>
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Chief Complaints &amp; Miasmatic Background
          </label>
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
  );
}
