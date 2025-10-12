"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandSummaries = getBrandSummaries;
exports.getBrand = getBrand;
exports.registerBrand = registerBrand;
exports.addTaste = addTaste;
exports.removeBrand = removeBrand;
// src/services/brand/brandService.ts
const brandTypes_1 = require("../../types/brand/brandTypes");
const brandRepo_1 = require("../../repos/brand/brandRepo");
/**
 * Summaries for list view
 */
async function getBrandSummaries() {
    const brands = await (0, brandRepo_1.listBrands)();
    return brands.map(b => ({
        slug: b.slug,
        name: b.name,
        likesCount: b.likes?.length ?? 0,
        dislikesCount: b.dislikes?.length ?? 0
    }));
}
/**
 * Fetch a single brand (throws if missing)
 */
async function getBrand(slug) {
    const found = await (0, brandRepo_1.readBrand)(slug);
    if (!found)
        throw new Error("Brand not found");
    return brandTypes_1.brandModel.parse(found);
}
/**
 * Create or update a brand document.
 * - If it exists, merge likes/dislikes (deduped) and update name/notes
 * - If not, create a new validated document
 */
async function registerBrand(input) {
    const existing = await (0, brandRepo_1.readBrand)(input.slug);
    if (!existing) {
        // new document
        const doc = (0, brandTypes_1.newBrandDocument)(input);
        return await (0, brandRepo_1.writeBrand)(doc);
    }
    // merge into existing
    const now = new Date().toISOString();
    const merged = brandTypes_1.brandModel.parse({
        ...existing,
        name: input.name,
        likes: Array.from(new Set([...(existing.likes ?? []), ...(input.likes ?? [])])),
        dislikes: Array.from(new Set([...(existing.dislikes ?? []), ...(input.dislikes ?? [])])),
        notes: input.notes ?? existing.notes ?? "",
        // optional aesthetics if provided on upsert
        palette: input.palette ?? existing.palette,
        fonts: input.fonts ?? existing.fonts,
        keywords: input.keywords ?? existing.keywords,
        visualRules: input.visualRules ?? existing.visualRules,
        updatedAt: now
    });
    return await (0, brandRepo_1.writeBrand)(merged);
}
/**
 * Append tastes (likes/dislikes) to an existing brand (deduped).
 */
async function addTaste(input) {
    const existing = await (0, brandRepo_1.readBrand)(input.slug);
    if (!existing)
        throw new Error("Brand not found");
    const merged = (0, brandTypes_1.mergeTastes)(existing, input);
    return await (0, brandRepo_1.writeBrand)(merged);
}
/**
 * Optional: remove a brand entirely
 */
async function removeBrand(slug) {
    const present = await (0, brandRepo_1.existsBrand)(slug);
    if (!present)
        return false;
    return await (0, brandRepo_1.deleteBrand)(slug);
}
