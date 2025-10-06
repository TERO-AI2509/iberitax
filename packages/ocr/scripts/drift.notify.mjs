#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG = path.resolve(__dirname, "..");

function resolveCSV() {
  const cand = [
    process.env.CSV,
    path.join(PKG, "artifacts/drift/drift_amounts.csv"),
    path.resolve(process.cwd(), "artifacts/drift/drift_amounts.csv"),
    path.resolve(process.cwd(), "packages/ocr/artifacts/drift/drift_amounts.csv"),
  ].filter(Boolean);
  for (const p of cand) if (fs.existsSync(p)) return p;
  console.error("Input not found. Tried:\n" + cand.map((p) => " - " + p).join("\n"));
  process.exit(2);
}

const CSV = resolveCSV();
const TOP = process.env.TOP ? Number(process.env.TOP) : 5;

function parseCSV(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCSVLine(lines[0]);
  const rows = lines.slice(1).map((ln) => {
    const cols = splitCSVLine(ln);
    const obj = {};
    headers.forEach((h, i) => (obj[h.trim()] = (cols[i] ?? "").trim()));
    return obj;
  });
  return { headers, rows };
}
function splitCSVLine(line) {
  const out = []; let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else { inQ = !inQ; }
    } else if (c === "," && !inQ) { out.push(cur); cur = ""; }
    else { cur += c; }
  }
  out.push(cur);
  return out;
}
function num(v) {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(String(v).replace(/[^0-9.+-eE]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}
function pick(obj, keys) {
  for (const k of keys) for (const h of Object.keys(obj)) if (h.toLowerCase() === k) return obj[h];
  return undefined;
}
function extract(row) {
  const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
  const name = pick(row, ["field", "name", "feature"]) ?? "";
  const lastStr = Object.keys(lower).find((k) => /^(last|current|latest)\b/.test(k)) || "last";
  const prevStr = Object.keys(lower).find((k) => /^prev(ious)?\b/.test(k)) || "prev";
  const deltaStr = Object.keys(lower).find((k) => /(delta|diff|change)/.test(k)) || "delta";
  let last = num(lower[lastStr]);
  let prev = num(lower[prevStr]);
  let delta = num(lower[deltaStr]);
  if (!Number.isFinite(delta) && Number.isFinite(last) && Number.isFinite(prev)) delta = last - prev;
  return { field: String(name || "").trim() || "(unknown)", last, prev, delta };
}
function fmt(n, d = 2) { return Number.isFinite(n) ? n.toFixed(d) : ""; }
function bullet(label, arr) {
  if (!arr.length) return `- ${label}: none`;
  return arr.map((r, i) => `- ${label} ${i + 1}: **${r.field}** (${fmt(r.prev)} → ${fmt(r.last)}; Δ ${fmt(r.delta)})`).join("\n");
}
function main() {
  const raw = fs.readFileSync(CSV, "utf8");
  const { rows } = parseCSV(raw);
  const recs = rows.map(extract).filter((r) => Number.isFinite(r.last) && Number.isFinite(r.prev));

  const regressions = recs.filter(r => Number.isFinite(r.delta) && r.delta < 0)
                          .sort((a, b) => a.delta - b.delta)
                          .slice(0, TOP);
  const improvements = recs.filter(r => Number.isFinite(r.delta) && r.delta > 0)
                           .sort((a, b) => b.delta - a.delta)
                           .slice(0, TOP);

  const avgDelta = recs.length ? recs.reduce((s, r) => s + (Number.isFinite(r.delta) ? r.delta : 0), 0) / recs.length : 0;
  const improved = recs.filter((r) => Number.isFinite(r.delta) && r.delta > 0).length;
  const worsened = recs.filter((r) => Number.isFinite(r.delta) && r.delta < 0).length;

  const lines = [];
  lines.push(`# OCR Drift — Summary`);
  lines.push(`Fields: ${recs.length} · Improved: ${improved} · Regressed: ${worsened} · Avg Δ: ${fmt(avgDelta)}`);
  lines.push(``);
  lines.push(bullet("Top regression", regressions));
  lines.push(``);
  lines.push(bullet("Top improvement", improvements));
  console.log(lines.join("\n"));
}
main();
