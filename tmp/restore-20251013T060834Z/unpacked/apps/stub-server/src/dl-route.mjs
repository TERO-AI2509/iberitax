import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, "../uploads");

export function registerDownloadRoute(app) {
  app.get("/dl/:yyyy/:mm/:dd/:file", (req, res) => {
    const { yyyy, mm, dd, file } = req.params;
    const rel = path.join(yyyy, mm, dd, file);
    const abs = path.join(UPLOAD_ROOT, rel);
    if (!fs.existsSync(abs)) {
      res.status(404).send("Not found");
      return;
    }
    const lower = file.toLowerCase();
    if (lower.endsWith(".pdf")) res.type("application/pdf");
    else res.type("application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(abs);
  });
}
