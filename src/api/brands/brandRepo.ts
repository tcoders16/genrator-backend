import fs from "fs-extra";
import path from "path";
import { BRANDS_DIR } from "../_core/paths";

export async function listBrandFiles() {
  const files = await fs.readdir(BRANDS_DIR);
  return files.filter(f => f.endsWith(".json"));
}

export async function readBrand(slug: string) {
  const file = path.join(BRANDS_DIR, `${slug}.json`);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

export async function listBrands() {
  const files = await listBrandFiles();
  const items = await Promise.all(files.map(async f => {
    const raw = await fs.readFile(path.join(BRANDS_DIR, f), "utf8");
    return JSON.parse(raw);
  }));
  return items;
}