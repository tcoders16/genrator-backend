"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandSummaries = getBrandSummaries;
const brandRepo_1 = require("./brandRepo");
async function getBrandSummaries() {
    const brands = await (0, brandRepo_1.listBrands)();
    return brands.map((b) => ({
        slug: b.slug,
        name: b.name,
        colors: b.colors,
        defaults: b.defaults
    }));
}
