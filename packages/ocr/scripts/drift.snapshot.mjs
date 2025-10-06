#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG = path.resolve(__dirname, "..");
const SNAP_DIR = path.join(PKG, "artifacts/export/snapshots");

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }
function listCsv(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".csv")).map(f => path.join(dir, f));
}
function mtime(p) { return fs.statSync(p).mtimeMs; }
function nowStamp() {
  const d = new Date(); const pad = n => String(n).padStart(2,"0");
  return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"-"+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds());
}
function resolvePathMaybe(p) {
  if (!p) return null;
  if (path.isAbsolute(p)) return p;
  const a = path.join(PKG, p);
  if (fs.existsSync(a)) return a;
  return path.resolve(process.cwd(), p);
}
function findLatestCsv() {
  const candidates = [
    path.join(PKG, "artifacts/export"),
    path.join(PKG, "artifacts/validate"),
    path.join(PKG, "artifacts/quality"),
  ].flatMap(listCsv);
  if (!candidates.length) return null;
  candidates.sort((a,b) => mtime(b) - mtime(a));
  return candidates[0];
}

function main() {
  const explicit = resolvePathMaybe(process.env.SRC_CSV);
  const src = explicit || findLatestCsv();
  if (!src || !fs.existsSync(src)) {
    console.error("No CSV found. Provide SRC_CSV=path/to/your.csv");
    process.exit(2);
  }
  ensureDir(SNAP_DIR);
  const base = path.basename(src).replace(/\.csv$/i,"");
  const dst = path.join(SNAP_DIR, `${nowStamp()}-${base}.csv`);
  fs.copyFileSync(src, dst);
  console.log(`Snapshot saved: ${dst}`);
}
main();
