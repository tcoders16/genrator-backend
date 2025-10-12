import { loadEnv } from "../_core/env";

const ENV = loadEnv();
// Free, solid: 384-dim embeddings
const MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${MODEL}`;

export const EMBED_DIM = 384;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!ENV.HUGGINGFACE_TOKEN) {
    throw new Error("Missing HUGGINGFACE_TOKEN");
  }
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.HUGGINGFACE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: texts })
  });
  if (!res.ok) throw new Error(`HF embeddings error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  // HF returns either number[] or number[][]
  return Array.isArray(json[0]) ? (json as number[][]) : [json as number[]];
}