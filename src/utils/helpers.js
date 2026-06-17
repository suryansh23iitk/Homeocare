export const peekNextPatientId = () => {
  const year = new Date().getFullYear();
  const raw = localStorage.getItem('hom_id_counter');
  const next = (parseInt(raw || '0', 10)) + 1;
  return `HOM-${year}-${String(next).padStart(4, '0')}`;
};

export const generatePatientId = () => {
  const id = peekNextPatientId();
  const raw = localStorage.getItem('hom_id_counter');
  const next = (parseInt(raw || '0', 10)) + 1;
  localStorage.setItem('hom_id_counter', String(next));
  return id;
};

export const seedIdCounter = () => {
  if (!localStorage.getItem('hom_id_counter')) {
    localStorage.setItem('hom_id_counter', '3');
  }
};

export const loadPatientsFromStorage = (fallback) => {
  try {
    const saved = localStorage.getItem('hom_patients');
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return fallback;

    return parsed.map((p) => ({
      ...p,
      visits: Array.isArray(p.visits) ? p.visits : [],
      documents: Array.isArray(p.documents) ? p.documents : [],
    }));
  } catch {
    return fallback;
  }
};

export const savePatientsToStorage = (patients) => {
  try {
    localStorage.setItem('hom_patients', JSON.stringify(patients));
    return true;
  } catch {
    return false;
  }
};

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });

export const hashPin = async (raw) => {
  const encoded = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const handleWhatsAppAlert = (patient) => {
  const text = `Hello ${patient.name}, this is Dr. Samuel's Homeopathic Clinic. This is a reminder regarding your regular remedy schedule. Please contact us if you need a refill or follow-up booking. Warm regards!`;
  const encodedText = encodeURIComponent(text);
  const phone = /^\d{10}$/.test(patient.phone) ? `91${patient.phone}` : patient.phone.replace(/\D/g, '');
  const url = `https://wa.me/${phone}?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const handleGeneratePrescription = (patient, onDownloadComplete) => {
  const remedyNote = patient.visits[0]?.notes || 'Remedy prescription details';
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
  const element = document.createElement('a');
  const file = new Blob([docText], { type: 'text/plain' });
  const objectUrl = URL.createObjectURL(file);
  element.href = objectUrl;
  element.download = `${patient.name.replace(/\s+/g, '_')}_Prescription.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(objectUrl);
  if (onDownloadComplete) onDownloadComplete();
};
