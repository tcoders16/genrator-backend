"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = healthHandler;
const os_1 = __importDefault(require("os"));
const httpUtils_1 = require("../_core/httpUtils");
async function healthHandler(_req, res) {
    (0, httpUtils_1.ok)(res, {
        service: "backend",
        status: "healthy",
        node: process.version,
        host: os_1.default.hostname()
    });
}
