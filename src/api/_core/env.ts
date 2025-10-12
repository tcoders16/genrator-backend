import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 8787),
  HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN || "",
  VCDB_DRIVER: process.env.VCDB_DRIVER || "local",   // optional for future
  QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333"
};

export function loadEnv() {
  return ENV;
}