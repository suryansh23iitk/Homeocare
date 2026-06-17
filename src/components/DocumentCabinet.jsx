import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Image as ImageIcon, File, Sparkles } from 'lucide-react';
import { fileToBase64 } from '../utils/helpers';

export default function DocumentCabinet({
  patient,
  onUploadDocument,
  triggerToast,
  setOcrResult,
  setOcrScanning,
}) {
  const [uploadType, setUploadType] = useState('PDF');
  const fileInputRef = useRef(null);
  const uploadTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current);
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    triggerToast('Uploading file to clinic database...');

    let mockOcrText = '';
    if (
      file.name.toLowerCase().includes('report') ||
      file.name.toLowerCase().includes('lab')
    ) {
      mockOcrText = `[OCR Text Extracted] PATIENT: ${patient.name}. Hemoglobin: 14.2 g/dL (Normal). WBC Count: 6,800/cmm. Platelets: 2,50,000/cmm. Blood Urea: 24mg/dL. High cholesterol indicated.`;
    } else {
      mockOcrText = `[OCR Scanned Text] Homeopathic Case-Taking Note. Subjective symptoms matching Lycopodium, gastric disturbance, bloating post-3PM. Warm drinks preferred.`;
    }

    let fileData = null;
    try {
      fileData = await fileToBase64(file);
    } catch {
      triggerToast('Failed to read file. Please try again.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    uploadTimerRef.current = setTimeout(() => {
      const isImage = file.type.startsWith('image/');
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: uploadType,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl: isImage ? fileData : null,
        fileData,
        mimeType: file.type,
        textContent: mockOcrText,
      };

      onUploadDocument(newDoc);
      triggerToast('File uploaded & secured successfully!');

      if (mockOcrText) {
        setOcrResult(mockOcrText);
        setOcrScanning(true);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Upload size={14} /> Document &amp; Lab Cabinet
        </h4>

        <div className="flex items-center gap-1">
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-[11px] px-1.5 py-1 rounded text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option>PDF</option>
            <option>Photo</option>
            <option>Lab Report</option>
            <option>X-ray</option>
          </select>
          <button
            onClick={() => fileInputRef.current.click()}
            type="button"
            className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded transition-all"
            title="Upload document or image"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,application/pdf"
      />

      {patient.documents.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center italic">
          No medical scans, reports or images uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {patient.documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between text-xs space-y-2"
            >
              <div className="flex items-start gap-1.5">
                {doc.type === 'Photo' || doc.type === 'X-ray' ? (
                  <ImageIcon size={14} className="text-emerald-400 mt-0.5 shrink-0" />
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
                  type="button"
                  className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-1 rounded border border-emerald-500/20 flex items-center justify-center gap-1 font-semibold transition-all"
                >
                  <Sparkles size={10} /> OCR Text Extract
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
