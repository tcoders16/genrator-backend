"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dot = dot;
exports.norm = norm;
exports.cosineSimilarity = cosineSimilarity;
exports.cosine = cosine;
function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++)
        s += a[i] * b[i];
    return s;
}
function norm(a) { return Math.sqrt(dot(a, a)); }
function cosineSimilarity(a, b) {
    const na = norm(a), nb = norm(b);
    if (!na || !nb)
        return 0;
    return dot(a, b) / (na * nb);
}
// Simple cosine similarity
function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        const ai = a[i], bi = b[i];
        dot += ai * bi;
        na += ai * ai;
        nb += bi * bi;
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom ? dot / denom : 0;
}
