// Supabase Edge Function for WhatsApp Webhook Verification and Inbound Handling
// Deno runtime
// Endpoint (prod): https://frgblvloxhcnwrgvjazk.supabase.co/functions/v1/whatsapp-webhook
// Local dev: http://127.0.0.1:54321/functions/v1/whatsapp-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers so Meta/Facebook can call this publicly from anywhere
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

// Prefer the secret configured in Supabase. Fallback provided to ease initial setup
const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "bepawa_whatsapp_verify_9c4f2c5d";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

// Care orchestrator types and logic (embedded)
type Lang = 'en' | 'sw';

interface OrchestratorInput {
  text: string;
  lang: Lang;
}

interface OrchestratorMessage {
  type: 'bot';
  content: string;
  suggestions?: string[];
  category?: 'general' | 'safety' | 'education';
}

// Care knowledge and topics
const carePacks = {
  topics: [
    { id: 'anxiety', name: 'Anxiety', labels: ['anxiety', 'anxious', 'panic', 'worry', 'wasiwasi', 'hofu'] },
    { id: 'depression', name: 'Depression', labels: ['depression', 'sad', 'hopeless', 'huzuni', 'unyongonyko'] },
    { id: 'stress', name: 'Stress', labels: ['stress', 'pressure', 'overwhelmed', 'msongo', 'shinikizo'] },
    { id: 'relationships', name: 'Relationships', labels: ['relationship', 'love', 'partner', 'uhusiano', 'mapenzi'] },
    { id: 'hiv_stigma', name: 'HIV Support', labels: ['hiv', 'stigma', 'discrimination', 'kibaguzi', 'fedheha'] }
  ],
  faqs: {
    anxiety: {
      en: [
        { q: "What is anxiety?", a: "Anxiety is a normal stress response, but excessive worry can interfere with daily life." },
        { q: "How can I manage anxiety?", a: "Try deep breathing, mindfulness, regular exercise, and talking to someone you trust." },
        { q: "When should I seek help?", a: "If anxiety interferes with work, relationships, or daily activities for weeks." }
      ],
      sw: [
        { q: "Wasiwasi ni nini?", a: "Wasiwasi ni mwitikio wa kawaida wa msongo, lakini wasiwasi wa kupita kiasi unaweza kuathiri maisha ya kila siku." },
        { q: "Ninawezaje kudhibiti wasiwasi?", a: "Jaribu kupumua kwa kina, kutafakari, mazoezi ya kawaida, na kuzungumza na mtu unayemwamini." },
        { q: "Ni lini niombe msaada?", a: "Ikiwa wasiwasi unaathiri kazi, mahusiano, au shughuli za kila siku kwa wiki nyingi." }
      ]
    },
    depression: {
      en: [
        { q: "What is depression?", a: "Depression is more than feeling sad - it's a persistent low mood that affects daily functioning." },
        { q: "How can I cope with depression?", a: "Maintain routines, stay connected with others, engage in activities you enjoy, and consider professional help." },
        { q: "Is depression treatable?", a: "Yes, depression is highly treatable with therapy, medication, or both." }
      ],
      sw: [
        { q: "Unyongonyko ni nini?", a: "Unyongonyko ni zaidi ya kuhisi huzuni - ni hali ya kudhoofika kwa hisia inayoathiri utendaji wa kila siku." },
        { q: "Ninawezaje kushughulika na unyongonyko?", a: "Dumisha ratiba, uungane na wengine, jiunge na shughuli unazopenda, na fikiria kupata msaada wa kitaalamu." },
        { q: "Je, unyongonyko unatibiwa?", a: "Ndio, unyongonyko unatibiwa sana kwa tiba, dawa, au vyote viwili." }
      ]
    },
    stress: {
      en: [
        { q: "What causes stress?", a: "Stress can be caused by work, relationships, health issues, financial problems, or major life changes." },
        { q: "How do I reduce stress?", a: "Practice relaxation techniques, exercise regularly, get enough sleep, and organize your time better." },
        { q: "What are stress symptoms?", a: "Headaches, muscle tension, fatigue, irritability, difficulty concentrating, and sleep problems." }
      ],
      sw: [
        { q: "Ni nini kinasababisha msongo wa mawazo?", a: "Msongo unaweza kusababishwa na kazi, mahusiano, masuala ya afya, matatizo ya kifedha, au mabadiliko makubwa ya maisha." },
        { q: "Ninawezaje kupunguza msongo?", a: "Fanya mazoezi ya utulivu, fanya mazoezi ya mwili mara kwa mara, pata usingizi wa kutosha, na panga muda wako vizuri." },
        { q: "Ni dalili gani za msongo?", a: "Maumivu ya kichwa, mivutano ya misuli, uchovu, kukasirika, ugumu wa kufikiri, na matatizo ya usingizi." }
      ]
    }
  }
};

const crisisPhrases = [
  'suicide','kill myself','end my life','self harm','kujiua','nimechoka kuishi','najiumiza','najidhuru'
];

function isCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return crisisPhrases.some(p => lower.includes(p));
}

function detectTopic(text: string) {
  const lower = text.toLowerCase();
  for (const t of carePacks.topics) {
    if (t.labels.some(lbl => lower.includes(lbl))) return t.id;
  }
  return null;
}

function detectLanguage(text: string): Lang {
  // Simple language detection based on common Swahili words
  const swahiliWords = ['nina', 'mimi', 'wewe', 'sisi', 'wao', 'hujambo', 'habari', 'asante', 'karibu', 'samahani', 'tafadhali'];
  const lower = text.toLowerCase();
  const hasSwahili = swahiliWords.some(word => lower.includes(word));
  return hasSwahili ? 'sw' : 'en';
}

function packsFaq(topic: any, lang: Lang): string | null {
  const pack = carePacks.faqs[topic];
  const list = (lang === 'sw' ? pack?.sw : pack?.en) || [];
  if (!list.length) return null;
  const lines = list.slice(0, 3).map(f => `• ${f.q}\n  ${f.a}`).join('\n');
  const name = carePacks.topics.find(t => t.id === topic)?.name || 'Topic';
  return lang === 'sw'
    ? `Maswali ya kawaida kuhusu ${name}:\n${lines}`
    : `Here are a few common questions on ${name}:\n${lines}`;
}

async function route(input: OrchestratorInput): Promise<OrchestratorMessage> {
  const { text, lang } = input;

  // 1) Safety first
  if (isCrisis(text)) {
    const content = lang === 'sw'
      ? 'Nina wasiwasi na usalama wako. Ikiwa uko kwenye hatari ya dharura, piga 116 (Tanzania) au nenda hospitali iliyo karibu. Hujako peke yako — usalama wako ni wa kwanza.'
      : 'I'm concerned about your safety. If you're in immediate danger, call 116 (Tanzania) or go to the nearest hospital. You are not alone — your safety comes first.';
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

  // 4) Fallback
  const content = lang === 'sw'
    ? 'Karibu BEPAWA Care! Niko hapa kukusaidia. Unaweza kuniambia unajisikiaje au kile unachohitaji msaada nacho?'
    : 'Welcome to BEPAWA Care! I'm here to help you. You can tell me how you're feeling or what you need support with.';
  return { type: 'bot', content, suggestions: ['Coping tools','Talk to a counselor', 'Anxiety help', 'Depression support'], category: 'general' };
}

async function sendWhatsAppMessage(phoneNumber: string, message: string, suggestions?: string[]) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("Missing WhatsApp credentials");
    return;
  }

  const payload: any = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: { body: message }
  };

  // Add quick reply buttons if suggestions exist
  if (suggestions && suggestions.length > 0) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: message },
      action: {
        buttons: suggestions.slice(0, 3).map((suggestion, index) => ({
          type: "reply",
          reply: {
            id: `suggestion_${index}`,
            title: suggestion.length > 20 ? suggestion.substring(0, 17) + "..." : suggestion
          }
        }))
      }
    };
    delete payload.text;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("WhatsApp message sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { method } = req;

    if (method === "GET") {
      // Meta Verification: expects echo of hub.challenge when token matches
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      const ping = url.searchParams.get("ping");

      console.log("GET verification:", {
        mode,
        tokenPresent: Boolean(token),
        challengePresent: Boolean(challenge),
        ping,
      });

      if (ping) {
        return new Response("ok", { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
      }

      if (mode === "subscribe" && token && challenge) {
        if (token === VERIFY_TOKEN) {
          return new Response(challenge, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
        }
        return new Response("Forbidden: invalid verify token", { status: 403, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
      }

      return new Response("Bad Request", { status: 400, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (method === "POST") {
      // Inbound messages handler
      let body: any = null;
      try {
        body = await req.json();
      } catch (_) {
        body = null;
      }
      
      console.log("WhatsApp inbound payload:", JSON.stringify(body, null, 2));

      // Process WhatsApp messages
      if (body?.entry?.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes?.length > 0) {
            for (const change of entry.changes) {
              if (change.field === "messages" && change.value?.messages?.length > 0) {
                for (const message of change.value.messages) {
                  // Only process text messages for now
                  if (message.type === "text" || message.type === "interactive") {
                    const phoneNumber = message.from;
                    let userText = "";
                    
                    if (message.type === "text") {
                      userText = message.text?.body || "";
                    } else if (message.type === "interactive") {
                      userText = message.interactive?.button_reply?.title || 
                                message.interactive?.list_reply?.title || "";
                    }

                    if (userText && phoneNumber) {
                      // Detect language and route through care orchestrator
                      const lang = detectLanguage(userText);
                      const input: OrchestratorInput = { text: userText, lang };
                      
                      try {
                        const response = await route(input);
                        await sendWhatsAppMessage(phoneNumber, response.content, response.suggestions);
                      } catch (error) {
                        console.error("Error processing message:", error);
                        const errorMsg = lang === 'sw' 
                          ? 'Samahani, kuna tatizo. Jaribu tena baadaye.'
                          : 'Sorry, there was an error. Please try again later.';
                        await sendWhatsAppMessage(phoneNumber, errorMsg);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Always return 200 quickly to satisfy webhook retry policy
      return new Response(JSON.stringify({ ok: true }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } 
      });
    }

    return new Response("Method Not Allowed", { status: 405, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    console.error("whatsapp-webhook error:", err);
    return new Response("Internal Server Error", { status: 500, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
  }
}

serve(handler);
