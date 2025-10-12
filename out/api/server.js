"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/server.ts
const http_1 = __importDefault(require("http"));
const env_1 = require("./_core/env");
const router_1 = require("./_core/router");
const logger_1 = require("./_core/logger");
const httpUtils_1 = require("./_core/httpUtils");
const brandController_1 = require("./controllers/brand/brandController");
const vectorController_1 = require("./controllers/vector/vectorController");
/** ---------- Helpers ---------- */
function withCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
function wrap(key, fn) {
    return async (req, res, url) => {
        try {
            withCors(res);
            await fn(req, res, url);
        }
        catch (e) {
            (0, logger_1.log)(`${key}.error`, { msg: e?.message, stack: e?.stack });
            (0, httpUtils_1.fail)(res, "Internal Route Error", 500);
        }
    };
}
/** ---------- Handlers ---------- */
async function healthHandler(_req, res) {
    return (0, httpUtils_1.ok)(res, {
        service: "backend",
        status: "healthy",
        node: process.version,
        env: env_1.ENV.NODE_ENV
    });
}
/** ---------- Router ---------- */
const router = new router_1.Router();
// Preflight (CORS)
router.get("options", async (_req, res) => {
    withCors(res);
    res.statusCode = 204;
    res.end();
});
/** Health */
// GET /api/server?route=health
router.get("health", wrap("health", (req, res) => healthHandler(req, res)));
/** Brands */
router.get("brands.list", wrap("brands.list", (req, res) => brandController_1.brandController.list(req, res)));
router.get("brand.get", wrap("brand.get", (req, res, url) => brandController_1.brandController.get(req, res, url.searchParams.get("slug"))));
router.post("brand.register", wrap("brand.register", (req, res) => brandController_1.brandController.register(req, res)));
router.post("brand.taste.add", wrap("brand.taste.add", (req, res) => brandController_1.brandController.addTaste(req, res)));
// If you’ve added delete() in Router, switch this to router.delete(...)
router.post("brand.delete", wrap("brand.delete", (req, res, url) => brandController_1.brandController.remove(req, res, url.searchParams.get("slug"))));
/** Vectors */
router.post("text.ingest", wrap("text.ingest", (req, res) => vectorController_1.vectorController.ingest(req, res)));
router.get("vectors.search", wrap("vectors.search", (req, res, url) => vectorController_1.vectorController.search(req, res, url)));
/** ---------- Server bootstrap ---------- */
const server = http_1.default.createServer(async (req, res) => {
    try {
        withCors(res);
        // Handle raw OPTIONS (no route param)
        if ((req.method || "").toUpperCase() === "OPTIONS") {
            res.statusCode = 204;
            return res.end();
        }
        await router.dispatch(req, res);
    }
    catch (e) {
        (0, logger_1.log)("unhandled.error", { msg: e?.message, stack: e?.stack });
        (0, httpUtils_1.fail)(res, "Internal Server Error", 500);
    }
});
server.listen(env_1.ENV.PORT, () => {
    (0, logger_1.log)("server.started", { port: env_1.ENV.PORT, env: env_1.ENV.NODE_ENV });
});
