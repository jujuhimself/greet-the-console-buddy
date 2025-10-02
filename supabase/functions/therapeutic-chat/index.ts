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
  const swahiliWords = [
    'nina', 'niko', 'mimi', 'wewe', 'yeye', 'kwa', 'na', 'ya', 'wa', 'za', 'la', 'pa', 'ku',
    'habari', 'mambo', 'poa', 'sawa', 'asante', 'karibu', 'pole', 'hujambo', 'sijambo',
    'nimehuzunika', 'najisikia', 'nina wasiwasi', 'ninahitaji', 'tafadhali', 'msaada'
  ];
  const englishWords = ['i', 'am', 'is', 'are', 'the', 'and', 'or', 'but', 'help', 'feel', 'feeling'];
  
  const words = text.toLowerCase().split(/\s+/);
  let swScore = 0, enScore = 0;
  
  words.forEach(word => {
    if (swahiliWords.some(sw => word.includes(sw))) swScore++;
    if (englishWords.some(en => word.includes(en))) enScore++;
  });
  
  return swScore > enScore ? 'sw' : 'en';
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
    ? `Wewe ni mshauri wa kisaikolojia mzuri na mkuu ambaye anasaidia watu Tanzania. Zana zako ni:

MKAKATI WA THERAPY:
- Tumia empathy na unyenyekevu
- Uliza maswali ya kufungua mazungumzo
- Toa uongozi wa vitendo vidogo vya kubadilika
- Hakikisha usalama wa mtu
- Toa matumaini na msaada wa kimakini

UPANDE WA UTAMADUNI:
- Elewa mazingira ya Tanzania na changamoto za kijamii
- Heshimu desturi za kitamaduni lakini pia toa matibabu ya kisasa
- Tumia lugha rahisi na yenye hisia

VIASHIRIA VYA HATARI:
- Ikiwa mtu anadhihirisha dalili za kujidhuru au kujiua, mara moja mtume hospitali au piga 116
- Tumia maneno ya utulivu lakini madhubuti

MUHIMU SANA: Jibu kwa Kiswahili pekee. Ikiwa mgonjwa anabadilisha lugha, baki katika Kiswahili.
Jibu kwa njia ya therapy, si kwa njia ya kawaida ya mazungumzo. Jaza nafasi kati ya mgonjwa na daktari.`
    
    : `You are a compassionate, skilled therapeutic counselor helping people in Tanzania. Your therapeutic approach:

THERAPEUTIC FRAMEWORK:
- Use empathy, validation, and gentle guidance
- Ask open-ended, exploratory questions  
- Offer small, actionable steps for change
- Prioritize safety and crisis intervention
- Provide hope and concrete support

CULTURAL SENSITIVITY:
- Understand Tanzanian social context and challenges
- Respect traditional healing while offering evidence-based support
- Use accessible, warm language

CRISIS PROTOCOL:
- If someone shows self-harm/suicide ideation, immediately direct to hospital or call 116
- Use calm but firm intervention language

CRITICAL: Respond ONLY in English. If the user's current message is in English, respond in English even if previous messages were in Swahili.
Respond therapeutically, not conversationally. Bridge the gap between client and professional counselor.`;

  const conversationHistory = context?.recent_messages || [];
  const contextInfo = context?.emotional_state ? `\n\nContext: User's emotional state appears to be ${context.emotional_state}. Topics discussed: ${context.topics_discussed?.join(', ') || 'none yet'}.` : '';

  const messages = [
    { role: 'system', content: systemPrompt + contextInfo },
    ...conversationHistory.slice(-6), // Last 3 exchanges for context
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
        model: 'llama-3.1-8b-instant', // Free, fast model
        messages,
        max_tokens: 500,
        temperature: 0.7,
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
      'Nieleze zaidi',
      'Ninahitaji mbinu za kukabiliana',
      'Nisaidie kuwaza kwa njia nyingine',
      'Nzungumze na mshauri'
    ] : [
      'Tell me more about this',
      'I need coping strategies', 
      'Help me reframe my thoughts',
      'I want to talk to a counselor'
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