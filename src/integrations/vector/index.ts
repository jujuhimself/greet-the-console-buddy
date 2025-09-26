// Vector search integration (stub). Replace with real embeddings + search.
// This stub returns an empty array so the app builds until RAG is enabled.

export interface SearchParams {
  query: string;
  lang: 'en' | 'sw';
  topic?: string;
  topK?: number;
}

export interface SearchResult {
  id: string;
  score: number;
  snippet: string;
  topic?: string;
  lang?: 'en' | 'sw';
}

export async function searchKnowledge(params: SearchParams): Promise<SearchResult[]> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('knowledge-search', {
      body: {
        query: params.query,
        lang: params.lang,
        topic: params.topic,
        topK: params.topK ?? 3
      }
    });
    if (error) throw error;
    const results = ((data as any)?.results ?? []) as Array<any>;
    return results.map((r) => ({
      id: r.id,
      score: typeof r.distance === 'number' ? r.distance : 0,
      snippet: r.chunk_text as string,
      topic: r.topic,
      lang: r.lang
    }));
  } catch (e) {
    console.warn('knowledge-search failed, falling back to empty:', e);
    return [];
  }
}
