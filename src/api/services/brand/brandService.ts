// src/services/brand/brandService.ts
import {
  brandModel,
  type Brand,
  type BrandRegisterInput,
  type BrandTasteAddInput,
  newBrandDocument,
  mergeTastes
} from "../../types/brand/brandTypes";
import {
  readBrand,
  writeBrand,
  listBrands,
  deleteBrand as repoDeleteBrand,
  existsBrand
} from "../../repos/brand/brandRepo";

/**
 * Summaries for list view
 */
export async function getBrandSummaries() {
  const brands = await listBrands();
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
export async function getBrand(slug: string): Promise<Brand> {
  const found = await readBrand(slug);
  if (!found) throw new Error("Brand not found");
  return brandModel.parse(found);
}

/**
 * Create or update a brand document.
 * - If it exists, merge likes/dislikes (deduped) and update name/notes
 * - If not, create a new validated document
 */
export async function registerBrand(input: BrandRegisterInput): Promise<Brand> {
  const existing = await readBrand(input.slug);

  if (!existing) {
    // new document
    const doc = newBrandDocument(input);
    return await writeBrand(doc);
  }

  // merge into existing
  const now = new Date().toISOString();
  const merged: Brand = brandModel.parse({
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

  return await writeBrand(merged);
}

/**
 * Append tastes (likes/dislikes) to an existing brand (deduped).
 */
export async function addTaste(input: BrandTasteAddInput): Promise<Brand> {
  const existing = await readBrand(input.slug);
  if (!existing) throw new Error("Brand not found");
  const merged = mergeTastes(existing, input);
  return await writeBrand(merged);
}

/**
 * Optional: remove a brand entirely
 */
export async function removeBrand(slug: string): Promise<boolean> {
  const present = await existsBrand(slug);
  if (!present) return false;
  return await repoDeleteBrand(slug);
}