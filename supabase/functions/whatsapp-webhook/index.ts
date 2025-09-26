// Supabase Edge Function for WhatsApp Webhook Verification and Inbound Handling
// Deno runtime
// Endpoint (prod): https://<project-ref>.functions.supabase.co/whatsapp-webhook
// Local dev: http://127.0.0.1:54321/functions/v1/whatsapp-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Fallback verify token to ensure verification succeeds if env var isn't set yet
const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "bepawa_whatsapp_verify_9c4f2c5d";

async function handler(req: Request): Promise<Response> {
  try {
    const { method } = req;

    if (method === "GET") {
      // Meta Verification: expects echo of hub.challenge when token matches
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      console.log("GET verification:", { mode, tokenPresent: Boolean(token), challengePresent: Boolean(challenge) });

      if (mode === "subscribe" && token && challenge) {
        if (token === VERIFY_TOKEN) {
          return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
        return new Response("Forbidden: invalid verify token", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      // Healthcheck path: /whatsapp-webhook?ping=1
      const ping = url.searchParams.get("ping");
      if (ping) {
        return new Response("ok", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      return new Response("Bad Request", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (method === "POST") {
      // Inbound messages handler (stub)
      const body = await req.json().catch(() => null);
      console.log("WhatsApp inbound payload:", JSON.stringify(body));

      // Always 200 quickly to satisfy webhook retry policy
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } });
    }

    return new Response("Method Not Allowed", { status: 405, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    console.error("whatsapp-webhook error:", err);
    return new Response("Internal Server Error", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

serve(handler);
