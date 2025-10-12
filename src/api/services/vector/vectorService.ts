import { chunkText } from "../../lib/chunkText";
import { embedTexts } from "../../lib/embeddingClient";
import * as vectorRepo from "../../repos/vector/vectorRepo";
import { log } from "../../_core/logger";

type SourceItem = { type?: string; text: string };
import { cosine } from "../../lib/vectorMath";


export async function ingestText(brand: string, text: string) {
  // chunkText might return array of strings or objects with `.text`
  const partsRaw = chunkText(text, 900);
  const parts = partsRaw.map((p: any) => (typeof p === "string" ? p : p.text));

  const embeds = await embedTexts(parts);

  const ids = await vectorRepo.addMany(
    brand,
    parts.map((p, i) => ({
      text: p,
      embedding: embeds[i],
      meta: { brand, sourceType: "other", position: i }
    }))
  );

  log("vector.ingest.single", { brand, chunks: parts.length });
  return { added: ids.length, ids };
}

export async function ingestBatch(
  brand: string,
  sources: SourceItem[],
  opts?: { maxCharsPerChunk?: number; overlap?: number },
  baseMeta?: Record<string, any>
) {
  const max = Number(opts?.maxCharsPerChunk ?? 900);
  const overlap = Number(opts?.overlap ?? 120);

  // 1) Chunk all sources with labels
  const chunks: { text: string; meta: any }[] = [];

  for (const s of sources) {
    // Your chunkText might accept (text, max) only. If so, drop overlap.
    const partsRaw = chunkText(s.text, max /*, overlap */);

    // normalize to string[]
    const parts = partsRaw.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).filter(Boolean);

    parts.forEach((p: string, idx: number) => {
      chunks.push({
        text: p,
        meta: { brand, sourceType: s.type || "other", position: idx, ...baseMeta }
      });
    });
  }

  if (chunks.length === 0) return { added: 0, ids: [] };

  // 2) Embed
  const embeddings = await embedTexts(chunks.map(c => c.text));

  // 3) Store
  const ids = await vectorRepo.addMany(
    brand,
    chunks.map((c, i) => ({ text: c.text, embedding: embeddings[i], meta: c.meta }))
  );

  return { added: ids.length, ids };
}
export async function vectorSearch(brand: string, q: string, k = 6) {
  // 1) embed the query
  const [qv] = await embedTexts([q]);

  // 2) load brand vectors
  const pool = await vectorRepo.getByBrand(brand);

  // 3) score
  const scored = pool.map(r => ({
    id: r.id,
    text: r.text,
    score: cosine(qv, r.vector),   // NOTE: repo uses `vector` field
    createdAt: r.createdAt,
  }));

  // 4) sort + slice
  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const hits = scored.slice(0, Math.max(1, k));

  log("vector.search", { brand, k, pool: pool.length });
  return hits;
}

// vectorSearch(brand, q, k) already exists in your file.