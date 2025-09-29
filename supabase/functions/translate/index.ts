// Supabase Edge Function: translate
// Proxies Google Cloud Translate using server-side API key.
// Secrets required:
// - GOOGLE_TRANSLATE_API_KEY
// Optional: enforce allowed targets/sources.


// Type shim for local editors (Deno runtime provides Deno global at deploy time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

interface ReqBody {
  q: string;
  target: 'en' | 'sw';
  source?: 'en' | 'sw';
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    const body = (await req.json()) as ReqBody;
    const apiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
    if (!apiKey) {
      return new Response('Missing GOOGLE_TRANSLATE_API_KEY', { status: 500 });
    }
    const { q, target, source } = body || {};
    if (!q || !target) {
      return new Response('Bad Request', { status: 400 });
    }

    // Call Google Translate v2
    const url = new URL('https://translation.googleapis.com/language/translate/v2');
    url.searchParams.set('key', apiKey);
    const payload: Record<string, unknown> = { q, target };
    if (source) payload.source = source;

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(`Translate error: ${res.status} ${txt}`, { status: 500 });
    }
    const data = await res.json();
    const translated = data?.data?.translations?.[0]?.translatedText ?? '';
    return new Response(JSON.stringify({ translated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(`Server error: ${e}`, { status: 500 });
  }
});
