import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads");

const EXT_TO_MIME = new Map([
  ["pdf","application/pdf"],
  ["png","image/png"],
  ["jpg","image/jpeg"],
  ["jpeg","image/jpeg"],
  ["gif","image/gif"],
  ["rtf","application/rtf"]
]);

function inferMimeFromExt(p) {
  const ext = path.extname(p).slice(1).toLowerCase();
  return EXT_TO_MIME.get(ext) || "application/octet-stream";
}

async function* walkFiles(dir) {
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries = [];
    try {
      entries = await fs.readdir(cur, { withFileTypes: true });
    } catch {}
    for (const e of entries) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) {
        stack.push(p);
        continue;
      }
      if (e.isFile()) yield p;
    }
  }
}

function isSidecar(p) {
  return p.toLowerCase().endsWith(".meta.json");
}

function sidecarPath(p) {
  return p + ".meta.json";
}

async function fileSize(p) {
  try {
    const st = await fs.stat(p);
    return st.size;
  } catch {
    return null;
  }
}

async function run() {
  let created = 0;
  for await (const p of walkFiles(UPLOAD_ROOT)) {
    if (isSidecar(p)) continue;
    const sc = sidecarPath(p);
    if (fssync.existsSync(sc)) continue;
    const size = await fileSize(p);
    const mimeType = inferMimeFromExt(p);
    const meta = {
      originalName: null,
      mimeType,
      size
    };
    await fs.writeFile(sc, JSON.stringify(meta, null, 2), "utf8");
    created++;
    process.stdout.write(`created: ${path.relative(UPLOAD_ROOT, sc)}\n`);
  }
  process.stdout.write(`done: ${created} sidecars created\n`);
}

await run();
