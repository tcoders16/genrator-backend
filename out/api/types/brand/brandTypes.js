"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandSummary = exports.brandGetInput = exports.brandTasteAddInput = exports.brandRegisterInput = exports.brandModel = exports.brandAesthetics = exports.brandSlug = exports.HEX6 = void 0;
exports.normalizeSlug = normalizeSlug;
exports.newBrandDocument = newBrandDocument;
exports.mergeTastes = mergeTastes;
// src/types/brand/brandTypes.ts
const zod_1 = require("zod");
/**
 * Utils
 */
exports.HEX6 = /^#?[0-9A-Fa-f]{6}$/;
/** Normalize a human name to a URL-safe slug (e.g., "Nike Air" -> "nike-air") */
function normalizeSlug(input) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
}
/**
 * Core Schemas
 */
exports.brandSlug = zod_1.z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "slug must contain only lowercase letters, numbers, and dashes");
/** Optional aesthetic pieces you might add over time */
exports.brandAesthetics = zod_1.z
    .object({
    palette: zod_1.z.array(zod_1.z.string().regex(exports.HEX6, "must be hex color e.g. #D4AF37")).default([]).optional(),
    fonts: zod_1.z.array(zod_1.z.string()).default([]).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).default([]).optional(),
    visualRules: zod_1.z
        .object({
        lighting: zod_1.z.string().optional(),
        background: zod_1.z.string().optional(),
        composition: zod_1.z.string().optional()
    })
        .partial()
        .optional()
})
    .partial();
/** Full persisted brand document (what lives in data/brands/<slug>.json) */
exports.brandModel = zod_1.z.object({
    slug: exports.brandSlug,
    name: zod_1.z.string().min(2),
    likes: zod_1.z.array(zod_1.z.string()).default([]),
    dislikes: zod_1.z.array(zod_1.z.string()).default([]),
    notes: zod_1.z.string().default(""),
    // Optional embedding for brand “taste” vector (fill later)
    embedding: zod_1.z.array(zod_1.z.number()).optional(),
    // Optional aesthetics (palette, fonts, etc.)
    ...exports.brandAesthetics.shape,
    // Timestamps for bookkeeping
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional()
});
/**
 * DTOs (Inputs/Outputs)
 */
// Register/Upsert a brand (controller → service)
exports.brandRegisterInput = zod_1.z.object({
    slug: exports.brandSlug, // provide already-normalized slug or use normalizeSlug()
    name: zod_1.z.string().min(2),
    likes: zod_1.z.array(zod_1.z.string()).optional(),
    dislikes: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
    // Optional aesthetics on registration
    palette: zod_1.z.array(zod_1.z.string().regex(exports.HEX6)).optional(),
    fonts: zod_1.z.array(zod_1.z.string()).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    visualRules: zod_1.z
        .object({
        lighting: zod_1.z.string().optional(),
        background: zod_1.z.string().optional(),
        composition: zod_1.z.string().optional()
    })
        .partial()
        .optional()
});
// Add tastes (append likes/dislikes)
exports.brandTasteAddInput = zod_1.z.object({
    slug: exports.brandSlug,
    likes: zod_1.z.array(zod_1.z.string()).optional(),
    dislikes: zod_1.z.array(zod_1.z.string()).optional()
});
// Query: get by slug
exports.brandGetInput = zod_1.z.object({
    slug: exports.brandSlug
});
// Response summary for list endpoints
exports.brandSummary = zod_1.z.object({
    slug: exports.brandSlug,
    name: zod_1.z.string(),
    likesCount: zod_1.z.number().int().nonnegative(),
    dislikesCount: zod_1.z.number().int().nonnegative()
});
/**
 * Helpers to build safe documents
 */
function newBrandDocument(input) {
    const now = new Date().toISOString();
    const base = {
        slug: input.slug,
        name: input.name,
        likes: input.likes ?? [],
        dislikes: input.dislikes ?? [],
        notes: input.notes ?? "",
        palette: input.palette ?? [],
        fonts: input.fonts ?? [],
        keywords: input.keywords ?? [],
        visualRules: input.visualRules ?? {},
        createdAt: now,
        updatedAt: now
    };
    return exports.brandModel.parse(base);
}
function mergeTastes(existing, add) {
    const mergedLikes = Array.from(new Set([...(existing.likes ?? []), ...(add.likes ?? [])]));
    const mergedDislikes = Array.from(new Set([...(existing.dislikes ?? []), ...(add.dislikes ?? [])]));
    const updated = {
        ...existing,
        likes: mergedLikes,
        dislikes: mergedDislikes,
        updatedAt: new Date().toISOString()
    };
    return exports.brandModel.parse(updated);
}
