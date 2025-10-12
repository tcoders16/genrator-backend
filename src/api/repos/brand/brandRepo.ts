// src/repos/brand/brandRepo.ts
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { BRANDS_DIR } from "../../_core/paths";
import { brandModel, type Brand } from "../../types/brand/brandTypes";

/** Ensure data/brands exists */
async function ensureDir() {
  await fs.mkdirp(BRANDS_DIR);
}

/** Absolute JSON path for a brand */
function filePath(slug: string) {
  return path.join(BRANDS_DIR, `${slug}.json`);
}

/** List all brand JSON filenames */
export async function listBrandFiles(): Promise<string[]> {
  await ensureDir();
  const files = await fs.readdir(BRANDS_DIR);
  return files.filter(f => f.endsWith(".json"));
}

/** Does a brand exist? */
export async function existsBrand(slug: string): Promise<boolean> {
  await ensureDir();
  return fs.pathExists(filePath(slug));
}

/** Read & validate brand; returns null if missing */
export async function readBrand(slug: string): Promise<Brand | null> {
  await ensureDir();
  const fp = filePath(slug);
  if (!(await fs.pathExists(fp))) return null;

  const raw = await fs.readFile(fp, "utf8");
  const parsed = JSON.parse(raw);
  return brandModel.parse(parsed);
}

/** Atomic write with validation */
export async function writeBrand(doc: Brand): Promise<Brand> {
  await ensureDir();

  // validate before write
  const valid = brandModel.parse(doc);

  // atomic write: write temp → move
  const fp = filePath(valid.slug);
  const tmp = `${fp}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`;

  await fs.writeFile(tmp, JSON.stringify(valid, null, 2), "utf8");
  await fs.move(tmp, fp, { overwrite: true });

  return valid;
}

/** Delete a brand JSON; returns true if deleted */
export async function deleteBrand(slug: string): Promise<boolean> {
  await ensureDir();
  const fp = filePath(slug);
  if (!(await fs.pathExists(fp))) return false;
  await fs.remove(fp);
  return true;
}

/** Load & validate all brands */
export async function listBrands(): Promise<Brand[]> {
  const files = await listBrandFiles();
  const results: Brand[] = [];
  for (const f of files) {
    try {
      const raw = await fs.readFile(path.join(BRANDS_DIR, f), "utf8");
      const obj = JSON.parse(raw);
      results.push(brandModel.parse(obj));
    } catch (e) {
      // Corrupt file — skip but don’t crash the endpoint.
      // You can hook up structured logging here if desired.
    }
  }
  return results;
}