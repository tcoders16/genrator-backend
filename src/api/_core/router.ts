// src/api/_core/router.ts
import type { IncomingMessage, ServerResponse } from "http";
import { fail } from "./httpUtils";

export type RouteKey = string;

export type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) => void | Promise<void>;

export class Router {
  private getHandlers = new Map<RouteKey, Handler>();
  private postHandlers = new Map<RouteKey, Handler>();
  private deleteHandlers = new Map<RouteKey, Handler>(); // optional

  get(key: RouteKey, handler: Handler) {
    this.getHandlers.set(key, handler);
  }
  post(key: RouteKey, handler: Handler) {
    this.postHandlers.set(key, handler);
  }
  delete(key: RouteKey, handler: Handler) {
    this.deleteHandlers.set(key, handler);
  }

  async dispatch(req: IncomingMessage, res: ServerResponse) {
    // Build URL safely (req.url can be null on Node)
    const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const route = url.searchParams.get("route") || "";

    if (!route) {
      return fail(res, "Missing 'route' query param", 400);
    }

    const method = (req.method || "GET").toUpperCase();

    let handler: Handler | undefined;
    if (method === "GET") handler = this.getHandlers.get(route);
    else if (method === "POST") handler = this.postHandlers.get(route);
    else if (method === "DELETE") handler = this.deleteHandlers.get(route);

    if (!handler) {
      // If route exists under some other method, return 405; otherwise 404
      const exists =
        this.getHandlers.has(route) ||
        this.postHandlers.has(route) ||
        this.deleteHandlers.has(route);
      return exists
        ? fail(res, `Method Not Allowed for route '${route}'`, 405)
        : fail(res, `Route not found: '${route}'`, 404);
    }

    await handler(req, res, url);
  }
}