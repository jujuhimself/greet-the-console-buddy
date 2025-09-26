// Separate data-only module to avoid circular imports

const treatmentGuidelinesData = [
  {
    id: 'cardiac-arrest-01',
    condition: 'Cardiac Arrest',
    symptoms: ['Unresponsive', 'No pulse', 'Apnea'],
    firstLine: [
      {
        medication: 'Adrenaline',
        dosage: '1 mg IV',
        duration: 'every 3–5 min',
        notes: 'During CPR'
      }
    ],
    precautions: ['Ensure high-quality CPR', 'Early defibrillation where appropriate'],
    whenToRefer: ['Return of spontaneous circulation then ICU'],
    patientCounseling: ['Post-resuscitation care required']
  },
  {
    id: 'stridor-01',
    condition: 'Stridor',
    symptoms: ['Inspiratory noise', 'Respiratory distress'],
    firstLine: [
      {
        medication: 'Dexamethasone',
        dosage: '0.15–0.6 mg/kg IV',
        duration: 'single dose',
        notes: 'Reduce airway inflammation'
      }
    ],
    precautions: ['Avoid sedation unless airway secured'],
    whenToRefer: ['ENT or anesthesia for airway management'],
    patientCounseling: ['Seek immediate care if breathing worsens']
  },
  {
    id: 'ugi-bleed-01',
    condition: 'Upper GI Bleeding',
    symptoms: ['Hematemesis', 'Melena'],
    firstLine: [
      {
        medication: 'Omeprazole',
        dosage: '80 mg IV bolus then 8 mg/hr',
        duration: 'continuous',
        notes: 'PPI infusion'
      }
    ],
    precautions: ['Stop NSAIDs/anticoagulants'],
    whenToRefer: ['Urgent endoscopy'],
    patientCounseling: ['Monitor for re-bleed, follow up endoscopy']
  },
  {
    id: 'seizure-01',
    condition: 'Status Epilepticus',
    symptoms: ['Prolonged seizure'],
    firstLine: [
      {
        medication: 'Diazepam',
        dosage: '0.15–0.2 mg/kg IV',
        duration: 'slow push',
        notes: 'Max 10 mg'
      },
      {
        medication: 'Phenytoin',
        dosage: '15–20 mg/kg IV',
        duration: 'loading',
        notes: 'Infuse slowly'
      }
    ],
    precautions: ['Maintain airway'],
    whenToRefer: ['ICU if refractory'],
    patientCounseling: ['Adherence to antiepileptics']
  },
  {
    id: 'anaphylaxis-01',
    condition: 'Anaphylaxis',
    symptoms: ['Urticaria', 'Hypotension', 'Bronchospasm'],
    firstLine: [
      {
        medication: 'Adrenaline',
        dosage: '0.01 mg/kg IM (max 0.5 mg)',
        duration: 'repeat every 5–15 min',
        notes: 'First drug'
      }
    ],
    precautions: ['None – life-saving'],
    whenToRefer: ['Hospital observation 4–6 h'],
    patientCounseling: ['Carry epinephrine auto-injector']
  },
  {
    id: 'shock-01',
    condition: 'Shock (General)',
    symptoms: ['Hypotension', 'Tachycardia'],
    firstLine: [
      {
        medication: 'Normal Saline',
        dosage: '20 ml/kg bolus',
        duration: 'single',
        notes: 'Assess response'
      }
    ],
    precautions: ['Avoid overload in cardiogenic shock'],
    whenToRefer: ['ICU if persistent'],
    patientCounseling: ['Early presentation improves survival']
  },
  {
    id: 'malaria-uncomp-01',
    condition: 'Malaria (Uncomplicated)',
    symptoms: ['Fever', 'Chills'],
    firstLine: [
      {
        medication: 'Artemether-Lumefantrine',
        dosage: 'weight-based',
        duration: 'twice daily for 3 days',
        notes: 'ACT'
      }
    ],
    precautions: ['Avoid in first trimester unless necessary'],
    whenToRefer: ['No improvement in 48 h'],
    patientCounseling: ['Complete full 6-dose course with food']
  },
  {
    id: 'malaria-severe-01',
    condition: 'Severe Malaria',
    symptoms: ['Altered consciousness', 'Severe anemia'],
    firstLine: [
      {
        medication: 'Artesunate',
        dosage: '2.4 mg/kg IV at 0,12,24 h',
        duration: 'then daily',
        notes: 'Switch to oral ACT when able'
      }
    ],
    precautions: ['Monitor glucose'],
    whenToRefer: ['ICU if multi-organ failure'],
    patientCounseling: ['Follow full ACT course after IV']
  }
];

export default treatmentGuidelinesData as any;
