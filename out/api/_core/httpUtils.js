"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
exports.methodNotAllowed = methodNotAllowed;
exports.readJson = readJson;
function ok(res, data = {}, status = 200) {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    const payload = data && typeof data === "object" && !Array.isArray(data)
        ? { ok: true, ...data }
        : { ok: true, data };
    res.end(JSON.stringify(payload));
}
function fail(res, message, status = 400, meta) {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    const body = meta && typeof meta === "object" && !Array.isArray(meta)
        ? { ok: false, error: message, ...meta }
        : { ok: false, error: message, meta };
    res.end(JSON.stringify(body));
}
function methodNotAllowed(res, methods) {
    res.setHeader("allow", methods.join(", "));
    return fail(res, `Method Not Allowed. Use: ${methods.join(", ")}`, 405);
}
async function readJson(req) {
    const chunks = [];
    for await (const c of req)
        chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8");
    return raw ? JSON.parse(raw) : {};
}
