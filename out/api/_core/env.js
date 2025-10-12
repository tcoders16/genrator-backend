"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
exports.loadEnv = loadEnv;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 8787),
    HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN || "",
    VCDB_DRIVER: process.env.VCDB_DRIVER || "local", // optional for future
    QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333"
};
function loadEnv() {
    return exports.ENV;
}
