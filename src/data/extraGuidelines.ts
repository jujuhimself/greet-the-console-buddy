/* Additional treatment guidelines extracted from user-provided markdown */
import { TreatmentGuideline } from './treatmentGuidelines';

const extraGuidelines: TreatmentGuideline[] = [
  {
    id: 'altered-mental-01',
    condition: 'Altered Mental Status',
    symptoms: ['Confusion', 'Unconscious', 'Disorientation'],
    firstLine: [
      { medication: 'Thiamine', dosage: '100 mg IV', duration: 'single', notes: 'Give before glucose if alcohol abuse suspected' },
      { medication: 'Dextrose 50%', dosage: '50 ml IV', duration: 'single', notes: 'Treat hypoglycemia if present' }
    ],
    precautions: ['Avoid sedation before stabilization'],
    whenToRefer: ['Focal deficits', 'Persistent altered state'],
    patientCounseling: ['Seek urgent evaluation for persistent confusion']
  },
  {
    id: 'pulm-edema-01',
    condition: 'Pulmonary Edema',
    symptoms: ['Dyspnea', 'Orthopnea', 'Crackles'],
    firstLine: [
      { medication: 'Furosemide', dosage: '20–40 mg IV', duration: 'single', notes: 'May repeat as needed' },
      { medication: 'Morphine', dosage: '2–5 mg IV', duration: 'slow push', notes: 'Use cautiously' }
    ],
    precautions: ['Monitor respiratory status, BP'],
    whenToRefer: ['Refractory hypoxia', 'Cardiogenic shock'],
    patientCounseling: ['Limit salt', 'Adhere to HF meds']
  },
  {
    id: 'sepsis-01',
    condition: 'Sepsis / Septic Shock',
    symptoms: ['Fever', 'Hypotension', 'Tachycardia'],
    firstLine: [
      { medication: 'Ceftriaxone', dosage: '1–2 g IV', duration: 'BID', notes: 'Adjust per antibiogram' },
      { medication: 'Crystalloids', dosage: '30 ml/kg IV bolus', duration: 'single', notes: 'Fluid resuscitation' }
    ],
    precautions: ['Monitor lactate', 'Avoid delay in antibiotics'],
    whenToRefer: ['Persistent hypotension', 'Multi-organ failure'],
    patientCounseling: ['Early presentation improves outcomes']
  },
  {
    id: 'fever-01',
    condition: 'Fever (Pyrexia)',
    symptoms: ['Fever', 'Chills', 'Sweats'],
    firstLine: [
      { medication: 'Paracetamol', dosage: '15 mg/kg', duration: 'every 6 h', notes: 'Max 60 mg/kg/day' }
    ],
    precautions: ['Avoid NSAIDs in GI/renal risk'],
    whenToRefer: ['>39°C >3 days', 'Severe systemic signs'],
    patientCounseling: ['Hydrate', 'Seek care if worsening']
  },
  {
    id: 'cholera-01',
    condition: 'Cholera',
    symptoms: ['Profuse watery diarrhea', 'Dehydration'],
    firstLine: [
      { medication: 'Oral Rehydration Solution', dosage: 'As needed', duration: 'ongoing', notes: 'Primary therapy' },
      { medication: 'Ringer’s Lactate', dosage: 'As per WHO plan', duration: 'IV', notes: 'Moderate/severe dehydration' },
      { medication: 'Doxycycline', dosage: '300 mg PO once', duration: 'single', notes: 'Adults' }
    ],
    precautions: ['Tetracycline contraindicated in <8 yrs & pregnancy'],
    whenToRefer: ['Severe dehydration', 'Pregnancy'],
    patientCounseling: ['Safe water', 'Hand hygiene']
  },
  {
    id: 'dvt-01',
    condition: 'Deep Vein Thrombosis (DVT)',
    symptoms: ['Leg swelling', 'Pain', 'Redness'],
    firstLine: [
      { medication: 'Enoxaparin', dosage: '1 mg/kg SC', duration: 'q12h', notes: 'LMWH' }
    ],
    secondLine: [
      { medication: 'Warfarin', dosage: '5 mg PO', duration: 'daily', notes: 'Adjust to INR 2–3' }
    ],
    precautions: ['Active bleeding', 'Recent surgery'],
    whenToRefer: ['Massive DVT', 'Phlegmasia'],
    patientCounseling: ['Adherence to anticoagulation', 'INR monitoring']
  },
  {
    id: 'typhoid-01',
    condition: 'Typhoid Fever',
    symptoms: ['Fever', 'Abdominal pain', 'Constipation'],
    firstLine: [
      { medication: 'Ciprofloxacin', dosage: '500 mg PO', duration: 'BID 7–14 days' }
    ],
    secondLine: [
      { medication: 'Ceftriaxone', dosage: '2 g IV/IM', duration: 'daily 10–14 days' }
    ],
    precautions: ['Fluoroquinolone caution in children/pregnancy'],
    whenToRefer: ['Complications', 'Treatment failure'],
    patientCounseling: ['Safe food & water', 'Complete course']
  },
  {
    id: 'hiv-01',
    condition: 'HIV/AIDS (Adults)',
    symptoms: ['Weight loss', 'Opportunistic infections'],
    firstLine: [
      { medication: 'TDF/3TC/DTG', dosage: 'Fixed-dose tab', duration: 'daily', notes: 'First-line' }
    ],
    precautions: ['Baseline creatinine', 'Avoid DTG 1st trimester'],
    whenToRefer: ['Treatment failure', 'Severe ADRs'],
    patientCounseling: ['Adherence critical', 'Regular viral load']
  },
  {
    id: 'pneumonia-01',
    condition: 'Pneumonia (Community-Acquired – Adults)',
    symptoms: ['Cough', 'Fever', 'Dyspnea'],
    firstLine: [
      { medication: 'Amoxicillin', dosage: '500–1000 mg PO', duration: 'q8h 5–7 days' }
    ],
    secondLine: [
      { medication: 'Benzylpenicillin', dosage: '2 MU IV', duration: 'q6h', notes: 'Severe cases' }
    ],
    precautions: ['Penicillin allergy'],
    whenToRefer: ['Respiratory failure', 'Severe CAP score'],
    patientCounseling: ['Complete antibiotics', 'Hydration']
  }
];

export default extraGuidelines;
