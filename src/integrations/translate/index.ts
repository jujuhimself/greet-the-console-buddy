// Translation adapter skeleton for EN <-> SW with safe, pluggable providers.
// Default implementation returns input as-is (no external calls), so it is safe.
// To enable real translation, plug in a provider in translate() below.

export type Lang = 'en' | 'sw';

export interface TranslateOptions {
  source?: Lang;      // if omitted, auto-detect by provider
  target: Lang;       // required
  hint?: string;      // optional domain hint (e.g., 'therapy')
  safe?: boolean;     // run safety scrub if provider returns raw
}

// Synchronous fallback (no-op) - used where async is inconvenient
export function translateSync(text: string, _opts: TranslateOptions): string {
  // TODO: optionally load a tiny on-device phrase map for common therapy terms
  return text;
}

// Async translation - replace with a real provider (NLLB, Cloud Translate, etc.)
export async function translate(text: string, opts: TranslateOptions): Promise<string> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { q: text, target: opts.target, source: opts.source }
    });
    if (error) throw error;
    const out = (data as any)?.translated ?? text;
    return opts.safe ? safetyScrub(out) : out;
  } catch (e) {
    // Fallback to original text on any failure
    return text;
  }
}

export function safetyScrub(text: string): string {
  // Minimal scrub: collapse excessive whitespace and strip strange control chars
  return text.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
}
