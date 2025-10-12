import type { IncomingMessage, ServerResponse } from "http";

export function ok(res: ServerResponse, data: unknown = {}, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");

  const payload =
    data && typeof data === "object" && !Array.isArray(data)
      ? { ok: true, ...(data as Record<string, unknown>) }
      : { ok: true, data };

  res.end(JSON.stringify(payload));
}

export function fail(
  res: ServerResponse,
  message: string,
  status = 400,
  meta?: unknown
) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");

  const body =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? { ok: false, error: message, ...(meta as Record<string, unknown>) }
      : { ok: false, error: message, meta };

  res.end(JSON.stringify(body));
}

export function methodNotAllowed(res: ServerResponse, methods: string[]) {
  res.setHeader("allow", methods.join(", "));
  return fail(res, `Method Not Allowed. Use: ${methods.join(", ")}`, 405);
}

export async function readJson(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}