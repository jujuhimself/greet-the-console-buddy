// Orchestrator for Bepawa Care conversations (web + WhatsApp can share this)
// Pipeline: safety -> packs -> RAG (stub) -> fallback

import { carePacks, TopicId } from '@/content/care/packs';
import { translate } from '@/integrations/translate';
import { searchKnowledge } from '@/integrations/vector';

export type Lang = 'en' | 'sw';

export interface OrchestratorInput {
  text: string;
  lang: Lang; // already resolved from user pref/auto-detect
}

export interface OrchestratorMessage {
  type: 'bot';
  content: string;
  suggestions?: string[];
  category?: 'general' | 'safety' | 'education';
}

const crisisPhrases = [
  'suicide','kill myself','end my life','self harm','kujiua','nimechoka kuishi','najiumiza','najidhuru'
];

function isCrisis(text: string) {
  const lower = text.toLowerCase();
  return crisisPhrases.some(p => lower.includes(p));
}

function detectTopic(text: string): TopicId | null {
  const lower = text.toLowerCase();
  for (const t of carePacks.topics) {
    if (t.labels.some(lbl => lower.includes(lbl))) return t.id;
  }
  return null;
}

function packsFaq(topic: TopicId, lang: Lang): string | null {
  const pack = carePacks.faqs[topic];
  const list = (lang === 'sw' ? pack?.sw : pack?.en) || [];
  if (!list.length) return null;
  const lines = list.slice(0, 3).map(f => `• ${f.q}\n  ${f.a}`).join('\n');
  const name = carePacks.topics.find(t => t.id === topic)?.name || 'Topic';
  return lang === 'sw'
    ? `Maswali ya kawaida kuhusu ${name}:\n${lines}`
    : `Here are a few common questions on ${name}:\n${lines}`;
}

export async function route(input: OrchestratorInput): Promise<OrchestratorMessage> {
  const { text, lang } = input;

  // 1) Safety first
  if (isCrisis(text)) {
    const content = lang === 'sw'
      ? 'Nina wasiwasi na usalama wako. Ikiwa uko kwenye hatari ya dharura, piga 116 (Tanzania) au nenda hospitali iliyo karibu. Hujako peke yako — usalama wako ni wa kwanza.'
      : 'I’m concerned about your safety. If you’re in immediate danger, call 116 (Tanzania) or go to the nearest hospital. You are not alone — your safety comes first.';
    return { type: 'bot', content, suggestions: ['Grounding exercise','Talk to a counselor'], category: 'safety' };
  }

  // 2) Packs first (known paths)
  const topic = detectTopic(text);
  if (topic) {
    const faq = packsFaq(topic, lang);
    if (faq) {
      return {
        type: 'bot',
        content: faq,
        suggestions: ['Coping tools', `Quick check (${carePacks.topics.find(t => t.id===topic)?.name})`, 'Talk to a counselor'],
        category: 'general'
      };
    }
  }

  // 3) RAG search (stub now)
  const results = await searchKnowledge({ query: text, lang, topic: topic || undefined, topK: 3 });
  if (results && results.length) {
    // naive stitch
    let stitched = results.map(r => r.snippet).join('\n\n');
    if (lang === 'sw' && /[A-Za-z]/.test(stitched)) {
      // translate EN -> SW if needed
      stitched = await translate(stitched, { target: 'sw', source: 'en', safe: true });
    }
    const content = lang === 'sw'
      ? `Hili ndilo nililokupatia kutoka kwenye maarifa yetu:\n\n${stitched}\n\nKumbuka: Huu sio utambuzi wa kitabibu. Ikiwa dalili zinaendelea, zungumza na mshauri.`
      : `Here’s what I found from our knowledge base:\n\n${stitched}\n\nNote: This is not a medical diagnosis. If symptoms persist, consider a counselor.`;
    return { type: 'bot', content, suggestions: ['Coping tools','Talk to a counselor'], category: 'education' };
  }

  // 4) Fallback
  const content = lang === 'sw'
    ? 'Sijaelewa kikamilifu. Je, ungependa kujaribu “Coping tools” au “Talk to a counselor”?' 
    : 'I might not have enough info. Would you like to try “Coping tools” or “Talk to a counselor”?';
  return { type: 'bot', content, suggestions: ['Coping tools','Talk to a counselor'], category: 'general' };
}
