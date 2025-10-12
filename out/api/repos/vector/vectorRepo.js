"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBrandVectors = loadBrandVectors;
exports.addMany = addMany;
exports.upsertBrandVectors = upsertBrandVectors;
exports.getByBrand = getByBrand;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const paths_1 = require("../../_core/paths");
async function ensureDir() {
    await fs_extra_1.default.mkdirp(paths_1.VECTORS_DIR);
}
function filePath(brand) {
    return path_1.default.join(paths_1.VECTORS_DIR, `${brand}.json`);
}
/** Load all vector records for a brand */
async function loadBrandVectors(brand) {
    await ensureDir();
    const fp = filePath(brand);
    if (!(await fs_extra_1.default.pathExists(fp)))
        return [];
    try {
        return JSON.parse(await fs_extra_1.default.readFile(fp, "utf8"));
    }
    catch {
        return [];
    }
}
/** Add multiple vectors and persist to disk */
async function addMany(brand, items) {
    const existing = await loadBrandVectors(brand);
    const now = new Date().toISOString();
    const newRecords = items.map((it) => ({
        id: crypto_1.default.randomUUID(),
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
async function upsertBrandVectors(brand, items) {
    const existing = await loadBrandVectors(brand);
    const map = new Map(existing.map((x) => [x.id, x]));
    for (const it of items)
        map.set(it.id, it);
    const merged = Array.from(map.values());
    await saveBrandVectors(brand, merged);
    return merged;
}
/** Save brand vectors to file atomically */
async function saveBrandVectors(brand, records) {
    await ensureDir();
    const fp = filePath(brand);
    const tmp = `${fp}.${Date.now()}.${crypto_1.default.randomBytes(4).toString("hex")}.tmp`;
    await fs_extra_1.default.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
    await fs_extra_1.default.move(tmp, fp, { overwrite: true });
}
/** Fetch in-memory for similarity search */
async function getByBrand(brand) {
    return loadBrandVectors(brand);
}
