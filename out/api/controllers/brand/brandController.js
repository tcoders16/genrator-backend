"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandController = void 0;
const httpUtils_1 = require("../../_core/httpUtils");
const brandTypes_1 = require("../../types/brand/brandTypes");
const brandService_1 = require("../../services/brand/brandService");
exports.brandController = {
    // GET /api/server?route=brands.list
    async list(req, res) {
        if (req.method !== "GET")
            return (0, httpUtils_1.methodNotAllowed)(res, ["GET"]);
        try {
            const brands = await (0, brandService_1.getBrandSummaries)();
            return (0, httpUtils_1.ok)(res, { brands });
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, "Unable to list brands", 500, { msg: e?.message });
        }
    },
    // GET /api/server?route=brand.get&slug=nike
    async get(req, res, slugParam) {
        if (req.method !== "GET")
            return (0, httpUtils_1.methodNotAllowed)(res, ["GET"]);
        const parse = brandTypes_1.brandGetInput.safeParse({ slug: slugParam ?? "" });
        if (!parse.success)
            return (0, httpUtils_1.fail)(res, "Invalid slug", 400, parse.error.flatten());
        try {
            const brand = await (0, brandService_1.getBrand)(parse.data.slug);
            return (0, httpUtils_1.ok)(res, { brand });
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, e?.message || "Brand not found", 404);
        }
    },
    // POST /api/server?route=brand.register
    async register(req, res) {
        if (req.method !== "POST")
            return (0, httpUtils_1.methodNotAllowed)(res, ["POST"]);
        const body = await (0, httpUtils_1.readJson)(req);
        const parsed = brandTypes_1.brandRegisterInput.safeParse(body);
        if (!parsed.success)
            return (0, httpUtils_1.fail)(res, "Invalid body", 400, parsed.error.flatten());
        try {
            const brand = await (0, brandService_1.registerBrand)(parsed.data);
            return (0, httpUtils_1.ok)(res, { brand }, 201);
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, "Unable to register brand", 500, { msg: e?.message });
        }
    },
    // POST /api/server?route=brand.taste.add
    async addTaste(req, res) {
        if (req.method !== "POST")
            return (0, httpUtils_1.methodNotAllowed)(res, ["POST"]);
        const body = await (0, httpUtils_1.readJson)(req);
        const parsed = brandTypes_1.brandTasteAddInput.safeParse(body);
        if (!parsed.success)
            return (0, httpUtils_1.fail)(res, "Invalid body", 400, parsed.error.flatten());
        try {
            const brand = await (0, brandService_1.addTaste)(parsed.data);
            return (0, httpUtils_1.ok)(res, { brand });
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, e?.message || "Unable to add taste", 400);
        }
    },
    // DELETE /api/server?route=brand.delete&slug=nike   (optional)
    async remove(req, res, slugParam) {
        if (req.method !== "DELETE")
            return (0, httpUtils_1.methodNotAllowed)(res, ["DELETE"]);
        const parse = brandTypes_1.brandGetInput.safeParse({ slug: slugParam ?? "" });
        if (!parse.success)
            return (0, httpUtils_1.fail)(res, "Invalid slug", 400, parse.error.flatten());
        try {
            const deleted = await (0, brandService_1.removeBrand)(parse.data.slug);
            if (!deleted)
                return (0, httpUtils_1.fail)(res, "Brand not found", 404);
            return (0, httpUtils_1.ok)(res, { deleted: true });
        }
        catch (e) {
            return (0, httpUtils_1.fail)(res, "Unable to delete brand", 500, { msg: e?.message });
        }
    }
};
