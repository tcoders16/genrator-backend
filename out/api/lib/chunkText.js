"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkText = chunkText;
const utils_1 = require("./utils");
/** Sentence-ish chunker with ~500 char windows. */
function chunkText(input, maxLen = 500) {
    const cleaned = (input || "").replace(/\s+/g, " ").trim();
    if (!cleaned)
        return [];
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let buf = "";
    for (const s of sentences) {
        if ((buf + " " + s).trim().length > maxLen) {
            if (buf)
                chunks.push({ id: (0, utils_1.uid)(), text: buf.trim() });
            buf = s;
        }
        else {
            buf = buf ? `${buf} ${s}` : s;
        }
    }
    if (buf)
        chunks.push({ id: (0, utils_1.uid)(), text: buf.trim() });
    if (chunks.length === 0 && cleaned.length > maxLen) {
        for (let i = 0; i < cleaned.length; i += maxLen) {
            chunks.push({ id: (0, utils_1.uid)(), text: cleaned.slice(i, i + maxLen) });
        }
    }
    return chunks;
}
