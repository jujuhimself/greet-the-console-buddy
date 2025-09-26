-- Similarity search function for care_knowledge using pgvector
-- Uses L2 distance; lower is better. Adjust to cosine if you normalize.

create or replace function public.match_care_knowledge(
  query_embedding vector,
  match_count int default 3,
  match_topic text default null,
  match_lang text default null
)
returns table (
  id uuid,
  topic text,
  lang text,
  title text,
  chunk_text text,
  distance float
) language sql stable as $$
  select ck.id, ck.topic, ck.lang, ck.title, ck.chunk_text,
         (ck.embedding <-> query_embedding) as distance
  from public.care_knowledge ck
  where (match_topic is null or ck.topic = match_topic)
    and (match_lang is null or ck.lang = match_lang)
    and ck.embedding is not null
  order by ck.embedding <-> query_embedding
  limit match_count;
$$;
