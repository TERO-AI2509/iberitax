import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, "../uploads");

const exts = ["pdf","rtf","jpg","jpeg","png","gif","bin"];

export function registerResolveRoute(app) {
  app.get("/resolve", (req, res) => {
    const key = String(req.query.key || "");
    if (!key || key.includes("..")) {
      res.status(400).json({ ok: false, error: "bad key" });
      return;
    }
    const abs0 = path.join(UPLOAD_ROOT, key);
    if (fs.existsSync(abs0)) {
      const url = `/files/${key}`;
      const dl = `/dl/${key}`;
      res.json({ ok: true, path: key, fileUrl: url, dlUrl: dl });
      return;
    }
    const base = key.replace(/\/([^\/]+)$/, (m, f) => {
      const i = f.lastIndexOf(".");
      return "/" + (i >= 0 ? f.slice(0, i) : f);
    });
    for (const e of exts) {
      const cand = base + "." + e;
      const abs = path.join(UPLOAD_ROOT, cand);
      if (fs.existsSync(abs)) {
        const url = `/files/${cand}`;
        const dl = `/dl/${cand}`;
        res.json({ ok: true, path: cand, fileUrl: url, dlUrl: dl });
        return;
      }
    }
    res.status(404).json({ ok: false, error: "not found" });
  });
}
