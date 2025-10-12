import type { IncomingMessage, ServerResponse } from "http";
import { ok, fail, readJson, methodNotAllowed } from "../../_core/httpUtils";
import {
  brandRegisterInput,
  brandTasteAddInput,
  brandGetInput
} from "../../types/brand/brandTypes";
import {
  getBrandSummaries,
  getBrand,
  registerBrand,
  addTaste,
  removeBrand
} from "../../services/brand/brandService";

export const brandController = {
  // GET /api/server?route=brands.list
  async list(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    try {
      const brands = await getBrandSummaries();
      return ok(res, { brands });
    } catch (e: any) {
      return fail(res, "Unable to list brands", 500, { msg: e?.message });
    }
  },

  // GET /api/server?route=brand.get&slug=nike
  async get(req: IncomingMessage, res: ServerResponse, slugParam?: string | null) {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    const parse = brandGetInput.safeParse({ slug: slugParam ?? "" });
    if (!parse.success) return fail(res, "Invalid slug", 400, parse.error.flatten());

    try {
      const brand = await getBrand(parse.data.slug);
      return ok(res, { brand });
    } catch (e: any) {
      return fail(res, e?.message || "Brand not found", 404);
    }
  },

  // POST /api/server?route=brand.register
  async register(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
    const body = await readJson(req);
    const parsed = brandRegisterInput.safeParse(body);
    if (!parsed.success) return fail(res, "Invalid body", 400, parsed.error.flatten());

    try {
      const brand = await registerBrand(parsed.data);
      return ok(res, { brand }, 201);
    } catch (e: any) {
      return fail(res, "Unable to register brand", 500, { msg: e?.message });
    }
  },

  // POST /api/server?route=brand.taste.add
  async addTaste(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
    const body = await readJson(req);
    const parsed = brandTasteAddInput.safeParse(body);
    if (!parsed.success) return fail(res, "Invalid body", 400, parsed.error.flatten());

    try {
      const brand = await addTaste(parsed.data);
      return ok(res, { brand });
    } catch (e: any) {
      return fail(res, e?.message || "Unable to add taste", 400);
    }
  },

  // DELETE /api/server?route=brand.delete&slug=nike   (optional)
  async remove(req: IncomingMessage, res: ServerResponse, slugParam?: string | null) {
    if (req.method !== "DELETE") return methodNotAllowed(res, ["DELETE"]);
    const parse = brandGetInput.safeParse({ slug: slugParam ?? "" });
    if (!parse.success) return fail(res, "Invalid slug", 400, parse.error.flatten());

    try {
      const deleted = await removeBrand(parse.data.slug);
      if (!deleted) return fail(res, "Brand not found", 404);
      return ok(res, { deleted: true });
    } catch (e: any) {
      return fail(res, "Unable to delete brand", 500, { msg: e?.message });
    }
  }
};