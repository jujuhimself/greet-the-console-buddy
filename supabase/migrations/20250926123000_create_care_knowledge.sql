-- Enable pgvector for embeddings
create extension if not exists vector;

-- Knowledge base for Bepawa Care psychoeducation
create table if not exists public.care_knowledge (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  lang text not null check (lang in ('en','sw')),
  title text,
  chunk_text text not null,
  embedding vector(1536),
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists care_knowledge_topic_lang_idx on public.care_knowledge (topic, lang);
create index if not exists care_knowledge_embedding_idx on public.care_knowledge using ivfflat (embedding vector_l2_ops) with (lists = 100);
