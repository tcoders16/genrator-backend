// src/types/brand/brandTypes.ts
import { z } from "zod";

/**
 * Utils
 */
export const HEX6 = /^#?[0-9A-Fa-f]{6}$/;

/** Normalize a human name to a URL-safe slug (e.g., "Nike Air" -> "nike-air") */
export function normalizeSlug(input: string): string {
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
export const brandSlug = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "slug must contain only lowercase letters, numbers, and dashes");

/** Optional aesthetic pieces you might add over time */
export const brandAesthetics = z
  .object({
    palette: z.array(z.string().regex(HEX6, "must be hex color e.g. #D4AF37")).default([]).optional(),
    fonts: z.array(z.string()).default([]).optional(),
    keywords: z.array(z.string()).default([]).optional(),
    visualRules: z
      .object({
        lighting: z.string().optional(),
        background: z.string().optional(),
        composition: z.string().optional()
      })
      .partial()
      .optional()
  })
  .partial();

/** Full persisted brand document (what lives in data/brands/<slug>.json) */
export const brandModel = z.object({
  slug: brandSlug,
  name: z.string().min(2),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  notes: z.string().default(""),
  // Optional embedding for brand “taste” vector (fill later)
  embedding: z.array(z.number()).optional(),
  // Optional aesthetics (palette, fonts, etc.)
  ...brandAesthetics.shape,
  // Timestamps for bookkeeping
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export type Brand = z.infer<typeof brandModel>;

/**
 * DTOs (Inputs/Outputs)
 */

// Register/Upsert a brand (controller → service)
export const brandRegisterInput = z.object({
  slug: brandSlug,                 // provide already-normalized slug or use normalizeSlug()
  name: z.string().min(2),
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  notes: z.string().optional(),
  // Optional aesthetics on registration
  palette: z.array(z.string().regex(HEX6)).optional(),
  fonts: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  visualRules: z
    .object({
      lighting: z.string().optional(),
      background: z.string().optional(),
      composition: z.string().optional()
    })
    .partial()
    .optional()
});
export type BrandRegisterInput = z.infer<typeof brandRegisterInput>;

// Add tastes (append likes/dislikes)
export const brandTasteAddInput = z.object({
  slug: brandSlug,
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional()
});
export type BrandTasteAddInput = z.infer<typeof brandTasteAddInput>;

// Query: get by slug
export const brandGetInput = z.object({
  slug: brandSlug
});
export type BrandGetInput = z.infer<typeof brandGetInput>;

// Response summary for list endpoints
export const brandSummary = z.object({
  slug: brandSlug,
  name: z.string(),
  likesCount: z.number().int().nonnegative(),
  dislikesCount: z.number().int().nonnegative()
});
export type BrandSummary = z.infer<typeof brandSummary>;

/**
 * Helpers to build safe documents
 */
export function newBrandDocument(input: BrandRegisterInput): Brand {
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
  return brandModel.parse(base);
}

export function mergeTastes(existing: Brand, add: BrandTasteAddInput): Brand {
  const mergedLikes = Array.from(new Set([...(existing.likes ?? []), ...(add.likes ?? [])]));
  const mergedDislikes = Array.from(new Set([...(existing.dislikes ?? []), ...(add.dislikes ?? [])]));
  const updated: Brand = {
    ...existing,
    likes: mergedLikes,
    dislikes: mergedDislikes,
    updatedAt: new Date().toISOString()
  };
  return brandModel.parse(updated);
}