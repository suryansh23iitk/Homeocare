export const INITIAL_PATIENTS = [
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
