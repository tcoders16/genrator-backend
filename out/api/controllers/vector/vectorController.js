"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorController = void 0;
const httpUtils_1 = require("../../_core/httpUtils");
const brandTypes_1 = require("../../types/brand/brandTypes");
const vectorService_1 = require("../../services/vector/vectorService");
exports.vectorController = {
    // POST /api/server?route=text.ingest
    async ingest(req, res) {
        if (req.method !== "POST")
            return (0, httpUtils_1.methodNotAllowed)(res, ["POST"]);
        try {
            const body = await (0, httpUtils_1.readJson)(req);
            const brand = String(body.brand || "").toLowerCase();
            const check = brandTypes_1.brandSlug.safeParse(brand);
            if (!check.success)
                return (0, httpUtils_1.fail)(res, "Invalid brand slug", 400, check.error.flatten());
            // New shape: { brand, sources: [{type?, text}], options?, meta? }
            const maybeSources = Array.isArray(body?.sources)
                ? body.sources.filter(s => s && typeof s.text === "string" && s.text.trim())
                : null;
            if (maybeSources && maybeSources.length > 0) {
                const options = {
                    maxCharsPerChunk: Number(body?.options?.maxCharsPerChunk ?? 900),
                    overlap: Number(body?.options?.overlap ?? 120),
                };
                const meta = body?.meta && typeof body.meta === "object" ? body.meta : undefined;
                const result = await (0, vectorService_1.ingestBatch)(brand, maybeSources, options, meta);
                return (0, httpUtils_1.ok)(res, { brand, ...result });
            }
            // Legacy shape: { brand, text }
            const text = String(body.text || "");
            if (!text.trim())
                return (0, httpUtils_1.fail)(res, "Text is required", 400);
            const result = await (0, vectorService_1.ingestText)(brand, text);
            return (0, httpUtils_1.ok)(res, { brand, ...result });
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, "Ingest failed", 500, { msg: e?.message });
        }
    },
    // GET /api/server?route=vectors.search&brand=nike&q=...&k=5
    async search(req, res, url) {
        if (req.method !== "GET")
            return (0, httpUtils_1.methodNotAllowed)(res, ["GET"]);
        try {
            const brand = String(url.searchParams.get("brand") || "");
            const q = String(url.searchParams.get("q") || "");
            const k = Number(url.searchParams.get("k") || 5);
            const check = brandTypes_1.brandSlug.safeParse(brand);
            if (!check.success)
                return (0, httpUtils_1.fail)(res, "Invalid brand slug", 400, check.error.flatten());
            if (!q.trim())
                return (0, httpUtils_1.fail)(res, "Query q is required", 400);
            const hits = await (0, vectorService_1.vectorSearch)(brand, q, isFinite(k) && k > 0 ? k : 5);
            return (0, httpUtils_1.ok)(res, { brand, q, hits });
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, "Search failed", 500, { msg: e?.message });
        }
    }
};
