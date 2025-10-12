import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { VECTORS_DIR } from "../../_core/paths";

export type VectorRecord = {
  id: string;
  brand: string;
  text: string;          // raw text chunk for reference
  vector: number[];      // embedding array
  createdAt: string;
  meta?: Record<string, unknown>;
};

async function ensureDir() {
  await fs.mkdirp(VECTORS_DIR);
}

function filePath(brand: string) {
  return path.join(VECTORS_DIR, `${brand}.json`);
}

/** Load all vector records for a brand */
export async function loadBrandVectors(brand: string): Promise<VectorRecord[]> {
  await ensureDir();
  const fp = filePath(brand);
  if (!(await fs.pathExists(fp))) return [];
  try {
    return JSON.parse(await fs.readFile(fp, "utf8")) as VectorRecord[];
  } catch {
    return [];
  }
}

/** Add multiple vectors and persist to disk */
export async function addMany(
  brand: string,
  items: { text: string; embedding: number[]; meta?: any }[]
): Promise<string[]> {
  const existing = await loadBrandVectors(brand);
  const now = new Date().toISOString();

  const newRecords: VectorRecord[] = items.map((it) => ({
    id: crypto.randomUUID(),
    brand,
    text: it.text,
    vector: it.embedding,
    createdAt: now,
    meta: it.meta || {},
  }));

  const merged = [...existing, ...newRecords];
  await saveBrandVectors(brand, merged);
  return newRecords.map((r) => r.id);
}

/** Overwrite or update records */
export async function upsertBrandVectors(brand: string, items: VectorRecord[]) {
  const existing = await loadBrandVectors(brand);
  const map = new Map(existing.map((x) => [x.id, x]));
  for (const it of items) map.set(it.id, it);

  const merged = Array.from(map.values());
  await saveBrandVectors(brand, merged);
  return merged;
}

/** Save brand vectors to file atomically */
async function saveBrandVectors(brand: string, records: VectorRecord[]) {
  await ensureDir();
  const fp = filePath(brand);
  const tmp = `${fp}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
  await fs.move(tmp, fp, { overwrite: true });
}

/** Fetch in-memory for similarity search */
export async function getByBrand(brand: string): Promise<VectorRecord[]> {
  return loadBrandVectors(brand);
}