// Structured, LLM-free content packs for Bepawa Care (EN/SW minimal seed)
export type TopicId =
  | 'stress'
  | 'anxiety'
  | 'depression'
  | 'hiv_stigma'
  | 'sleep'
  | 'trauma'
  | 'relationships'
  | 'grief'
  | 'financial_stress'
  | 'substance'
  | 'postpartum';

export interface Topic {
  id: TopicId;
  name: string;
  labels: string[]; // keyword triggers
}

export interface FAQItem { q: string; a: string }

export interface Packs {
  topics: Topic[];
  faqs: Record<TopicId, { en: FAQItem[]; sw: FAQItem[] }>;
  screenings: {
    phq2: { questions_en: string[]; questions_sw: string[] };
    gad2: { questions_en: string[]; questions_sw: string[] };
  };
  exercises: {
    box_breathing: { title_en: string; title_sw: string };
    grounding_54321: { title_en: string; title_sw: string };
    reframing: { title_en: string; title_sw: string };
    sleep_hygiene: { title_en: string; title_sw: string };
    communication: { title_en: string; title_sw: string };
    urge_surfing: { title_en: string; title_sw: string };
  };
}

export const carePacks: Packs = {
  topics: [
    { id: 'stress', name: 'Stress', labels: ['stress', 'overwhelmed', 'pressure', 'msongo'] },
    { id: 'anxiety', name: 'Anxiety', labels: ['anxiety', 'worry', 'panic', 'wasiwasi'] },
    { id: 'depression', name: 'Depression', labels: ['depression', 'sad', 'hopeless', 'huzuni'] },
    { id: 'hiv_stigma', name: 'HIV Stigma', labels: ['hiv', 'stigma', 'disclosure'] },
    { id: 'sleep', name: 'Sleep', labels: ['insomnia', 'sleep', 'night', 'kulala'] },
    { id: 'trauma', name: 'Trauma', labels: ['trauma', 'flashback', 'ptsd'] },
    { id: 'relationships', name: 'Relationships', labels: ['relationship', 'partner', 'family', 'mapenzi', 'uhusiano'] },
    { id: 'grief', name: 'Grief', labels: ['grief', 'loss', 'mourning', 'msiba'] },
    { id: 'financial_stress', name: 'Financial Stress', labels: ['money', 'bills', 'rent', 'fedha'] },
    { id: 'substance', name: 'Substance Use', labels: ['alcohol', 'drugs', 'addiction', 'ulevi', 'mihadarati'] },
    { id: 'postpartum', name: 'Postpartum', labels: ['postpartum', 'after birth', 'mtoto', 'baada ya kujifungua'] },
  ],
  faqs: {
    stress: {
      en: [
        { q: 'What is stress?', a: "Stress is your body's response to pressure. Short-term stress can motivate, but long-term stress can affect sleep and mood." },
        { q: 'Fast ways to reduce stress?', a: 'Try 2 minutes of box breathing (4-4-4-4), short walk, water, or write one small task you can complete.' }
      ],
      sw: [
        { q: 'Msongo ni nini?', a: 'Msongo ni mwitikio wa mwili kwa shinikizo. Wa muda mrefu unaweza kuathiri usingizi na hisia.' }
      ]
    },
    anxiety: {
      en: [
        { q: 'What is anxiety?', a: 'Anxiety is a feeling of fear or worry. It becomes a problem when it is frequent or hard to control.' },
        { q: 'How to calm anxiety quickly?', a: 'Slow breathing, grounding 5-4-3-2-1, limit caffeine, and talk to a trusted person.' }
      ], sw: [{ q: 'Wasiwasi ni nini?', a: 'Ni hali ya hofu au wasiwasi unaoendelea. Ukizidi, tafuta msaada.' }]
    },
    depression: {
      en: [
        { q: 'Signs of depression?', a: 'Low mood, loss of interest, sleep/appetite changes, low energy, difficulty concentrating.' },
        { q: 'First steps to cope?', a: 'Small routines: sunlight, gentle movement, regular meals, short tasks, connect with someone.' }
      ], sw: [{ q: 'Dalili za huzuni kali?', a: 'Kukosa hamu, usingizi kubadilika, uchovu, mawazo hasi.' }]
    },
    hiv_stigma: {
      en: [
        { q: 'Dealing with stigma?', a: 'You deserve respect. Choose safe disclosure, connect with supportive groups, and consider counseling.' },
        { q: 'Is counseling private?', a: 'Yes, your sessions are confidential and handled respectfully.' }
      ], sw: [{ q: 'Kukabiliana na unyanyapaa?', a: 'Chagua kufichua taratibu na kwa usalama; tafuta vikundi vinavyosaidia na ushauri.' }]
    },
    sleep: {
      en: [
        { q: 'Improve sleep?', a: 'Consistent bedtime, no screens 1h before bed, cool/dark room, limit caffeine after noon.' },
        { q: 'Can stress affect sleep?', a: 'Yes. Try breathing or grounding before bed.' }
      ], sw: [{ q: 'Kuboresha usingizi?', a: 'Muda wa kulala ulio sawa, epuka skrini kabla, chumba baridi/kiza.' }]
    },
    trauma: {
      en: [
        { q: 'What is grounding?', a: 'A quick technique to feel safe now using senses (5-4-3-2-1). Helpful with flashbacks.' }
      ], sw: [{ q: 'Grounding ni nini?', a: 'Njia ya kupata utulivu kwa kutumia hisia zako (5-4-3-2-1).' }]
    },
    relationships: {
      en: [
        { q: 'How to communicate better?', a: 'Use “I” statements, listen to understand, summarize what you heard, and agree on a small next step.' },
        { q: 'Setting boundaries?', a: 'Be clear and kind: say what you can and cannot do, and repeat calmly if needed.' }
      ], sw: [
        { q: 'Kuwasiliana vyema?', a: 'Tumia sentensi za “Mimi…”, sikiliza kuelewa, rudia kwa ufupi ulichosikia, kisha mkubaliane hatua ndogo.' }
      ]
    },
    grief: {
      en: [
        { q: 'Is grief normal?', a: 'Yes. Grief is a natural response to loss. Emotions can come in waves; be gentle with yourself.' },
        { q: 'How to cope day to day?', a: 'Keep simple routines, connect with someone you trust, and allow yourself to remember and feel.' }
      ], sw: [
        { q: 'Huzuni ya msiba ni ya kawaida?', a: 'Ndiyo. Ni mwitikio wa kawaida kwa upotevu. Hisia huja kwa mawimbi; jipe moyo na utulivu.' }
      ]
    },
    financial_stress: {
      en: [
        { q: 'First steps for money stress?', a: 'List essentials, one small action today, and who can support (friend/family/community). Breathe and pace yourself.' },
        { q: 'How to plan?', a: 'Create a simple weekly budget and review expenses; seek local support programs if available.' }
      ], sw: [
        { q: 'Kukabili msongo wa fedha?', a: 'Orodhesha muhimu, chukua hatua moja ndogo leo, na taja anayekusaidia. Pumua, nenda taratibu.' }
      ]
    },
    substance: {
      en: [
        { q: 'What is urge surfing?', a: 'A skill to ride out cravings like waves: notice, breathe, wait 10 minutes, choose a supportive action.' },
        { q: 'Reducing harm?', a: 'Avoid triggers, plan alternatives, hydrate and eat, seek support, and consider counseling.' }
      ], sw: [
        { q: 'Urge surfing ni nini?', a: 'Ujuzi wa kupitisha hamu kali kama wimbi: tambua, pumua, subiri dakika 10, chagua tendo linalosaidia.' }
      ]
    },
    postpartum: {
      en: [
        { q: 'Postpartum mood changes?', a: 'Common in many parents. If sadness or anxiety persists or worsens, seek support early.' },
        { q: 'Self-care ideas?', a: 'Rest when you can, accept help, short walks, gentle check-ins with your feelings.' }
      ], sw: [
        { q: 'Mabadiliko ya hisia baada ya kujifungua?', a: 'Ni ya kawaida kwa wengi. Ikiwa huzuni/wasiwasi vinaendelea, tafuta msaada mapema.' }
      ]
    }
  },
  screenings: {
    phq2: {
      questions_en: [
        'Over the last 2 weeks, how often have you had little interest or pleasure in doing things? (0-3)',
        'Over the last 2 weeks, how often have you felt down, depressed, or hopeless? (0-3)'
      ],
      questions_sw: [
        'Katika wiki 2 zilizopita, mara ngapi hukuwa na hamu au furaha kufanya mambo? (0-3)',
        'Katika wiki 2 zilizopita, mara ngapi umejisikia chini, huzuni, au kukosa matumaini? (0-3)'
      ]
    },
    gad2: {
      questions_en: [
        'Feeling nervous, anxious, or on edge? (0-3)',
        'Not being able to stop or control worrying? (0-3)'
      ],
      questions_sw: [
        'Kujisikia wasiwasi au kutotulia? (0-3)',
        'Kushindwa kusimamisha au kudhibiti wasiwasi? (0-3)'
      ]
    }
  },
  exercises: {
    box_breathing: { title_en: 'Box Breathing (4-4-4-4)', title_sw: 'Kupumua kwa Sanduku (4-4-4-4)' },
    grounding_54321: { title_en: 'Grounding 5-4-3-2-1', title_sw: 'Njia ya utulivu 5-4-3-2-1' },
    reframing: { title_en: 'Thought Reframing', title_sw: 'Kubadili Fikra' },
    sleep_hygiene: { title_en: 'Sleep Hygiene', title_sw: 'Usafi wa Usingizi' },
    communication: { title_en: 'Kind Communication', title_sw: 'Mawasiliano ya Upole' },
    urge_surfing: { title_en: 'Urge Surfing', title_sw: 'Kupitisha Hamu Kali' }
  }
};
