"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestText = ingestText;
exports.ingestBatch = ingestBatch;
exports.vectorSearch = vectorSearch;
const chunkText_1 = require("../../lib/chunkText");
const embeddingClient_1 = require("../../lib/embeddingClient");
const vectorRepo = __importStar(require("../../repos/vector/vectorRepo"));
const logger_1 = require("../../_core/logger");
const vectorMath_1 = require("../../lib/vectorMath");
async function ingestText(brand, text) {
    // chunkText might return array of strings or objects with `.text`
    const partsRaw = (0, chunkText_1.chunkText)(text, 900);
    const parts = partsRaw.map((p) => (typeof p === "string" ? p : p.text));
    const embeds = await (0, embeddingClient_1.embedTexts)(parts);
    const ids = await vectorRepo.addMany(brand, parts.map((p, i) => ({
        text: p,
        embedding: embeds[i],
        meta: { brand, sourceType: "other", position: i }
    })));
    (0, logger_1.log)("vector.ingest.single", { brand, chunks: parts.length });
    return { added: ids.length, ids };
}
async function ingestBatch(brand, sources, opts, baseMeta) {
    const max = Number(opts?.maxCharsPerChunk ?? 900);
    const overlap = Number(opts?.overlap ?? 120);
    // 1) Chunk all sources with labels
    const chunks = [];
    for (const s of sources) {
        // Your chunkText might accept (text, max) only. If so, drop overlap.
        const partsRaw = (0, chunkText_1.chunkText)(s.text, max /*, overlap */);
        // normalize to string[]
        const parts = partsRaw.map((p) => (typeof p === "string" ? p : p?.text ?? "")).filter(Boolean);
        parts.forEach((p, idx) => {
            chunks.push({
                text: p,
                meta: { brand, sourceType: s.type || "other", position: idx, ...baseMeta }
            });
        });
    }
    if (chunks.length === 0)
        return { added: 0, ids: [] };
    // 2) Embed
    const embeddings = await (0, embeddingClient_1.embedTexts)(chunks.map(c => c.text));
    // 3) Store
    const ids = await vectorRepo.addMany(brand, chunks.map((c, i) => ({ text: c.text, embedding: embeddings[i], meta: c.meta })));
    return { added: ids.length, ids };
}
async function vectorSearch(brand, q, k = 6) {
    // 1) embed the query
    const [qv] = await (0, embeddingClient_1.embedTexts)([q]);
    // 2) load brand vectors
    const pool = await vectorRepo.getByBrand(brand);
    // 3) score
    const scored = pool.map(r => ({
        id: r.id,
        text: r.text,
        score: (0, vectorMath_1.cosine)(qv, r.vector), // NOTE: repo uses `vector` field
        createdAt: r.createdAt,
    }));
    // 4) sort + slice
    scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const hits = scored.slice(0, Math.max(1, k));
    (0, logger_1.log)("vector.search", { brand, k, pool: pool.length });
    return hits;
}
// vectorSearch(brand, q, k) already exists in your file.
