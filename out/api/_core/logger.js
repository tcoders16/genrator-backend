"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
function log(event, meta = {}) {
    console.log(JSON.stringify({ t: new Date().toISOString(), event, ...meta }));
}
