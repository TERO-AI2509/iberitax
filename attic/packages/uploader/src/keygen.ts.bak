import path from "node:path";
import { randomUUID } from "node:crypto";

const EXT_RE = /^[A-Za-z0-9]{1,8}$/;

export function makeStorageKey(opts: { filename: string; now?: Date; uuid?: string }) {
  const now = opts.now ?? new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rawExt = path.extname(opts.filename || "").replace(/^\./, "");
  const ext = EXT_RE.test(rawExt) ? rawExt : "bin";
  const id = opts.uuid ?? randomUUID();
  return `uploads/${y}/${m}/${d}/${id}.${ext}`;
}
