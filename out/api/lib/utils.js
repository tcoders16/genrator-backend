"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uid = exports.nowISO = void 0;
const nowISO = () => new Date().toISOString();
exports.nowISO = nowISO;
const uid = () => Math.random().toString(36).slice(2, 10);
exports.uid = uid;
