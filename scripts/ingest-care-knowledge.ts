#!/usr/bin/env tsx
/**
 * Ingest psychoeducation markdown into public.care_knowledge with embeddings.
 *
 * Usage examples:
 *  bunx tsx scripts/ingest-care-knowledge.ts --dir knowledge/psychoeducation --topic stress --lang en --upsert
 *  bunx tsx scripts/ingest-care-knowledge.ts --dir knowledge/psychoeducation --lang sw --chunk-size 900 --overlap 150 --dry-run
 *
 * Required env:
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE
 * Optional env for embeddings:
 *  - EMBEDDINGS_PROVIDER=openai | none
 *  - OPENAI_API_KEY (when provider=openai)
 */

import fs from 'fs';
import path from 'path';

// Minimal fetch typing for Node 18+/bun runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const fetch: any;

type Lang = 'en' | 'sw';

interface Args {
  dir: string;
  topic?: string;
  lang?: Lang;
  chunkSize: number;
  overlap: number;
  dryRun: boolean;
  upsert: boolean;
  provider: 'openai' | 'none';
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const arg = (name: string, def?: string) => {
    const i = argv.findIndex(a => a === `--${name}`);
    if (i >= 0) return argv[i + 1];
    return def;
  };
  const flag = (name: string) => argv.includes(`--${name}`);

  const dir = arg('dir', 'knowledge/psychoeducation')!;
  const topic = arg('topic');
  const lang = (arg('lang') as Lang | undefined);
  const chunkSize = parseInt(arg('chunk-size', '800')!, 10);
  const overlap = parseInt(arg('overlap', '120')!, 10);
  const dryRun = flag('dry-run');
  const upsert = flag('upsert');
  const provider = (process.env.EMBEDDINGS_PROVIDER as 'openai' | undefined) ?? (arg('provider','none') as any);

  return { dir, topic, lang, chunkSize, overlap, dryRun, upsert, provider: provider ?? 'none' };
}

function readAllMarkdownFiles(root: string): { file: string; rel: string; content: string }[] {
  const files: { file: string; rel: string; content: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && /\.(md|mdx|txt)$/i.test(entry.name)) {
        files.push({ file: full, rel: path.relative(root, full), content: fs.readFileSync(full, 'utf8') });
      }
    }
  };
  walk(root);
  return files;
}

function inferTopicAndLang(relPath: string): { topic: string; lang: Lang | null; title: string } {
  // Accept paths like: stress/en/file.md or relationships/sw/.. or flat files
  const parts = relPath.split(path.sep);
  let topic = 'general';
  let lang: Lang | null = null;
  let title = path.basename(relPath).replace(/\.(md|mdx|txt)$/i, '').replace(/[-_]/g, ' ');

  if (parts.length >= 3) {
    topic = parts[0];
    const maybeLang = parts[1].toLowerCase();
    if (maybeLang === 'en' || maybeLang === 'sw') lang = maybeLang as Lang;
  } else if (parts.length >= 2) {
    topic = parts[0];
  }
  return { topic, lang, title };
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const clean = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + size);
    let slice = clean.slice(i, end);
    const lastBreak = slice.lastIndexOf('\n\n');
    if (lastBreak > size * 0.6) slice = slice.slice(0, lastBreak + 2);
    chunks.push(slice.trim());
    if (end >= clean.length) break;
    i += Math.max(1, slice.length - overlap);
  }
  return chunks.filter(Boolean);
}

async function embed(texts: string[], provider: 'openai' | 'none'): Promise<number[][]> {
  if (!texts.length) return [];
  if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is required when EMBEDDINGS_PROVIDER=openai');
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ input: texts, model: 'text-embedding-3-small' })
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
    const data = await res.json() as any;
    return data.data.map((d: any) => d.embedding as number[]);
  }
  // provider=none: return zero vectors of 1536 dims to allow pipeline dev
  return texts.map(() => new Array(1536).fill(0));
}

async function upsertRows(rows: Array<{ topic: string; lang: Lang; title: string; chunk_text: string; embedding: number[]; source_url?: string }>, upsert: boolean) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE envs are required');
  const endpoint = new URL('/rest/v1/care_knowledge', url).toString();

  // For now we do inserts (no natural unique key). If upsert=true, merge on (topic, lang, title, chunk_text) using ON CONFLICT created via a unique index if you add one later.
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    throw new Error(`PostgREST error ${res.status}: ${await res.text()}`);
  }
}

async function main() {
  const args = parseArgs();
  const root = path.resolve(args.dir);
  if (!fs.existsSync(root)) {
    console.error(`Directory not found: ${root}`);
    process.exit(1);
  }

  const files = readAllMarkdownFiles(root)
    .filter(f => !args.topic || f.rel.startsWith(args.topic + path.sep));

  const prepared: Array<{ topic: string; lang: Lang; title: string; chunk_text: string; source_url?: string }> = [];

  for (const f of files) {
    const { topic, lang: inferredLang, title } = inferTopicAndLang(f.rel);
    const lang = (args.lang ?? inferredLang ?? 'en');
    const chunks = chunkText(f.content, args.chunkSize, args.overlap);
    for (const c of chunks) {
      prepared.push({ topic, lang, title, chunk_text: c });
    }
  }

  if (!prepared.length) {
    console.log('No chunks prepared. Check your --dir/--topic/--lang filters.');
    return;
  }

  console.log(`Prepared ${prepared.length} chunks across ${files.length} files. Embedding with provider=${args.provider} ...`);
  const embeddings = await embed(prepared.map(p => p.chunk_text), args.provider);

  if (args.dryRun) {
    console.log('[DRY RUN] First chunk preview:', prepared[0]);
    return;
  }

  // Batch insert in groups of 100
  const BATCH = 100;
  for (let i = 0; i < prepared.length; i += BATCH) {
    const chunk = prepared.slice(i, i + BATCH);
    const emb = embeddings.slice(i, i + BATCH);
    const rows = chunk.map((p, idx) => ({ ...p, embedding: emb[idx] }));
    await upsertRows(rows, args.upsert);
    console.log(`Inserted ${Math.min(i + BATCH, prepared.length)} / ${prepared.length}`);
  }

  console.log('Done. You can now query RAG via searchKnowledge().');
}

main().catch((e) => {
  console.error('Ingest error:', e);
  process.exit(1);
});
