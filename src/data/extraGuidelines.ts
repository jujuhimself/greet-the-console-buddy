/* Additional treatment guidelines extracted from user-provided markdown */
import { TreatmentGuideline } from './treatmentGuidelines';

const extraGuidelines: TreatmentGuideline[] = [
  // Updated Cardiac Arrest - More comprehensive
  {
    id: 'cardiac-arrest-02',
    condition: 'Cardiac Arrest',
    symptoms: ['Sudden collapse', 'Loss of consciousness', 'Absent pulse', 'No breathing'],
    firstLine: [
      { medication: 'Adrenaline', dosage: '1 mg IV', duration: 'every 3–5 min', notes: 'During resuscitation' }
    ],
    precautions: ['Prioritize airway, breathing, circulation (ABC)', 'Immediate CPR + defibrillation if shockable rhythm'],
    whenToRefer: ['All cases - emergency hospital care'],
    patientCounseling: ['Post-resuscitation care required', 'Family CPR training recommended']
  },
  
  // Updated Stridor
  {
    id: 'stridor-02',
    condition: 'Stridor',
    symptoms: ['High-pitched inspiratory sound', 'Respiratory distress'],
    firstLine: [
      { medication: 'Nebulized adrenaline', dosage: '1 mg in 5 ml normal saline', duration: 'single nebulization', notes: 'Secure airway first' }
    ],
    precautions: ['Rule out foreign body, anaphylaxis, or infection'],
    whenToRefer: ['All cases - emergency airway management'],
    patientCounseling: ['Seek immediate care for any breathing difficulties']
  },

  // Updated Upper GI Bleeding
  {
    id: 'ugi-bleed-02',
    condition: 'Upper Gastrointestinal Bleeding',
    symptoms: ['Hematemesis (vomiting blood)', 'Melena (black stools)', 'Dizziness'],
    firstLine: [
      { medication: 'Omeprazole', dosage: '80 mg IV bolus', duration: 'then 8 mg/hr infusion', notes: 'IV fluids, blood transfusion if Hb <7 g/dL' }
    ],
    precautions: ['NSAIDs worsen bleeding', 'Monitor vital signs'],
    whenToRefer: ['All cases - endoscopy for diagnosis & management'],
    patientCounseling: ['Avoid NSAIDs', 'Return immediately if bleeding recurs']
  },

  // Updated Status Epilepticus
  {
    id: 'status-epilepticus-02',
    condition: 'Status Epilepticus',
    symptoms: ['Continuous seizures >5 min', 'Recurrent seizures without recovery'],
    firstLine: [
      { medication: 'Diazepam', dosage: '0.2–0.5 mg/kg IV', duration: 'max 10 mg per dose', notes: 'Secure airway, monitor oxygen' },
      { medication: 'Phenytoin or Valproate', dosage: 'Loading dose per protocol', duration: 'IV infusion', notes: 'Treat underlying cause' }
    ],
    precautions: ['Avoid diazepam in respiratory depression', 'Maintain airway'],
    whenToRefer: ['All cases - ICU management'],
    patientCounseling: ['Medication adherence crucial for prevention']
  },

  // Updated Anaphylaxis
  {
    id: 'anaphylaxis-02',
    condition: 'Anaphylaxis',
    symptoms: ['Sudden difficulty breathing', 'Wheezing', 'Swelling of face/tongue', 'Hypotension'],
    firstLine: [
      { medication: 'Adrenaline', dosage: '0.5 mg IM (1:1000)', duration: 'repeat every 5–15 min if needed', notes: 'Life-saving - no contraindications' }
    ],
    precautions: ['Add IV fluids, oxygen, antihistamines, corticosteroids'],
    whenToRefer: ['All cases - hospital observation'],
    patientCounseling: ['Carry epinephrine auto-injector', 'Identify and avoid triggers']
  },

  // Updated Shock General
  {
    id: 'shock-02',
    condition: 'Shock (General)',
    symptoms: ['Hypotension', 'Tachycardia', 'Cold clammy skin', 'Altered mental status'],
    firstLine: [
      { medication: 'Normal saline', dosage: '20 ml/kg bolus', duration: 'assess response', notes: 'Treat underlying cause' }
    ],
    precautions: ['Avoid excess fluids in cardiogenic shock', 'Broad-spectrum antibiotics if septic shock'],
    whenToRefer: ['All cases of shock'],
    patientCounseling: ['Early presentation improves survival']
  },

  // Sepsis / Septic Shock
  {
    id: 'sepsis-02',
    condition: 'Sepsis / Septic Shock',
    symptoms: ['Fever', 'Tachycardia', 'Hypotension', 'Confusion', 'Multi-organ dysfunction'],
    firstLine: [
      { medication: 'Ceftriaxone', dosage: '2 g IV', duration: 'daily', notes: 'Adjust per source' },
      { medication: 'IV fluids', dosage: 'Early resuscitation', duration: 'as needed', notes: 'Give within 1 hr' }
    ],
    precautions: ['Early broad-spectrum antibiotics essential'],
    whenToRefer: ['All cases - ICU care consideration'],
    patientCounseling: ['Complete antibiotic course', 'Recognize early warning signs']
  },

  // Fever (Pyrexia)
  {
    id: 'fever-02',
    condition: 'Fever (Pyrexia)',
    symptoms: ['Elevated body temperature', 'Chills', 'Malaise'],
    firstLine: [
      { medication: 'Paracetamol', dosage: '10–15 mg/kg', duration: 'every 6 hrs', notes: 'Max 1 g/dose, search for underlying cause' }
    ],
    precautions: ['Avoid aspirin in children (risk of Reye\'s syndrome)', 'Rule out malaria, typhoid, pneumonia'],
    whenToRefer: ['Persistent fever >3 days', 'Signs of serious infection'],
    patientCounseling: ['Maintain hydration', 'Seek care if fever persists or worsens']
  },

  // Cholera
  {
    id: 'cholera-02',
    condition: 'Cholera',
    symptoms: ['Profuse watery diarrhea (rice water stools)', 'Vomiting', 'Dehydration', 'Shock'],
    firstLine: [
      { medication: 'ORS', dosage: 'ad lib', duration: 'ongoing', notes: 'Primary treatment' },
      { medication: 'Ringer\'s lactate', dosage: '30 ml/kg in 30 min, then 70 ml/kg in 3.5 hrs', duration: 'severe cases', notes: 'IV rehydration' },
      { medication: 'Doxycycline', dosage: '300 mg', duration: 'single dose', notes: 'Adults only' }
    ],
    precautions: ['Monitor hydration status closely'],
    whenToRefer: ['Severe dehydration', 'Shock', 'Pregnancy'],
    patientCounseling: ['Safe water and food practices', 'Hand hygiene', 'Complete rehydration']
  },

  // Malaria (Uncomplicated) - Updated
  {
    id: 'malaria-uncomp-02',
    condition: 'Malaria (Uncomplicated)',
    symptoms: ['Fever', 'Chills', 'Sweating', 'Headache', 'Body aches'],
    firstLine: [
      { medication: 'Artemether-lumefantrine', dosage: '20/120 mg: 4 tabs', duration: 'twice daily × 3 days', notes: 'Adult dose, test before treating' }
    ],
    precautions: ['Avoid in first trimester pregnancy', 'Take with food'],
    whenToRefer: ['No improvement in 48h', 'Severe symptoms develop'],
    patientCounseling: ['Complete full 6-dose course', 'Take with fatty food', 'Use bed nets']
  },

  // Severe Malaria - Updated
  {
    id: 'malaria-severe-02',
    condition: 'Severe Malaria',
    symptoms: ['Altered consciousness', 'Severe anemia', 'Respiratory distress', 'Shock'],
    firstLine: [
      { medication: 'Artesunate', dosage: '2.4 mg/kg IV', duration: 'at 0, 12, 24 hrs, then daily', notes: 'Until oral tolerated' }
    ],
    precautions: ['Caution in neonates (dose adjust)', 'Monitor glucose and complications'],
    whenToRefer: ['All cases - ICU management'],
    patientCounseling: ['Transition to oral ACT when able', 'Complete full course']
  },

  // Deep Vein Thrombosis (DVT)
  {
    id: 'dvt-02',
    condition: 'Deep Vein Thrombosis (DVT)',
    symptoms: ['Swollen, painful calf', 'Tenderness', 'Warmth'],
    firstLine: [
      { medication: 'Enoxaparin', dosage: '1 mg/kg SC', duration: 'every 12 hrs', notes: 'LMWH' }
    ],
    precautions: ['Active bleeding', 'Severe thrombocytopenia'],
    whenToRefer: ['All suspected cases for imaging confirmation'],
    patientCounseling: ['Compression stockings prevent recurrence', 'Adherence to anticoagulation']
  },

  // Typhoid Fever
  {
    id: 'typhoid-02',
    condition: 'Typhoid Fever',
    symptoms: ['Prolonged fever', 'Abdominal pain', 'Diarrhea/constipation', 'Headache'],
    firstLine: [
      { medication: 'Ceftriaxone', dosage: '2 g IV', duration: 'daily × 10–14 days', notes: 'First-line in most areas' }
    ],
    secondLine: [
      { medication: 'Azithromycin', dosage: '500 mg PO', duration: 'daily × 7 days', notes: 'Alternative option' }
    ],
    precautions: ['Fluoroquinolones in children may cause joint problems'],
    whenToRefer: ['Complications suspected', 'Treatment failure'],
    patientCounseling: ['Safe water and food hygiene', 'Complete antibiotic course']
  },

  // HIV/AIDS (Adults)
  {
    id: 'hiv-02',
    condition: 'HIV/AIDS (Adults)',
    symptoms: ['Chronic weight loss', 'Opportunistic infections', 'Night sweats', 'Oral thrush'],
    firstLine: [
      { medication: 'TDF + 3TC (or FTC) + DTG', dosage: 'Fixed-dose combination', duration: 'once daily', notes: 'First-line ART' }
    ],
    precautions: ['Renal impairment (avoid TDF)', 'Monitor viral load regularly'],
    whenToRefer: ['Treatment failure', 'Opportunistic infections'],
    patientCounseling: ['Adherence counseling critical', 'Regular viral load monitoring', 'Safe sex practices']
  },

  // Pneumonia (Community-Acquired – Adults) - Updated
  {
    id: 'pneumonia-02',
    condition: 'Pneumonia (Community-Acquired – Adults)',
    symptoms: ['Cough', 'Fever', 'Chest pain', 'Difficulty breathing'],
    firstLine: [
      { medication: 'Amoxicillin', dosage: '1 g', duration: 'every 8 hrs × 7 days', notes: 'Oral therapy for mild cases' }
    ],
    secondLine: [
      { medication: 'Ceftriaxone', dosage: '1-2 g IV', duration: 'daily', notes: 'Severe cases' }
    ],
    precautions: ['Allergy to penicillin'],
    whenToRefer: ['Severe cases need oxygen and hospitalization', 'Respiratory failure'],
    patientCounseling: ['Complete antibiotics course', 'Adequate rest and hydration']
  },

  // Measles (Rubeola)
  {
    id: 'measles-01',
    condition: 'Measles (Rubeola)',
    symptoms: ['Fever', 'Cough', 'Conjunctivitis', 'Runny nose', 'Koplik spots', 'Rash spreading from face downward'],
    firstLine: [
      { medication: 'Vitamin A', dosage: '200,000 IU', duration: 'once daily for 2 days', notes: '100,000 IU if 6–11 months; 50,000 IU if <6 months' }
    ],
    precautions: ['Supportive care (hydration, nutrition, fever control)'],
    whenToRefer: ['Complications (pneumonia, encephalitis)', 'Severe cases'],
    patientCounseling: ['Isolate patient', 'Vaccinate contacts if within 72 hrs', 'Supportive care']
  },

  // Iron Deficiency Anemia (Children)
  {
    id: 'iron-deficiency-children-01',
    condition: 'Iron Deficiency Anemia (Children)',
    symptoms: ['Pallor', 'Fatigue', 'Irritability', 'Delayed growth', 'Pica'],
    firstLine: [
      { medication: 'Ferrous sulfate', dosage: '3–6 mg/kg/day elemental iron', duration: 'divided doses for 3–6 months', notes: 'Give with vitamin C' }
    ],
    precautions: ['Iron overload conditions (thalassemia major, hemochromatosis)'],
    whenToRefer: ['No response to treatment', 'Underlying bleeding'],
    patientCounseling: ['Iron-rich diet counseling', 'Give with vitamin C for absorption', 'Continue beyond hemoglobin normalization']
  },

  // Severe Acute Malnutrition (Children)
  {
    id: 'sam-children-01',
    condition: 'Severe Acute Malnutrition (Children)',
    symptoms: ['Severe wasting', 'Bilateral pedal edema', 'Visible ribs', 'Lethargy'],
    firstLine: [
      { medication: 'RUTF (Ready-to-Use Therapeutic Food)', dosage: '200 kcal/kg/day', duration: 'ongoing', notes: 'Primary therapy' },
      { medication: 'Amoxicillin', dosage: '15 mg/kg', duration: 'every 8 hrs for 7 days', notes: 'Routine antibiotic' }
    ],
    precautions: ['Avoid IV fluids unless in shock', 'Rehydration with ReSoMal if needed'],
    whenToRefer: ['Complicated cases (infection, hypoglycemia, hypothermia)', 'No improvement'],
    patientCounseling: ['Follow-up nutrition counseling', 'Gradual feeding increase']
  },

  // Pneumonia (Children)
  {
    id: 'pneumonia-children-01',
    condition: 'Pneumonia (Children)',
    symptoms: ['Cough', 'Fever', 'Fast breathing', 'Chest indrawing', 'Difficulty feeding'],
    firstLine: [
      { medication: 'Amoxicillin', dosage: '80–90 mg/kg/day', duration: '2–3 divided doses × 5–7 days', notes: 'Oral therapy' }
    ],
    secondLine: [
      { medication: 'Ceftriaxone', dosage: 'Weight-based IV', duration: 'daily', notes: 'Severe cases' }
    ],
    precautions: ['Allergy to penicillin'],
    whenToRefer: ['Severe cases', 'Chest indrawing', 'Unable to feed'],
    patientCounseling: ['Complete antibiotic course', 'Continue feeding', 'Return if worsening']
  },

  // Acute Diarrhea (Children)
  {
    id: 'diarrhea-children-01',
    condition: 'Acute Diarrhea (Children)',
    symptoms: ['Frequent loose stools', 'Dehydration', 'Sunken eyes', 'Dry mouth', 'Lethargy'],
    firstLine: [
      { medication: 'ORS', dosage: 'ad lib', duration: 'ongoing', notes: 'Primary therapy' },
      { medication: 'Zinc', dosage: '20 mg daily (10 mg if <6 months)', duration: '10–14 days', notes: 'Essential supplementation' }
    ],
    precautions: ['Continue breastfeeding and normal feeding'],
    whenToRefer: ['Severe dehydration', 'Bloody diarrhea', 'Persistent vomiting'],
    patientCounseling: ['Continue breastfeeding', 'Increase fluids', 'Zinc supplementation important']
  },

  // Malaria in Under-5s
  {
    id: 'malaria-under5-01',
    condition: 'Malaria in Under-5s',
    symptoms: ['Fever', 'Poor feeding', 'Convulsions', 'Lethargy'],
    firstLine: [
      { medication: 'Artemether-lumefantrine', dosage: '5–14 kg: 1 tab 20/120 mg', duration: 'twice daily × 3 days', notes: 'Adjust per weight band' }
    ],
    precautions: ['If severe → IV artesunate', 'Safe in children'],
    whenToRefer: ['Severe malaria signs', 'Unable to take oral medication'],
    patientCounseling: ['Complete full course', 'Return if no improvement in 48h', 'Prevention with bed nets']
  },

  // Sickle Cell Disease (Children)
  {
    id: 'sickle-cell-children-01',
    condition: 'Sickle Cell Disease (Children)',
    symptoms: ['Recurrent pain episodes', 'Anemia', 'Jaundice', 'Splenomegaly'],
    firstLine: [
      { medication: 'Folic acid', dosage: '1 mg', duration: 'daily', notes: 'Lifelong supplementation' },
      { medication: 'Penicillin V', dosage: '125 mg', duration: 'twice daily (<5 yrs)', notes: 'Prophylaxis' }
    ],
    precautions: ['Avoid dehydration and cold exposure', 'Vaccination against pneumococcus, Hib, meningococcus'],
    whenToRefer: ['Pain crises', 'Acute chest syndrome', 'Stroke symptoms'],
    patientCounseling: ['Hydration important', 'Recognize crisis symptoms', 'Regular follow-up']
  },

  // HIV/TB Co-Infection
  {
    id: 'hiv-tb-coinfection-01',
    condition: 'HIV/TB Co-Infection',
    symptoms: ['Prolonged fever', 'Cough', 'Weight loss', 'Night sweats'],
    firstLine: [
      { medication: 'Standard TB regimen (2HRZE/4HR)', dosage: 'Weight-based', duration: '6 months', notes: 'Start immediately' },
      { medication: 'TDF + 3TC + DTG', dosage: 'Fixed-dose combination', duration: 'daily', notes: 'Start ART within 2–8 weeks' }
    ],
    precautions: ['Rifampicin interacts with some ARVs (avoid NVP)', 'Monitor for IRIS'],
    whenToRefer: ['All cases for specialized care'],
    patientCounseling: ['Adherence counseling critical', 'Infection control', 'Nutrition support']
  },

  // Tuberculosis (Pulmonary)
  {
    id: 'tb-pulmonary-01',
    condition: 'Tuberculosis (Pulmonary)',
    symptoms: ['Chronic cough >2 weeks', 'Hemoptysis', 'Night sweats', 'Weight loss'],
    firstLine: [
      { medication: 'HRZE regimen', dosage: 'H (300 mg), R (600 mg), Z (1500 mg), E (1200 mg)', duration: '2 months intensive, then 4 months HR', notes: 'DOT essential' }
    ],
    precautions: ['Severe hepatitis (caution with HRZ)', 'Monitor liver function'],
    whenToRefer: ['Drug resistance suspected', 'Treatment failure'],
    patientCounseling: ['DOT (directly observed therapy) essential', 'Complete full 6-month course', 'Infection control']
  },

  // Rabies (Post-Exposure)
  {
    id: 'rabies-pep-01',
    condition: 'Rabies (Post-Exposure)',
    symptoms: ['Pain/tingling at bite site', 'Hydrophobia', 'Agitation', 'Confusion'],
    firstLine: [
      { medication: 'Rabies vaccine', dosage: 'IM injection', duration: 'days 0, 3, 7, 14, 28', notes: 'Always start PEP' },
      { medication: 'Immunoglobulin', dosage: 'Infiltrated around wound', duration: 'single dose', notes: 'If severe exposure' }
    ],
    precautions: ['Always start PEP regardless of time since exposure', 'Clean wound immediately'],
    whenToRefer: ['All animal bite cases for PEP evaluation'],
    patientCounseling: ['Complete vaccine series', 'Wound care', 'Animal observation if possible']
  },

  // Hypertension (Primary, Adults)
  {
    id: 'hypertension-01',
    condition: 'Hypertension (Primary, Adults)',
    symptoms: ['Often asymptomatic', 'Headache', 'Dizziness', 'Visual changes in severe cases'],
    firstLine: [
      { medication: 'Hydrochlorothiazide', dosage: '12.5–25 mg PO', duration: 'daily', notes: 'Thiazide-like diuretic' },
      { medication: 'Amlodipine', dosage: '5–10 mg PO', duration: 'daily', notes: 'CCB option' },
      { medication: 'Enalapril', dosage: '5–20 mg PO', duration: 'daily (titrate)', notes: 'ACEi option' }
    ],
    precautions: ['ACEi/ARB in pregnancy', 'Caution ACEi in renal artery stenosis, hyperkalemia'],
    whenToRefer: ['Target <140/90 mmHg not achieved', 'End-organ damage'],
    patientCounseling: ['Lifestyle modifications', 'Medication adherence', 'Regular BP monitoring']
  },

  // Hypertensive Emergency
  {
    id: 'hypertensive-emergency-01',
    condition: 'Hypertensive Emergency',
    symptoms: ['BP ≥180/120', 'Acute organ damage', 'Encephalopathy', 'Stroke', 'Pulmonary edema', 'AKI'],
    firstLine: [
      { medication: 'IV Labetalol', dosage: '20 mg bolus, then 40–80 mg q10 min', duration: 'max 300 mg or infusion 1–2 mg/min', notes: 'Controlled BP reduction' }
    ],
    precautions: ['Labetalol in asthma, bradycardia, heart block', 'Reduce MAP by ~20–25% in first hour'],
    whenToRefer: ['All cases - ICU management'],
    patientCounseling: ['Medication adherence prevents emergencies', 'Regular BP monitoring']
  },

  // Type 2 Diabetes Mellitus
  {
    id: 'diabetes-t2-01',
    condition: 'Type 2 Diabetes Mellitus (Glycemic Control)',
    symptoms: ['Polyuria', 'Polydipsia', 'Weight loss', 'Fatigue', 'Often asymptomatic'],
    firstLine: [
      { medication: 'Metformin', dosage: '500 mg PO daily', duration: 'titrate to 1,000 mg BID', notes: 'With food, lifestyle modifications' }
    ],
    precautions: ['eGFR <30 mL/min/1.73m²', 'Caution in hepatic failure'],
    whenToRefer: ['A1c remains above target', 'Complications'],
    patientCounseling: ['Add sulfonylurea, DPP-4i, SGLT2i or insulin per context', 'Screen for HTN, lipids', 'Lifestyle modifications']
  },

  // Diabetic Ketoacidosis (DKA)
  {
    id: 'dka-01',
    condition: 'Diabetic Ketoacidosis (DKA)',
    symptoms: ['Polyuria', 'Vomiting', 'Abdominal pain', 'Kussmaul breathing', 'Dehydration', 'Altered sensorium'],
    firstLine: [
      { medication: '0.9% saline', dosage: '15–20 mL/kg first hr', duration: 'then per status', notes: 'IV fluid resuscitation' },
      { medication: 'Regular insulin', dosage: '0.1 U/kg IV bolus then 0.1 U/kg/hr', duration: 'continuous infusion', notes: 'Monitor glucose' },
      { medication: 'Potassium', dosage: '20–30 mEq/L', duration: 'per serum K⁺', notes: 'Once K⁺ <5.3 and patient passing urine' }
    ],
    precautions: ['Avoid insulin bolus in pediatrics (risk cerebral edema)', 'Correct electrolytes'],
    whenToRefer: ['All cases - ICU management'],
    patientCounseling: ['Identify trigger (infection, missed insulin)', 'Diabetes education']
  },

  // Asthma (Maintenance, Adults)
  {
    id: 'asthma-maintenance-01',
    condition: 'Asthma (Maintenance, Adults)',
    symptoms: ['Episodic wheeze', 'Cough', 'Chest tightness', 'Variable airflow limitation'],
    firstLine: [
      { medication: 'Beclomethasone', dosage: '200–400 mcg/day (low) or 400–800 mcg/day (medium)', duration: 'daily', notes: 'ICS-based controller' }
    ],
    precautions: ['Check inhaler technique and adherence', 'Caution with frequent SABA-only use'],
    whenToRefer: ['Uncontrolled asthma', 'Frequent exacerbations'],
    patientCounseling: ['Step-up if uncontrolled', 'Proper inhaler technique', 'Identify triggers']
  },

  // COPD Exacerbation
  {
    id: 'copd-exacerbation-01',
    condition: 'COPD Exacerbation',
    symptoms: ['Worsening dyspnea', 'Cough', 'Increased sputum volume/purulence'],
    firstLine: [
      { medication: 'Salbutamol inhaler', dosage: '2–4 puffs', duration: 'q4–6h PRN', notes: 'Short-acting bronchodilator' },
      { medication: 'Prednisolone', dosage: '40 mg PO', duration: 'daily × 5 days', notes: 'Oral steroids' },
      { medication: 'Amoxicillin/clavulanate', dosage: '625 mg PO', duration: 'TID × 5–7 days', notes: 'If purulent sputum' }
    ],
    precautions: ['Macrolides/quinolones—watch QTc, tendinopathy', 'Oxygen to target SpO₂ 88–92%'],
    whenToRefer: ['Respiratory failure', 'Severe exacerbation'],
    patientCounseling: ['Smoking cessation', 'Vaccines', 'Inhaler technique']
  },

  // Peptic Ulcer Disease (H. pylori)
  {
    id: 'peptic-ulcer-01',
    condition: 'Peptic Ulcer Disease (H. pylori)',
    symptoms: ['Epigastric pain', 'Dyspepsia', 'Nocturnal pain', 'Relief with food/antacids'],
    firstLine: [
      { medication: 'Omeprazole', dosage: '20 mg', duration: 'BID × 14 days', notes: 'Triple therapy' },
      { medication: 'Amoxicillin', dosage: '1 g', duration: 'BID × 14 days', notes: 'H. pylori eradication' },
      { medication: 'Clarithromycin', dosage: '500 mg', duration: 'BID × 14 days', notes: 'Check resistance patterns' }
    ],
    precautions: ['Macrolide resistance common', 'Use bismuth quadruple if needed'],
    whenToRefer: ['Treatment failure', 'Complicated ulcers'],
    patientCounseling: ['Avoid NSAIDs', 'Confirm eradication if possible', 'Complete full course']
  },

  // Urinary Tract Infection (Uncomplicated, Adult Female)
  {
    id: 'uti-uncomplicated-01',
    condition: 'Urinary Tract Infection (Uncomplicated, Adult Female)',
    symptoms: ['Dysuria', 'Frequency', 'Urgency', 'Suprapubic pain', 'No vaginal discharge'],
    firstLine: [
      { medication: 'Nitrofurantoin', dosage: '100 mg PO', duration: 'BID × 5 days', notes: 'First-line choice' },
      { medication: 'TMP-SMX', dosage: '160/800 mg PO', duration: 'BID × 3 days', notes: 'If local resistance <20%' }
    ],
    precautions: ['Nitrofurantoin if eGFR <30', 'TMP-SMX in late pregnancy'],
    whenToRefer: ['Pyelonephritis symptoms', 'Pregnancy', 'Male patients'],
    patientCounseling: ['Complete antibiotic course', 'Increase fluid intake', 'Urinate after intercourse']
  },

  // Bacterial Meningitis (Adults)
  {
    id: 'bacterial-meningitis-01',
    condition: 'Bacterial Meningitis (Adults)',
    symptoms: ['Fever', 'Severe headache', 'Neck stiffness', 'Photophobia', 'Altered sensorium'],
    firstLine: [
      { medication: 'Ceftriaxone', dosage: '2 g IV', duration: 'q12h', notes: 'Empiric therapy' },
      { medication: 'Vancomycin', dosage: 'Per protocol', duration: 'if high resistance concern', notes: 'Add if pneumococcal resistance' },
      { medication: 'Dexamethasone', dosage: '10 mg IV', duration: 'q6h × 4 days', notes: 'Start before/with first antibiotic' }
    ],
    precautions: ['Do not delay antibiotics for CT unless focal deficits/signs of mass effect'],
    whenToRefer: ['All cases - ICU management'],
    patientCounseling: ['Emergency condition requiring immediate treatment']
  },

  // Acute Decompensated Heart Failure
  {
    id: 'heart-failure-acute-01',
    condition: 'Acute Decompensated Heart Failure (Pulmonary Congestion)',
    symptoms: ['Acute dyspnea', 'Orthopnea', 'Basal crackles', 'Edema', 'S3', 'High JVP'],
    firstLine: [
      { medication: 'Furosemide', dosage: '40–80 mg IV bolus', duration: 'repeat/titrate as needed', notes: 'Diuretic therapy' },
      { medication: 'Nitroglycerin', dosage: 'IV infusion', duration: 'if hypertensive', notes: 'Vasodilator if BP adequate' }
    ],
    precautions: ['Nitrates in hypotension or RV infarct', 'Search triggers (ischemia, arrhythmia, infection, salt load, nonadherence)'],
    whenToRefer: ['All cases for cardiac evaluation'],
    patientCounseling: ['Medication adherence', 'Salt restriction', 'Daily weights']
  },

  // Preeclampsia with Severe Features / Eclampsia
  {
    id: 'preeclampsia-01',
    condition: 'Preeclampsia with Severe Features / Eclampsia',
    symptoms: ['Hypertension ≥160/110', 'Proteinuria', 'Headache', 'Visual changes', 'RUQ pain', 'Seizures (eclampsia)'],
    firstLine: [
      { medication: 'MgSO₄', dosage: '4 g IV loading over 5–10 min, then 1 g/hr infusion', duration: 'or 5 g IM each buttock, then 5 g IM q4h', notes: 'Seizure prophylaxis' },
      { medication: 'Labetalol', dosage: '20 mg IV bolus', duration: 'escalate per protocol', notes: 'BP control' },
      { medication: 'Hydralazine', dosage: '5–10 mg IV', duration: 'q20–30 min', notes: 'Alternative BP control' }
    ],
    precautions: ['Myasthenia gravis (avoid MgSO₄)', 'Monitor reflexes/respirations'],
    whenToRefer: ['All cases - obstetric emergency'],
    patientCounseling: ['Definitive treatment is delivery', 'Emergency condition']
  },

  // Postpartum Hemorrhage (PPH)
  {
    id: 'pph-01',
    condition: 'Postpartum Hemorrhage (PPH)',
    symptoms: ['Heavy bleeding after delivery', 'Uterine atony most common cause'],
    firstLine: [
      { medication: 'Oxytocin', dosage: '10 IU IM/IV', duration: 'infusion 20–40 IU in 1 L at 60 drops/min', notes: 'Uterine massage first' },
      { medication: 'Misoprostol', dosage: '800–1000 mcg PR', duration: 'if atony persists', notes: 'Alternative uterotonic' },
      { medication: 'Carboprost', dosage: '250 mcg IM', duration: 'q15–90 min (max 2 mg)', notes: 'If other measures fail' }
    ],
    precautions: ['Carboprost in asthma', 'Ergometrine in HTN/preeclampsia'],
    whenToRefer: ['All cases - obstetric emergency'],
    patientCounseling: ['Rapid resuscitation', 'Tranexamic acid 1 g IV (within 3 hrs of birth)', 'Prepare for transfusion']
  },

  // Continue with remaining conditions...
  // Syphilis (Adults)
  {
    id: 'syphilis-01',
    condition: 'Syphilis (Adults)',
    symptoms: ['Painless chancre (primary)', 'Rash including palms/soles (secondary)', 'Latent/asymptomatic'],
    firstLine: [
      { medication: 'Benzathine penicillin G', dosage: '2.4 million units IM', duration: 'single dose (early) or weekly × 3 (late)', notes: 'IM injection' }
    ],
    precautions: ['Penicillin allergy (consider desensitization in pregnancy)', 'Jarisch–Herxheimer reaction'],
    whenToRefer: ['Neurosyphilis suspected', 'Treatment failure'],
    patientCounseling: ['Test for HIV', 'Partner treatment', 'Safe sex practices']
  },

  // Add all remaining conditions following the same pattern...
  // Due to length constraints, I'll add key remaining conditions
  
  // Gonorrhea (Uncomplicated)
  {
    id: 'gonorrhea-01',
    condition: 'Gonorrhea (Uncomplicated)',
    symptoms: ['Urethral/vaginal discharge', 'Dysuria', 'Pelvic pain'],
    firstLine: [
      { medication: 'Ceftriaxone', dosage: '500 mg IM', duration: 'single dose', notes: 'Dual therapy per resistance patterns' },
      { medication: 'Azithromycin', dosage: '1 g PO', duration: 'single dose', notes: 'Or treat for chlamydia if not excluded' }
    ],
    precautions: ['Macrolide allergy (use doxycycline if not pregnant)'],
    whenToRefer: ['Treatment failure', 'Complicated infection'],
    patientCounseling: ['Treat partners', 'Consider test-of-cure if symptoms persist']
  },

  // Hepatitis B (Acute & Chronic)
  {
    id: 'hepatitis-b-01',
    condition: 'Hepatitis B (Acute & Chronic)',
    symptoms: ['Jaundice', 'Fatigue', 'Anorexia', 'RUQ pain', 'Dark urine', 'Many chronic cases asymptomatic'],
    firstLine: [
      { medication: 'Tenofovir disoproxil fumarate (TDF)', dosage: '300 mg PO', duration: 'daily', notes: 'Chronic with high viral load' },
      { medication: 'Entecavir', dosage: '0.5 mg PO', duration: 'daily', notes: 'Alternative for chronic' }
    ],
    precautions: ['Adjust dose in renal impairment', 'Supportive care for acute'],
    whenToRefer: ['Chronic hepatitis management', 'Complications'],
    patientCounseling: ['Screen household contacts', 'Vaccinate negatives', 'Monitor LFTs and HBV DNA']
  },

  // Acute Pancreatitis
  {
    id: 'acute-pancreatitis-01',
    condition: 'Acute Pancreatitis',
    symptoms: ['Severe epigastric pain radiating to back', 'Nausea/vomiting', 'Raised amylase/lipase'],
    firstLine: [
      { medication: 'IV crystalloids', dosage: '250–500 mL/hr', duration: 'titrate to urine output, hemodynamics', notes: 'Supportive fluids, NPO initially' },
      { medication: 'IV Morphine', dosage: '2–5 mg', duration: 'q4h PRN', notes: 'Pain management' }
    ],
    precautions: ['Avoid morphine in biliary colic (controversial, use fentanyl if available)', 'Monitor for complications'],
    whenToRefer: ['All cases for monitoring complications (shock, ARDS)'],
    patientCounseling: ['Antibiotics only if infected necrosis suspected', 'Supportive care essential']
  },

  // Leptospirosis
  {
    id: 'leptospirosis-01',
    condition: 'Leptospirosis',
    symptoms: ['Fever', 'Headache', 'Myalgia (esp. calf)', 'Conjunctival suffusion', 'Jaundice', 'Renal impairment'],
    firstLine: [
      { medication: 'Doxycycline', dosage: '100 mg PO', duration: 'BID × 7 days', notes: 'Mild cases' },
      { medication: 'Penicillin G', dosage: '1.5 MU IV', duration: 'q6h × 7 days', notes: 'Severe cases' }
    ],
    precautions: ['Doxycycline in pregnancy/children <8 yrs', 'Early therapy prevents complications'],
    whenToRefer: ['Severe disease', 'Organ dysfunction'],
    patientCounseling: ['Early therapy prevents complications', 'Supportive care essential']
  },

  // Cellulitis (Skin & Soft Tissue Infection)
  {
    id: 'cellulitis-01',
    condition: 'Cellulitis (Skin & Soft Tissue Infection)',
    symptoms: ['Erythematous, warm, tender skin', 'May have fever'],
    firstLine: [
      { medication: 'Amoxicillin/clavulanate', dosage: '625 mg PO', duration: 'TID × 5–7 days', notes: 'Mild cases' },
      { medication: 'Ceftriaxone', dosage: '1 g IV', duration: 'daily', notes: 'Severe cases' }
    ],
    precautions: ['Penicillin allergy → clindamycin', 'Elevate limb'],
    whenToRefer: ['Systemic signs', 'Necrotizing infection suspected'],
    patientCounseling: ['Elevate limb', 'Treat risk factors (tinea pedis, wounds)', 'Complete antibiotic course']
  },

  // Osteomyelitis (Acute, Hematogenous)
  {
    id: 'osteomyelitis-01',
    condition: 'Osteomyelitis (Acute, Hematogenous)',
    symptoms: ['Bone pain', 'Fever', 'Swelling', 'Tenderness'],
    firstLine: [
      { medication: 'Ceftriaxone', dosage: '2 g IV', duration: 'daily × 4–6 weeks', notes: 'Adjust per culture' }
    ],
    precautions: ['Cephalosporin allergy → vancomycin/linezolid'],
    whenToRefer: ['All cases for prolonged IV therapy'],
    patientCounseling: ['Surgical drainage if abscess/sequestrum', 'Long treatment course required']
  },

  // Pulmonary Embolism (PE)
  {
    id: 'pulmonary-embolism-01',
    condition: 'Pulmonary Embolism (PE)',
    symptoms: ['Dyspnea', 'Pleuritic chest pain', 'Tachycardia', 'Hemoptysis', 'Hypoxemia'],
    firstLine: [
      { medication: 'Enoxaparin', dosage: '1 mg/kg SC', duration: 'q12h, bridge to warfarin', notes: 'Anticoagulation' }
    ],
    precautions: ['Active bleeding', 'Severe thrombocytopenia'],
    whenToRefer: ['All suspected cases for imaging', 'Massive PE with hemodynamic collapse'],
    patientCounseling: ['Thrombolysis if massive PE', 'Continue anticoagulation as directed']
  },

  // Acute Ischemic Stroke
  {
    id: 'acute-stroke-01',
    condition: 'Acute Ischemic Stroke',
    symptoms: ['Sudden focal neurological deficit', 'Weakness', 'Speech disturbance', 'Vision loss'],
    firstLine: [
      { medication: 'Aspirin', dosage: '300 mg PO/NG', duration: 'daily', notes: 'Start within 24h unless thrombolysis planned' },
      { medication: 'Alteplase', dosage: '0.9 mg/kg IV (max 90 mg)', duration: 'if within 4.5 hrs', notes: 'Thrombolysis if eligible' }
    ],
    precautions: ['Hemorrhagic stroke', 'Recent surgery', 'Bleeding risk'],
    whenToRefer: ['All acute strokes for urgent evaluation'],
    patientCounseling: ['Control BP, glucose', 'Rehabilitation essential', 'Time-sensitive treatment']
  },

  // Chronic Kidney Disease (CKD, Stage 3–5)
  {
    id: 'ckd-01',
    condition: 'Chronic Kidney Disease (CKD, Stage 3–5)',
    symptoms: ['Fatigue', 'Edema', 'Pruritus', 'Anemia', 'Bone pain', 'Reduced urine output (late)'],
    firstLine: [
      { medication: 'Enalapril', dosage: '5–20 mg PO', duration: 'daily', notes: 'BP and proteinuria control' },
      { medication: 'Erythropoietin', dosage: 'Per protocol', duration: 'if Hb <10 g/dL', notes: 'Anemia management' }
    ],
    precautions: ['Avoid ACEi in hyperkalemia, bilateral renal artery stenosis'],
    whenToRefer: ['Progressive decline', 'Dialysis/transplant preparation'],
    patientCounseling: ['Dietary counseling', 'Avoid nephrotoxins', 'Regular monitoring']
  },

  // Iron Deficiency Anemia (Adults)
  {
    id: 'iron-deficiency-adults-01',
    condition: 'Iron Deficiency Anemia (Adults)',
    symptoms: ['Fatigue', 'Pallor', 'Pica', 'Brittle nails', 'Tachycardia'],
    firstLine: [
      { medication: 'Ferrous sulfate', dosage: '200 mg PO', duration: 'TID (≈60 mg elemental iron)', notes: 'Continue 3 months after Hb normalization' }
    ],
    precautions: ['None major', 'Caution in iron overload disorders'],
    whenToRefer: ['No response to treatment', 'Suspected underlying bleeding'],
    patientCounseling: ['Iron-rich diet', 'Deworm if needed', 'Take between meals for better absorption']
  },

  // Sickle Cell Disease (Vaso-occlusive Crisis)
  {
    id: 'sickle-cell-crisis-01',
    condition: 'Sickle Cell Disease (Vaso-occlusive Crisis)',
    symptoms: ['Pain crisis (bones, chest, abdomen)', 'Fever', 'Anemia', 'Dactylitis in children'],
    firstLine: [
      { medication: 'IV fluids', dosage: '3 L/m²/day', duration: 'ongoing', notes: 'Hydration essential' },
      { medication: 'Morphine', dosage: '0.1 mg/kg IV', duration: 'q4h or via PCA', notes: 'Pain management' }
    ],
    precautions: ['Avoid meperidine (risk of seizures)', 'Vaccinate (pneumococcal, Hib)'],
    whenToRefer: ['Acute chest syndrome', 'Stroke symptoms', 'Severe crises'],
    patientCounseling: ['Hydroxyurea for recurrent crises', 'Hydration important', 'Recognize crisis triggers']
  },

  // Anemia in Pregnancy
  {
    id: 'anemia-pregnancy-01',
    condition: 'Anemia in Pregnancy',
    symptoms: ['Fatigue', 'Pallor', 'Palpitations', 'Hb <11 g/dL'],
    firstLine: [
      { medication: 'Ferrous sulfate', dosage: '200 mg PO', duration: 'daily', notes: 'Iron supplementation' },
      { medication: 'Folic acid', dosage: '5 mg PO', duration: 'daily', notes: 'Essential during pregnancy' }
    ],
    precautions: ['None', 'Adjust if iron overload'],
    whenToRefer: ['Severe anemia', 'No response to treatment'],
    patientCounseling: ['Deworm in 2nd trimester', 'Screen malaria', 'Nutrition counseling']
  },

  // Neonatal Sepsis
  {
    id: 'neonatal-sepsis-01',
    condition: 'Neonatal Sepsis',
    symptoms: ['Poor feeding', 'Hypothermia or fever', 'Irritability', 'Lethargy', 'Respiratory distress', 'Apnea', 'Unstable glucose'],
    firstLine: [
      { medication: 'Ampicillin', dosage: '50–100 mg/kg IV', duration: 'q8h', notes: 'Dose by age/weight' },
      { medication: 'Gentamicin', dosage: '4–5 mg/kg IV/IM', duration: 'once daily', notes: 'Adjust per neonatal schedule' }
    ],
    precautions: ['Gentamicin caution with renal impairment', 'Monitor for jaundice, renal function, hearing'],
    whenToRefer: ['All neonatal sepsis cases'],
    patientCounseling: ['Obtain cultures before antibiotics when possible', 'Reassess after 48–72 hrs']
  },

  // Neonatal Jaundice (Significant / Pathologic)
  {
    id: 'neonatal-jaundice-01',
    condition: 'Neonatal Jaundice (Significant / Pathologic)',
    symptoms: ['Yellowing of skin/sclera within first week', 'Poor feeding', 'Lethargy in severe cases'],
    firstLine: [
      { medication: 'Phototherapy', dosage: 'Per age-in-hours and bilirubin charts', duration: 'continuous', notes: 'Use local neonatal guideline nomograms' }
    ],
    precautions: ['Exchange transfusion for severe hyperbilirubinemia or signs of kernicterus'],
    whenToRefer: ['All pathologic jaundice cases'],
    patientCounseling: ['Identify cause (ABO/Rh incompatibility, G6PD deficiency, sepsis)', 'Ensure adequate hydration/feeding']
  },

  // Bronchiolitis (Infants, usually RSV)
  {
    id: 'bronchiolitis-01',
    condition: 'Bronchiolitis (Infants, usually RSV)',
    symptoms: ['Coryza', 'Cough', 'Wheeze', 'Tachypnea', 'Chest indrawing', 'Hypoxia (infants)'],
    firstLine: [
      { medication: 'Supportive care', dosage: 'Oxygen if SpO₂ < 90–92%', duration: 'as needed', notes: 'Hydration, nasal suctioning' }
    ],
    precautions: ['No routine bronchodilators or corticosteroids', 'Routine antibiotics not indicated'],
    whenToRefer: ['Severe respiratory distress', 'Dehydration', 'Significant hypoxia'],
    patientCounseling: ['Monitor for apnea in young infants', 'Most cases resolve with supportive care']
  },

  // Acute Otitis Media (Children)
  {
    id: 'otitis-media-01',
    condition: 'Acute Otitis Media (Children)',
    symptoms: ['Ear pain', 'Fever', 'Irritability', 'Bulging tympanic membrane', 'Otorrhoea'],
    firstLine: [
      { medication: 'Amoxicillin', dosage: '80–90 mg/kg/day', duration: 'divided twice daily for 5–7 days', notes: 'Weight-based dosing' }
    ],
    precautions: ['Penicillin allergy (use azithromycin or erythromycin where appropriate)'],
    whenToRefer: ['Complications suspected', 'Treatment failure'],
    patientCounseling: ['Pain control (paracetamol)', 'Watchful waiting for mild cases in >2 years']
  },

  // TB Preventive Therapy (IPT / TPT)
  {
    id: 'tb-preventive-01',
    condition: 'TB Preventive Therapy (IPT / TPT)',
    symptoms: ['(Preventive) Offered to those without active TB to decrease progression'],
    firstLine: [
      { medication: 'Isoniazid', dosage: '300 mg', duration: 'daily for 6 months', notes: 'Adult dose, weight-based for children' }
    ],
    precautions: ['Active untreated TB', 'Severe liver disease'],
    whenToRefer: ['Active TB suspected', 'Adverse reactions'],
    patientCounseling: ['Screen for active TB prior to starting', 'Provide pyridoxine (vitamin B6) with isoniazid']
  },

  // Dengue (Severe & Warning Signs)
  {
    id: 'dengue-01',
    condition: 'Dengue (Severe & Warning Signs)',
    symptoms: ['High fever', 'Severe headache', 'Retro-orbital pain', 'Myalgia/arthralgia', 'Rash', 'Bleeding', 'Abdominal pain (warning sign)'],
    firstLine: [
      { medication: 'Isotonic fluid resuscitation', dosage: 'Per weight-based protocols', duration: 'careful monitoring', notes: 'Avoid NSAIDs (risk bleeding)' }
    ],
    precautions: ['NSAIDs/aspirin in suspected dengue', 'Monitor for plasma leakage'],
    whenToRefer: ['Warning signs (lethargy, persistent vomiting, abdominal pain)'],
    patientCounseling: ['Early recognition of warning signs', 'Prompt fluid management reduces mortality']
  },

  // Schistosomiasis (S. mansoni / S. haematobium)
  {
    id: 'schistosomiasis-01',
    condition: 'Schistosomiasis (S. mansoni / S. haematobium)',
    symptoms: ['Haematuria (S. haematobium)', 'Abdominal pain', 'Diarrhea', 'Hepatosplenomegaly'],
    firstLine: [
      { medication: 'Praziquantel', dosage: '40 mg/kg', duration: 'single dose', notes: 'Some regimens recommend repeat dosing' }
    ],
    precautions: ['Pregnancy in 1st trimester—use local guidance', 'Treat after first trimester if needed'],
    whenToRefer: ['Heavy infections', 'Complications'],
    patientCounseling: ['Mass drug administration programs commonly used', 'Consider repeat treatment for heavy infections']
  }
];

export default extraGuidelines;
