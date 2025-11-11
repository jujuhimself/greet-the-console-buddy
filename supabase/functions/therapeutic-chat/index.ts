// Enhanced therapeutic chatbot with LLM integration, conversation memory, and RAG
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  channel?: 'web' | 'whatsapp';
  phoneNumber?: string;
  language?: 'en' | 'sw';
}

interface ConversationContext {
  topics_discussed: string[];
  emotional_state: string;
  risk_level: 'low' | 'moderate' | 'high';
  therapeutic_goals: string[];
  session_count: number;
  language_preference: string;
}

const crisisPhrases = [
  // English
  'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'want to die', 'no point living',
  'better off dead', 'not worth living', 'end it all', 'overdose', 'cutting', 'razor', 'bridge',
  // Swahili
  'kujiua', 'nimechoka kuishi', 'najiumiza', 'najidhuru', 'sitaki kuishi', 'maisha haina maana',
  'ni afadhali nife', 'ninadhani kufa', 'hatuna haja ya kuishi'
];

function detectLanguage(text: string): 'en' | 'sw' {
  // Robust heuristic: match whole words, ignore very short particles to avoid false positives
  const cleaned = text.toLowerCase().replace(/[^\p{L}\s]/gu, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const swLex = new Set<string>([
    'habari','mambo','asante','karibu','pole','hujambo','sijambo','poa','sawa',
    'nina','niko','mimi','wewe','yeye','najisikia','wasiwasi','ninahitaji','tafadhali','msaada',
    'huzuni','furaha','hasira','uchovu','maumivu'
  ]);
  const enLex = new Set<string>([
    'hello','hi','please','sorry','help','feel','feeling','anxious','anxiety','sad','angry','happy',
    'family','work','school','support','stress','worried'
  ]);

  let sw = 0, en = 0;
  for (const w of tokens) {
    if (w.length < 3) continue; // ignore short particles like "na", "ya", "wa"
    if (swLex.has(w)) sw++;
    if (enLex.has(w)) en++;
  }

  if (sw > en) return 'sw';
  if (en > sw) return 'en';
  // Default to English on ties/unknown to avoid over-triggering Swahili
  return 'en';
}


function isCrisisMessage(text: string): boolean {
  const lower = text.toLowerCase();
  return crisisPhrases.some(phrase => lower.includes(phrase));
}

async function searchKnowledge(supabase: any, query: string, lang: string, topK = 3) {
  try {
    const { data, error } = await supabase.functions.invoke('knowledge-search', {
      body: { query, lang, topK }
    });
    if (error) throw error;
    return data?.results || [];
  } catch (err) {
    console.warn('Knowledge search failed:', err);
    return [];
  }
}

async function callGroqLLM(message: string, context: any, language: string): Promise<string> {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const systemPrompt = language === 'sw' 
    ? `Wewe ni Bepawaa Care 💚, mshauri wa kisaikolojia wa AI.

KANUNI MUHIMU:

1. LUGHA: Jibu kwa SWAHILI TU. Kamwe usibadilishe kwenda Kiingereza. Swahili asilia, si tafsiri.

2. UREFU: Jibu FUPI - mistari 2-4 tu. Kama mtu wa kweli wa WhatsApp. Epuka mistari mingi.

3. EMOJI: Tumia emoji MARA KWA MARA kusaidia hisia (💚 🤗 😔 💪 🌟 ✨).

4. MTIRIRIKO:
   - Kwanza: Tambua hisia (mfano: "Pole sana unajisikia hivyo 😔")
   - Pili: Uliza swali moja tu la wazi (mfano: "Nini kinakusumbua zaidi?")
   - Tatu: Maliza kwa upendo (mfano: "Niko hapa kwako 💚")

5. USALAMA: Ikiwa mtu anazungumza kujiua/kujidhuru → piga Lifeline Tanzania: 0800 112 112 au 116 🆘

MFANO:
Mtumiaji: "Nina wasiwasi"
Wewe: "Pole sana unajisikia hivyo 😔 Wasiwasi inaweza kuwa nzito sana. Nini kinakusumbua zaidi sasa hivi? Niko hapa kwako 💚"

Jibu kwa ujumbe MMOJA mfupi (mistari 2-4), kama mshauri wa kweli.`
    
    : `You are Bepawaa Care 💚, an AI mental health counselor.

CRITICAL RULES:

1. LANGUAGE: Reply in ENGLISH ONLY. Never switch to Swahili. Natural English, not translated.

2. LENGTH: Keep responses SHORT - 2-4 lines max. Like a real person texting on WhatsApp. Avoid long paragraphs.

3. EMOJIS: Use emojis REGULARLY to enhance emotional connection (💚 🤗 😔 💪 🌟 ✨).

4. FLOW:
   - First: Acknowledge emotion (e.g., "I'm sorry you're feeling that way 😔")
   - Second: Ask one open question (e.g., "What's been weighing on you most?")
   - Third: End warmly (e.g., "I'm here for you 💚")

5. SAFETY: If someone mentions suicide/self-harm → refer to Lifeline Tanzania: 0800 112 112 or 116 🆘

EXAMPLE:
User: "I feel anxious"
You: "I'm sorry you're feeling anxious 😔 Anxiety can be really overwhelming. What's been causing you the most stress lately? I'm here to listen 💚"

Reply in ONE short message (2-4 lines), like a real human counselor.`;

  const conversationHistory = context?.recent_messages || [];
  const contextInfo = context?.emotional_state ? `\n\nContext: User's emotional state: ${context.emotional_state}. Topics: ${context.topics_discussed?.join(', ') || 'none'}.` : '';

  const messages = [
    { role: 'system', content: systemPrompt + contextInfo },
    ...conversationHistory.slice(-6),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 200, // Shorter responses
        temperature: 0.8, // More natural variation
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I understand you\'re reaching out. Can you tell me more about how you\'re feeling right now?';
  } catch (error) {
    console.error('Groq LLM error:', error);
    return language === 'sw' 
      ? 'Samahani, nina tatizo la teknologia. Je, unaweza kuniambia kwa ufupi unajisikiaje sasa?'
      : 'I\'m having a technical issue. Can you briefly tell me how you\'re feeling right now?';
  }
}

async function analyzeEmotionalState(message: string, context: any): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Simple emotion detection
  if (lowerMessage.includes('sad') || lowerMessage.includes('huzuni') || lowerMessage.includes('depressed')) {
    return 'sad';
  }
  if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('wasiwasi')) {
    return 'anxious';
  }
  if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('hasira')) {
    return 'angry';
  }
  if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('furaha')) {
    return 'positive';
  }
  
  return context?.emotional_state || 'neutral';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, sessionId = 'anonymous', userId, channel = 'web', phoneNumber, language: preferredLang }: ChatRequest = await req.json();

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auto-detect language if not provided
    const language = preferredLang || detectLanguage(message);
    console.log(`[Language Detection] Input: "${message.substring(0, 50)}..." | Detected: ${language}`);

    // Crisis intervention - highest priority
    if (isCrisisMessage(message)) {
      const crisisResponse = language === 'sw' 
        ? {
            content: 'Nina wasiwasi mkuu kuhusu usalama wako. **Tafadhali wasiliana na msaada wa haraka:**\n\n🚨 **Tanzania**: Piga 116 au nenda hospitali ya karibu\n🆘 **Hali ya dharura**: Wasiliana na mtu wa karibu au familia\n\nHujako peke yako. Msaada upo. Je, uko mahali salama sasa?',
            suggestions: ['Niko salama', 'Ninahitaji msaada wa haraka', 'Ningependa kuzungumza na mshauri'],
            priority: 'crisis'
          }
        : {
            content: 'I\'m very concerned about your safety right now. **Please reach out for immediate help:**\n\n🚨 **Tanzania**: Call 116 or go to nearest hospital\n🆘 **Emergency**: Contact a trusted friend or family member\n\nYou are not alone. Help is available. Are you in a safe place right now?',
            suggestions: ['I am safe', 'I need immediate help', 'I want to talk to a counselor'],
            priority: 'crisis'
          };

      return new Response(JSON.stringify(crisisResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get or create conversation
    let conversationId: string;
    let context: ConversationContext = {
      topics_discussed: [],
      emotional_state: 'neutral',
      risk_level: 'low',
      therapeutic_goals: [],
      session_count: 1,
      language_preference: language
    };

    const { data: existingConv } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('channel', channel)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
      context = { ...context, ...existingConv.context };
    } else {
      const { data: newConv } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId || null,
          session_id: sessionId,
          channel,
          phone_number: phoneNumber,
          language,
          context
        })
        .select()
        .single();
      
      conversationId = newConv?.id;
    }

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory = recentMessages?.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];

    context.recent_messages = conversationHistory;

    // Search knowledge base first
    const knowledgeResults = await searchKnowledge(supabase, message, language, 2);
    
    let response: string;
    let usedKnowledge = false;

    if (knowledgeResults.length > 0) {
      // Use knowledge base + LLM for contextual response
      const knowledgeContext = knowledgeResults.map(r => r.chunk_text).join('\n\n');
      const contextualMessage = `Based on this information: ${knowledgeContext}\n\nUser question: ${message}`;
      
      response = await callGroqLLM(contextualMessage, context, language);
      usedKnowledge = true;
    } else {
      // Pure LLM response for general therapy
      response = await callGroqLLM(message, context, language);
    }

    // Update emotional state and context
    const newEmotionalState = await analyzeEmotionalState(message, context);
    const updatedContext: ConversationContext = {
      ...context,
      emotional_state: newEmotionalState,
      session_count: context.session_count + 1,
      topics_discussed: [...new Set([...context.topics_discussed, ...knowledgeResults.map(r => r.topic).filter(Boolean)])]
    };

    // Save messages and update context
    await Promise.all([
      supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      }),
      supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant', 
        content: response,
        metadata: { used_knowledge: usedKnowledge, knowledge_sources: knowledgeResults.length }
      }),
      supabase.from('chat_conversations')
        .update({ context: updatedContext, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    ]);

    // Generate contextual suggestions
    const suggestions = language === 'sw' ? [
      'Nieleze zaidi 💬',
      'Mbinu za kukabiliana 💪',
      'Zungumza na mshauri 🤝'
    ] : [
      'Tell me more 💬',
      'Coping strategies 💪', 
      'Talk to a counselor 🤝'
    ];

    return new Response(JSON.stringify({
      content: response,
      suggestions: suggestions,
      context: {
        emotional_state: newEmotionalState,
        session_count: updatedContext.session_count,
        used_knowledge: usedKnowledge
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Therapeutic chat error:', error);
    return new Response(JSON.stringify({ 
      error: 'I apologize, but I\'m having technical difficulties. Please try again in a moment.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});