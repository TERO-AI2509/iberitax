import type { Readable } from "node:stream";

export type PutMeta = { contentType?: string; size?: number };

export interface StorageAdapter {
  putStream(key: string, body: Readable, meta?: PutMeta): Promise<{ ok: true } | { ok: false; error: string }>;
  resolveKeyPath?(key: string): string; // Local-only helper to inspect where files are saved
}
