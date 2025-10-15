import "server-only";
import crypto from "node:crypto";

export function hmacSHA256(key: string, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

export function base64url(buf: Buffer | Uint8Array) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
