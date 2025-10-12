import type { IncomingMessage, ServerResponse } from "http";
import os from "os";
import { ok } from "../_core/httpUtils";

export async function healthHandler(_req: IncomingMessage, res: ServerResponse) {
  ok(res, {
    service: "backend",
    status: "healthy",
    node: process.version,
    host: os.hostname()
  });
}