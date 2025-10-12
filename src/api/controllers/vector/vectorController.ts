import type { IncomingMessage, ServerResponse } from "http";
import { ok, fail, readJson, methodNotAllowed } from "../../_core/httpUtils";
import { brandSlug } from "../../types/brand/brandTypes";
import { ingestText, ingestBatch, vectorSearch } from "../../services/vector/vectorService";

type SourceItem = { type?: string; text: string };

export const vectorController = {
  // POST /api/server?route=text.ingest
  async ingest(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
    try {
      const body = await readJson(req) as any;

      const brand = String(body.brand || "").toLowerCase();
      const check = brandSlug.safeParse(brand);
      if (!check.success) return fail(res, "Invalid brand slug", 400, check.error.flatten());

      // New shape: { brand, sources: [{type?, text}], options?, meta? }
      const maybeSources = Array.isArray(body?.sources)
        ? (body.sources as SourceItem[]).filter(s => s && typeof s.text === "string" && s.text.trim())
        : null;

      if (maybeSources && maybeSources.length > 0) {
        const options = {
          maxCharsPerChunk: Number(body?.options?.maxCharsPerChunk ?? 900),
          overlap: Number(body?.options?.overlap ?? 120),
        };
        const meta = body?.meta && typeof body.meta === "object" ? body.meta : undefined;

        const result = await ingestBatch(brand, maybeSources, options, meta);
        return ok(res, { brand, ...result });
      }

      // Legacy shape: { brand, text }
      const text = String(body.text || "");
      if (!text.trim()) return fail(res, "Text is required", 400);

      const result = await ingestText(brand, text);
      return ok(res, { brand, ...result });
    } catch (e: any) {
      return fail(res, "Ingest failed", 500, { msg: e?.message });
    }
  },

  // GET /api/server?route=vectors.search&brand=nike&q=...&k=5
  async search(req: IncomingMessage, res: ServerResponse, url: URL) {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    try {
      const brand = String(url.searchParams.get("brand") || "");
      const q = String(url.searchParams.get("q") || "");
      const k = Number(url.searchParams.get("k") || 5);

      const check = brandSlug.safeParse(brand);
      if (!check.success) return fail(res, "Invalid brand slug", 400, check.error.flatten());
      if (!q.trim()) return fail(res, "Query q is required", 400);

      const hits = await vectorSearch(brand, q, isFinite(k) && k > 0 ? k : 5);
      return ok(res, { brand, q, hits });
    } catch (e: any) {
      return fail(res, "Search failed", 500, { msg: e?.message });
    }
  }
};