"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const httpUtils_1 = require("./httpUtils");
class Router {
    getHandlers = new Map();
    postHandlers = new Map();
    deleteHandlers = new Map(); // optional
    get(key, handler) {
        this.getHandlers.set(key, handler);
    }
    post(key, handler) {
        this.postHandlers.set(key, handler);
    }
    delete(key, handler) {
        this.deleteHandlers.set(key, handler);
    }
    async dispatch(req, res) {
        // Build URL safely (req.url can be null on Node)
        const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
        const route = url.searchParams.get("route") || "";
        if (!route) {
            return (0, httpUtils_1.fail)(res, "Missing 'route' query param", 400);
        }
        const method = (req.method || "GET").toUpperCase();
        let handler;
        if (method === "GET")
            handler = this.getHandlers.get(route);
        else if (method === "POST")
            handler = this.postHandlers.get(route);
        else if (method === "DELETE")
            handler = this.deleteHandlers.get(route);
        if (!handler) {
            // If route exists under some other method, return 405; otherwise 404
            const exists = this.getHandlers.has(route) ||
                this.postHandlers.has(route) ||
                this.deleteHandlers.has(route);
            return exists
                ? (0, httpUtils_1.fail)(res, `Method Not Allowed for route '${route}'`, 405)
                : (0, httpUtils_1.fail)(res, `Route not found: '${route}'`, 404);
        }
        await handler(req, res, url);
    }
}
exports.Router = Router;
