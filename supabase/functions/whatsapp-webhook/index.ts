// Supabase Edge Function for WhatsApp Webhook Verification and Inbound Handling
// Deno runtime
// Endpoint (prod): https://frgblvloxhcnwrgvjazk.supabase.co/functions/v1/whatsapp-webhook
// Local dev: http://127.0.0.1:54321/functions/v1/whatsapp-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

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

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Language detection helper
function detectLanguage(text: string): 'en' | 'sw' {
  const swahiliWords = ['nina', 'mimi', 'wewe', 'sisi', 'wao', 'hujambo', 'habari', 'asante', 'karibu', 'samahani', 'tafadhali', 'nahitaji', 'wasiwasi'];
  const lower = text.toLowerCase();
  const hasSwahili = swahiliWords.some(word => lower.includes(word));
  return hasSwahili ? 'sw' : 'en';
}

// Call the therapeutic-chat edge function for AI-powered responses
async function getAIResponse(userText: string, conversationHistory: any[], lang: 'en' | 'sw') {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/therapeutic-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userText,
        conversationHistory,
        langPref: lang
      })
    });

    if (!response.ok) {
      throw new Error(`AI response failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling therapeutic-chat:', error);
    return null;
  }
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
                      
                      try {
                        // Get or create conversation
                        let { data: conversation } = await supabase
                          .from('chat_conversations')
                          .select('*')
                          .eq('phone_number', phoneNumber)
                          .eq('channel', 'whatsapp')
                          .single();

                        if (!conversation) {
                          const { data: newConv } = await supabase
                            .from('chat_conversations')
                            .insert({
                              user_id: '00000000-0000-0000-0000-000000000000', // System user for WhatsApp
                              session_id: `whatsapp_${phoneNumber}`,
                              channel: 'whatsapp',
                              phone_number: phoneNumber,
                              language: lang
                            })
                            .select()
                            .single();
                          conversation = newConv;
                        }

                        if (conversation) {
                          // Get conversation history
                          const { data: history } = await supabase
                            .from('chat_messages')
                            .select('role, content')
                            .eq('conversation_id', conversation.id)
                            .order('created_at', { ascending: true });

                          // Save user message
                          await supabase
                            .from('chat_messages')
                            .insert({
                              conversation_id: conversation.id,
                              role: 'user',
                              content: userText
                            });

                          // Get AI-powered response
                          const aiResponse = await getAIResponse(
                            userText,
                            history || [],
                            lang
                          );
                          
                          if (aiResponse) {
                            // Save bot message
                            await supabase
                              .from('chat_messages')
                              .insert({
                                conversation_id: conversation.id,
                                role: 'assistant',
                                content: aiResponse.content,
                                metadata: { 
                                  suggestions: aiResponse.suggestions,
                                  category: aiResponse.category 
                                }
                              });

                            await sendWhatsAppMessage(
                              phoneNumber, 
                              aiResponse.content, 
                              aiResponse.suggestions
                            );
                          } else {
                            // Fallback if AI fails
                            const fallbackMsg = lang === 'sw'
                              ? 'Samahani, kuna tatizo. Jaribu tena baadaye.'
                              : 'Sorry, there was an error. Please try again later.';
                            await sendWhatsAppMessage(phoneNumber, fallbackMsg);
                          }
                        }
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
