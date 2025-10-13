import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads");

function resolveKeySafe(key) {
  const p = path.normalize(key).replace(/^(\.\.[/\\])+/, "");
  const abs = path.resolve(UPLOAD_ROOT, p);
  if (!abs.startsWith(UPLOAD_ROOT)) throw new Error("Invalid key");
  return abs;
}

async function walk(dir) {
  const out = [];
  if (!fssync.existsSync(dir)) return out;
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else if (!ent.name.endsWith(".meta.json")) out.push(p);
  }
  return out;
}

export function registerManageFilesRoutes(app) {
  app.delete("/api/files", async (req, res) => {
    try {
      const key = String(req.query.key || "");
      if (!key) return res.status(400).json({ ok: false, error: "missing key" });
      const abs = resolveKeySafe(key);
      if (!fssync.existsSync(abs)) return res.json({ ok: true, removed: 0 });
      await fs.unlink(abs).catch(() => {});
      const meta = abs + ".meta.json";
      if (fssync.existsSync(meta)) await fs.unlink(meta).catch(() => {});
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json({ ok: true, removed: 1 });
    } catch (err) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(400).json({ ok: false, error: String(err && err.message ? err.message : err) });
    }
  });

  app.post("/api/cleanup", async (req, res) => {
    try {
      const maxAgeDays = Number(req.body?.maxAgeDays || 30);
      const now = Date.now();
      let removed = 0;
      const files = await walk(UPLOAD_ROOT);
      for (const f of files) {
        const st = fssync.existsSync(f) ? fssync.statSync(f) : null;
        if (!st) continue;
        const ageDays = (now - st.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageDays >= maxAgeDays) {
          try { await fs.unlink(f); removed++; } catch {}
          const meta = f + ".meta.json";
          if (fssync.existsSync(meta)) { try { await fs.unlink(meta); } catch {} }
        }
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json({ ok: true, removed, maxAgeDays });
    } catch (err) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(500).json({ ok: false, error: String(err && err.message ? err.message : err) });
    }
  });
}
