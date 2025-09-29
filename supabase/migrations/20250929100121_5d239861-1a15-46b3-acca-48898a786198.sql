-- Create conversation memory table for context-aware therapeutic chat
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'web', -- 'web' or 'whatsapp'
  phone_number TEXT NULL, -- for WhatsApp users
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  context JSONB DEFAULT '{}',
  language TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can manage their own conversations" 
ON public.chat_conversations 
FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages  
CREATE POLICY "Users can manage their own messages" 
ON public.chat_messages 
FOR ALL 
USING (
  conversation_id IN (
    SELECT id FROM public.chat_conversations 
    WHERE user_id = auth.uid()
  )
) 
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.chat_conversations 
    WHERE user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_phone_number ON public.chat_conversations(phone_number);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();