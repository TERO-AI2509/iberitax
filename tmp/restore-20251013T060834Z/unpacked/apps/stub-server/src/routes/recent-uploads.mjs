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
  const ext = path.extname(p).replace(".", "").toLowerCase();
  return EXT_TO_MIME.get(ext) || "application/octet-stream";
}

async function statSafe(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

async function readJSON(p) {
  const txt = await fs.readFile(p, "utf8");
  return JSON.parse(txt);
}

async function hydrateItem(absPath) {
  const rel = path.relative(UPLOAD_ROOT, absPath).split(path.sep).join("/");
  const metaPath = absPath + ".meta.json";
  const hasMeta = fssync.existsSync(metaPath);
  const meta = hasMeta ? await readJSON(metaPath) : null;
  const st = await statSafe(absPath);
  const size = meta && typeof meta.size === "number" ? meta.size : st ? st.size : null;
  const mimeType = meta && meta.mimeType ? meta.mimeType : inferMimeFromExt(absPath);
  const originalName = meta && typeof meta.originalName === "string" ? meta.originalName : null;
  const mtimeMs = st ? st.mtimeMs : null;
  const fileName = path.basename(absPath);
  return {
    key: rel,
    path: rel,
    fileName,
    originalName,
    mimeType,
    size,
    mtimeMs,
    url: `/files/${rel}`,
    dlUrl: `/dl/${rel}`
  };
}

async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...await walk(p));
    } else if (!ent.name.endsWith(".meta.json")) {
      out.push(p);
    }
  }
  return out;
}

function ciIncludes(hay, needle) {
  if (!needle) return true;
  if (hay == null) return false;
  return String(hay).toLowerCase().includes(String(needle).toLowerCase());
}

function parseListParam(val) {
  if (!val) return [];
  return String(val).split(",").map(s => s.trim()).filter(Boolean);
}

function passesMime(mime, allowList) {
  if (!allowList || allowList.length === 0) return true;
  return allowList.some(x => {
    if (x.endsWith("/*")) {
      const pre = x.slice(0, -1);
      return String(mime || "").startsWith(pre.slice(0, -1));
    }
    return String(mime || "").toLowerCase() === x.toLowerCase();
  });
}

function matchExt(nameOrPath, extList) {
  if (!extList || extList.length === 0) return true;
  const n = String(nameOrPath || "").toLowerCase();
  return extList.some(ext => n.endsWith("." + ext.toLowerCase()));
}

function passesExclude(mime, excludeList) {
  if (!excludeList || excludeList.length === 0) return true;
  return !excludeList.some(x => {
    if (x.endsWith("/*")) {
      const pre = x.slice(0, -1);
      return String(mime || "").startsWith(pre.slice(0, -1));
    }
    return String(mime || "").toLowerCase() === x.toLowerCase();
  });
}

function sortItems(items, sortKey, dir) {
  const d = dir === "asc" ? 1 : -1;
  const key = sortKey || "mtime";
  const arr = [...items];
  arr.sort((a,b) => {
    let av, bv;
    if (key === "name") {
      av = String(a.fileName || "").toLowerCase();
      bv = String(b.fileName || "").toLowerCase();
      if (av < bv) return -1 * d;
      if (av > bv) return 1 * d;
      return 0;
    }
    if (key === "size") {
      av = Number(a.size || 0);
      bv = Number(b.size || 0);
      return (av - bv) * d;
    }
    av = Number(a.mtimeMs || 0);
    bv = Number(b.mtimeMs || 0);
    return (av - bv) * d;
  });
  return arr;
}

export function registerRecentUploadsRoute(app) {
  app.get("/recent-uploads", async (req, res) => {
    try {
      const q = String(req.query?.q || "").trim();
      const sort = String(req.query?.sort || "mtime").toLowerCase();
      const dir = String(req.query?.dir || "desc").toLowerCase() === "asc" ? "asc" : "desc";
      const limit = Math.max(0, Math.min(1000, Number(req.query?.limit || 50)));
      const offset = Math.max(0, Number(req.query?.offset || 0));
      const mimeTypes = parseListParam(req.query?.mimeTypes || "");
      const extParam = parseListParam(req.query?.ext || "");
      const excludeList = parseListParam(req.query?.exclude || "");

      const files = fssync.existsSync(UPLOAD_ROOT) ? await walk(UPLOAD_ROOT) : [];
      const hydrated = await Promise.all(files.map(hydrateItem));

      const filtered0 = hydrated.filter(it => {
        const okQ = !q || ciIncludes(it.fileName, q) || ciIncludes(it.originalName, q);
        return okQ;
      });

      const filtered = filtered0.filter(it => {
        const okMime = passesMime(it.mimeType, mimeTypes);
        const okExt = matchExt(it.path || it.fileName, extParam);
        const notExcluded = passesExclude(it.mimeType, excludeList);
        return okMime && okExt && notExcluded;
      });

      const sorted = sortItems(filtered, sort, dir);
      const page = sorted.slice(offset, offset + limit);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(page);
    } catch (err) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(500).json({ ok: false, error: String(err && err.message ? err.message : err) });
    }
  });
}
