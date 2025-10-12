"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VECTORS_DIR = exports.BRANDS_DIR = exports.DATA_DIR = exports.ROOT = void 0;
const path_1 = __importDefault(require("path"));
exports.ROOT = process.cwd();
exports.DATA_DIR = path_1.default.join(exports.ROOT, "data");
exports.BRANDS_DIR = path_1.default.join(exports.DATA_DIR, "brands");
exports.VECTORS_DIR = path_1.default.join(exports.ROOT, "vectors");
