"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrandFiles = listBrandFiles;
exports.readBrand = readBrand;
exports.listBrands = listBrands;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const paths_1 = require("../_core/paths");
async function listBrandFiles() {
    const files = await fs_extra_1.default.readdir(paths_1.BRANDS_DIR);
    return files.filter(f => f.endsWith(".json"));
}
async function readBrand(slug) {
    const file = path_1.default.join(paths_1.BRANDS_DIR, `${slug}.json`);
    const raw = await fs_extra_1.default.readFile(file, "utf8");
    return JSON.parse(raw);
}
async function listBrands() {
    const files = await listBrandFiles();
    const items = await Promise.all(files.map(async (f) => {
        const raw = await fs_extra_1.default.readFile(path_1.default.join(paths_1.BRANDS_DIR, f), "utf8");
        return JSON.parse(raw);
    }));
    return items;
}
