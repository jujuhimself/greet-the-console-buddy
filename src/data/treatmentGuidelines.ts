// Standard Treatment Guidelines for Pharmacy Role
export interface TreatmentGuideline {
  id: string;
  condition: string;
  symptoms: string[];
  firstLine: {
    medication: string;
    dosage: string;
    duration: string;
    notes?: string;
  }[];
  secondLine?: {
    medication: string;
    dosage: string;
    duration: string;
    notes?: string;
  }[];
  precautions: string[];
  whenToRefer: string[];
  patientCounseling: string[];
}

import treatmentData from './treatmentGuidelinesData';
import extraGuidelines from './extraGuidelines';

export const treatmentGuidelines: TreatmentGuideline[] = [
  ...(treatmentData as TreatmentGuideline[]),
  ...extraGuidelines,
];

/* Legacy stub kept for reference:
  {
    id: 'uti-01',
    condition: 'Uncomplicated Urinary Tract Infection (UTI)',
    symptoms: ['Dysuria', 'Frequency', 'Urgency', 'Suprapubic pain'],
    firstLine: [
      {
        medication: 'Nitrofurantoin',
        dosage: '100mg',
        duration: '5 days',
        notes: 'Avoid in G6PD deficiency, renal impairment (eGFR <45)'
      },
      {
        medication: 'Trimethoprim/sulfamethoxazole',
        dosage: '160/800mg',
        duration: '3 days',
        notes: 'If local resistance <20%'
      }
    ],
    secondLine: [
      {
        medication: 'Ciprofloxacin',
        dosage: '250mg',
        duration: '3 days',
        notes: 'Reserve for resistant cases'
      }
    ],
    precautions: [
      'Increase fluid intake',
      'Urinate after intercourse',
      'Avoid spermicides'
    ],
    whenToRefer: [
      'Pregnancy',
      'Male patients',
      'Symptoms >7 days',
      'Recurrent UTIs (≥3/year)'
    ],
    patientCounseling: [
      'Complete full course of antibiotics',
      'Expect symptom improvement in 1-2 days',
      'Return if symptoms worsen or persist'
    ]
  },
  // Add more conditions as needed
  {
    id: 'urti-01',
    condition: 'Upper Respiratory Tract Infection (URTI)',
    symptoms: ['Cough', 'Sore throat', 'Rhinorrhea', 'Fever'],
    firstLine: [
      {
        medication: 'Symptomatic treatment',
        dosage: 'As needed',
        duration: '7-10 days',
        notes: 'Most cases are viral and self-limiting'
      }
    ],
    precautions: [
      'Adequate hydration',
      'Rest',
      'Hand hygiene',
      'Cover mouth when coughing'
    ],
    whenToRefer: [
      'Symptoms >10 days',
      'Severe symptoms',
      'Difficulty breathing',
      'Persistent fever >3 days'
    ],
    patientCounseling: [
      'Antibiotics are not effective for viral infections',
      'Use paracetamol for fever/pain',
      'Consider saline nasal drops for congestion'
    ]
  }
  */

// Helper function to find guidelines by condition or symptoms
export function findGuidelines(query: string): TreatmentGuideline[] {
  const searchTerm = query.toLowerCase();

  // Tokenize query, remove common filler words
  const tokens = searchTerm
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 2 && !['for', 'the', 'and', 'with', 'treat', 'treatment', 'manage', 'guideline', 'therapy'].includes(t));

  return treatmentGuidelines.filter(guideline => {
    const cond = guideline.condition.toLowerCase();
    const sym = guideline.symptoms.map(s => s.toLowerCase()).join(' ');

    // Direct match on full query
    if (cond.includes(searchTerm) || sym.includes(searchTerm)) return true;

    // Any token matches condition or symptoms
    return tokens.some(tok => cond.includes(tok) || sym.includes(tok));
  });
}
