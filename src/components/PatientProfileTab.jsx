import React, { useState } from 'react';
import PatientHero from './PatientHero';
import DocumentCabinet from './DocumentCabinet';
import OcrPanel from './OcrPanel';
import VisitTimeline from './VisitTimeline';

export default function PatientProfileTab({
  patient,
  onUploadDocument,
  onAddVisit,
  onRequestDelete,
  triggerToast,
}) {
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState('');

  if (!patient) {
    return (
      <div className="p-4 text-center text-slate-500 italic text-sm">
        No patient profile selected.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 animate-fadeIn">
      {/* Patient Hero Block */}
      <PatientHero
        patient={patient}
        onRequestDelete={onRequestDelete}
        triggerToast={triggerToast}
      />

      {/* Document Cabinet */}
      <DocumentCabinet
        patient={patient}
        onUploadDocument={onUploadDocument}
        triggerToast={triggerToast}
        setOcrResult={setOcrResult}
        setOcrScanning={setOcrScanning}
      />

      {/* OCR Result Panel */}
      <OcrPanel
        ocrScanning={ocrScanning}
        ocrResult={ocrResult}
        setOcrScanning={setOcrScanning}
      />

      {/* Visit Timeline */}
      <VisitTimeline
        patient={patient}
        onAddVisit={onAddVisit}
        triggerToast={triggerToast}
      />
    </div>
  );
}
