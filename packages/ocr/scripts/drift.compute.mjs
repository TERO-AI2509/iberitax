#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG = path.resolve(__dirname, "..");
const SNAP_DIR = path.join(PKG, "artifacts/export/snapshots");
const OUT_DIR = path.join(PKG, "artifacts/drift");
const OUT = path.join(OUT_DIR, "drift_amounts.csv");

function resolvePathMaybe(p) {
  if (!p) return null;
  if (path.isAbsolute(p)) return p;
  const a = path.join(PKG, p);
  if (fs.existsSync(a)) return a;
  return path.resolve(process.cwd(), p);
}
function listSnapshots() {
  if (!fs.existsSync(SNAP_DIR)) return [];
  return fs.readdirSync(SNAP_DIR)
    .filter(f => f.toLowerCase().endsWith(".csv"))
    .map(f => path.join(SNAP_DIR, f))
    .sort((a,b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
}
function parseCSV(file) {
  const text = fs.readFileSync(file, "utf8").replace(/\r/g, "");
  const lines = text.split("\n").filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(ln => {
    const cols = splitCSVLine(ln);
    const o = {}; headers.forEach((h,i)=> o[h] = (cols[i] ?? "").trim());
    return o;
  });
  return { headers, rows };
}
function splitCSVLine(line) {
  const out = []; let cur=""; let q=false;
  for (let i=0;i<line.length;i++){
    const c=line[i];
    if (c === '"'){ if(q && line[i+1]==='"'){cur+='"'; i++;} else q=!q; }
    else if (c === "," && !q){ out.push(cur); cur=""; }
    else cur += c;
  }
  out.push(cur); return out;
}
function lcMap(row) { return Object.fromEntries(Object.entries(row).map(([k,v]) => [k.toLowerCase(), v])); }
function num(v) {
  if (v == null) return NaN;
  let s = String(v).trim();
  if (!s) return NaN;
  s = s.replace(/\s/g, "");
  if (/,/.test(s) && !/\./.test(s)) s = s.replace(/,/g, ".");
  s = s.replace(/%/g, "");
  const n = Number(s.replace(/[^0-9.+-eE]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}
function indexByField(file) {
  const { rows } = parseCSV(file);
  const map = new Map();
  for (const r of rows) {
    const lr = lcMap(r);
    const field = (lr.field || lr.name || lr.feature || "").trim();
    const accKey = Object.keys(lr).find(k => /(accuracy|acc|score|percent)/.test(k));
    const acc = num(lr[accKey]);
    if (field && Number.isFinite(acc)) map.set(field, acc);
  }
  return map;
}

function main() {
  const snaps = listSnapshots();
  const lastPath = resolvePathMaybe(process.env.LAST_CSV) || snaps[0];
  const prevPath = resolvePathMaybe(process.env.PREV_CSV) || snaps[1];
  if (!lastPath || !prevPath) {
    console.error("Need at least two snapshots.");
    process.exit(2);
  }
  const last = indexByField(lastPath);
  const prev = indexByField(prevPath);

  const fields = new Set([...last.keys(), ...prev.keys()]);
  const rows = [["field","prev","last","delta"]];
  for (const f of Array.from(fields).sort()) {
    const p = prev.get(f);
    const l = last.get(f);
    if (!Number.isFinite(p) || !Number.isFinite(l)) continue;
    rows.push([f, p.toFixed(2), l.toFixed(2), (l - p).toFixed(2)]);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const csv = rows.map(r => r.join(",")).join("\n") + "\n";
  fs.writeFileSync(OUT, csv);
  console.log(`Wrote ${OUT} with ${rows.length - 1} rows.`);
}
main();
