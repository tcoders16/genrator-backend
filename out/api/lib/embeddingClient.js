"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMBED_DIM = void 0;
exports.embedTexts = embedTexts;
const env_1 = require("../_core/env");
const ENV = (0, env_1.loadEnv)();
// Free, solid: 384-dim embeddings
const MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${MODEL}`;
exports.EMBED_DIM = 384;
async function embedTexts(texts) {
    if (!ENV.HUGGINGFACE_TOKEN) {
        throw new Error("Missing HUGGINGFACE_TOKEN");
    }
    const res = await fetch(URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ENV.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: texts })
    });
    if (!res.ok)
        throw new Error(`HF embeddings error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    // HF returns either number[] or number[][]
    return Array.isArray(json[0]) ? json : [json];
}
