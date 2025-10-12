import { uid } from "./utils";

export type Chunk = { id: string; text: string };

/** Sentence-ish chunker with ~500 char windows. */
export function chunkText(input: string, maxLen = 500): Chunk[] {
  const cleaned = (input || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = cleaned.split(/(?<=[.!?])\s+/);

  const chunks: Chunk[] = [];
  let buf = "";

  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxLen) {
      if (buf) chunks.push({ id: uid(), text: buf.trim() });
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf) chunks.push({ id: uid(), text: buf.trim() });

  if (chunks.length === 0 && cleaned.length > maxLen) {
    for (let i = 0; i < cleaned.length; i += maxLen) {
      chunks.push({ id: uid(), text: cleaned.slice(i, i + maxLen) });
    }
  }
  return chunks;
}