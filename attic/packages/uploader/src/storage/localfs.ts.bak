import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import type { StorageAdapter, PutMeta } from "./types.js";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB MVP cap
const ALLOWED_CONTENT_TYPES = new Set(["application/pdf"]);
const KEY_RE = /^uploads\/\d{4}\/\d{2}\/\d{2}\/[A-Za-z0-9-]{8,}\.[A-Za-z0-9]{1,8}$/;

export class LocalFSAdapter implements StorageAdapter {
  private root: string;
  constructor(opts: { rootDir: string }) {
    this.root = path.resolve(opts.rootDir);
  }

  resolveKeyPath(key: string) {
    this.assertKeySafe(key);
    return path.join(this.root, key);
  }

  async putStream(key: string, body: Readable, meta: PutMeta = {}) {
    try {
      this.assertKeySafe(key);
      if (meta.size != null && meta.size > MAX_BYTES) {
        return { ok: false as const, error: `File too large: ${meta.size} > ${MAX_BYTES}` };
      }
      if (meta.contentType && !ALLOWED_CONTENT_TYPES.has(meta.contentType)) {
        return { ok: false as const, error: `Unsupported contentType: ${meta.contentType}` };
      }

      const destPath = this.resolveKeyPath(key);
      const dir = path.dirname(destPath);
      await fsp.mkdir(dir, { recursive: true });

      // Write via a temp file then atomic rename
      const tmp = destPath + ".part";
      await fsp.rm(tmp, { force: true }).catch(() => {});
      const writeStream = fs.createWriteStream(tmp, { flags: "w" });

      let bytes = 0;
      body.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > MAX_BYTES) {
          writeStream.destroy(new Error("stream too large"));
        }
      });

      await pipeline(body, writeStream);

      // Finalize
      await fsp.rename(tmp, destPath);
      return { ok: true as const };
    } catch (err: any) {
      return { ok: false as const, error: String(err?.message ?? err) };
    }
  }

  private assertKeySafe(key: string) {
    if (!KEY_RE.test(key)) {
      throw new Error("invalid key format");
    }
    const absolute = path.resolve(this.root, key);
    if (!absolute.startsWith(this.root + path.sep)) {
      // Prevent traversal
      throw new Error("unsafe key path");
    }
  }
}
