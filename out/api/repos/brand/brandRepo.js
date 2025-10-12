"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrandFiles = listBrandFiles;
exports.existsBrand = existsBrand;
exports.readBrand = readBrand;
exports.writeBrand = writeBrand;
exports.deleteBrand = deleteBrand;
exports.listBrands = listBrands;
// src/repos/brand/brandRepo.ts
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const paths_1 = require("../../_core/paths");
const brandTypes_1 = require("../../types/brand/brandTypes");
/** Ensure data/brands exists */
async function ensureDir() {
    await fs_extra_1.default.mkdirp(paths_1.BRANDS_DIR);
}
/** Absolute JSON path for a brand */
function filePath(slug) {
    return path_1.default.join(paths_1.BRANDS_DIR, `${slug}.json`);
}
/** List all brand JSON filenames */
async function listBrandFiles() {
    await ensureDir();
    const files = await fs_extra_1.default.readdir(paths_1.BRANDS_DIR);
    return files.filter(f => f.endsWith(".json"));
}
/** Does a brand exist? */
async function existsBrand(slug) {
    await ensureDir();
    return fs_extra_1.default.pathExists(filePath(slug));
}
/** Read & validate brand; returns null if missing */
async function readBrand(slug) {
    await ensureDir();
    const fp = filePath(slug);
    if (!(await fs_extra_1.default.pathExists(fp)))
        return null;
    const raw = await fs_extra_1.default.readFile(fp, "utf8");
    const parsed = JSON.parse(raw);
    return brandTypes_1.brandModel.parse(parsed);
}
/** Atomic write with validation */
async function writeBrand(doc) {
    await ensureDir();
    // validate before write
    const valid = brandTypes_1.brandModel.parse(doc);
    // atomic write: write temp → move
    const fp = filePath(valid.slug);
    const tmp = `${fp}.${Date.now()}.${crypto_1.default.randomBytes(4).toString("hex")}.tmp`;
    await fs_extra_1.default.writeFile(tmp, JSON.stringify(valid, null, 2), "utf8");
    await fs_extra_1.default.move(tmp, fp, { overwrite: true });
    return valid;
}
/** Delete a brand JSON; returns true if deleted */
async function deleteBrand(slug) {
    await ensureDir();
    const fp = filePath(slug);
    if (!(await fs_extra_1.default.pathExists(fp)))
        return false;
    await fs_extra_1.default.remove(fp);
    return true;
}
/** Load & validate all brands */
async function listBrands() {
    const files = await listBrandFiles();
    const results = [];
    for (const f of files) {
        try {
            const raw = await fs_extra_1.default.readFile(path_1.default.join(paths_1.BRANDS_DIR, f), "utf8");
            const obj = JSON.parse(raw);
            results.push(brandTypes_1.brandModel.parse(obj));
        }
        catch (e) {
            // Corrupt file — skip but don’t crash the endpoint.
            // You can hook up structured logging here if desired.
        }
    }
    return results;
}
