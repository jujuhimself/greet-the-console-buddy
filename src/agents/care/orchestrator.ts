// Orchestrator for Bepawa Care - now uses therapeutic-chat edge function with LLM
import { supabase } from '@/integrations/supabase/client';

export type Lang = 'en' | 'sw';

export interface OrchestratorInput {
  text: string;
  lang: Lang;
  sessionId?: string;
  userId?: string;
}

export interface OrchestratorMessage {
  type: 'bot';
  content: string;
  suggestions?: string[];
  category?: 'general' | 'safety' | 'education';
}

export async function route(input: OrchestratorInput): Promise<OrchestratorMessage> {
  const { text, lang, sessionId, userId } = input;

  try {
    // Call the enhanced therapeutic-chat edge function
    const { data, error } = await supabase.functions.invoke('therapeutic-chat', {
      body: {
        message: text,
        language: lang,
        sessionId: sessionId || 'web-session',
        userId: userId || null,
        channel: 'web'
      }
    });

    if (error) {
      console.error('Therapeutic chat error:', error);
      throw error;
    }

    return {
      type: 'bot',
      content: data.content || 'I\'m here to help. Can you tell me more?',
      suggestions: data.suggestions || ['Tell me more', 'Coping strategies', 'Talk to a counselor'],
      category: data.priority === 'crisis' ? 'safety' : 'general'
    };
  } catch (error) {
    console.error('Error calling therapeutic chat:', error);
    
    // Fallback response
    const content = lang === 'sw'
      ? 'Samahani, nina tatizo la teknologia. Je, unaweza kuniambia kidogo unajisikiaje sasa?'
      : 'I\'m having a technical issue. Can you briefly tell me how you\'re feeling right now?';
    
    return {
      type: 'bot',
      content,
      suggestions: ['Tell me more', 'Talk to a counselor'],
      category: 'general'
    };
  }
}
