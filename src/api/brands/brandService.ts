import { listBrands } from "./brandRepo";

export async function getBrandSummaries() {
  const brands = await listBrands();
  return brands.map((b: any) => ({
    slug: b.slug,
    name: b.name,
    colors: b.colors,
    defaults: b.defaults
  }));
}