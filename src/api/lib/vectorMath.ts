export function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
export function norm(a: number[]) { return Math.sqrt(dot(a, a)); }
export function cosineSimilarity(a: number[], b: number[]) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  return dot(a, b) / (na * nb);
}
// Simple cosine similarity
export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const ai = a[i], bi = b[i];
    dot += ai * bi;
    na  += ai * ai;
    nb  += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}