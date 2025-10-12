import path from "path";
export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data");
export const BRANDS_DIR = path.join(DATA_DIR, "brands");
export const VECTORS_DIR = path.join(ROOT, "vectors");