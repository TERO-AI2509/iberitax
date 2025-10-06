import { mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const ART = join(ROOT, "artifacts");
const HISTORY_DIR = join(ART, "history");
const EXPORT_CSV = join(ART, "export.summary.csv"); // produced by `smoke:ocr:export`

function isoStamp(d=new Date()) {
  // YYYYMMDD-HHMMSS
  const p = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function ensureDirs() {
  if (!existsSync(ART)) mkdirSync(ART, { recursive: true });
  if (!existsSync(HISTORY_DIR)) mkdirSync(HISTORY_DIR, { recursive: true });
}

function snapshotExportCSV() {
  if (!existsSync(EXPORT_CSV)) {
    console.log("No export.summary.csv found. Run `pnpm -F @iberitax/ocr smoke:ocr:export` first.");
    return null;
  }
  const stamp = isoStamp();
  const runDir = join(HISTORY_DIR, stamp);
  mkdirSync(runDir, { recursive: true });
  const dest = join(runDir, "export.summary.csv");
  copyFileSync(EXPORT_CSV, dest);
  console.log("Snapshotted:", dest);
  return { stamp, path: dest };
}

function listRuns() {
  return readdirSync(HISTORY_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort(); // chronological
}

// expects header containing field name + accuracy columns; keeps it flexible
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(",").map(s => s.trim());
  const rows = lines.slice(1).map(line => line.split(",").map(s => s.trim()));
  return { header, rows };
}

function colIndex(header, regexes) {
  regexes = Array.isArray(regexes) ? regexes : [regexes];
  const low = header.map(h => h.toLowerCase());
  for (let i=0;i<low.length;i++) {
    if (regexes.some(r => new RegExp(r, "i").test(low[i]))) return i;
  }
  return -1;
}

function buildValidationHistory() {
  const runs = listRuns();
  const md = [];
  md.push("# Validation History (Per Field)");
  md.push("");
  md.push("| field | run | accuracy |");
  md.push("|---|---|---:|");

  for (const run of runs) {
    const csvPath = join(HISTORY_DIR, run, "export.summary.csv");
    let csv;
    try { csv = readFileSync(csvPath, "utf8"); } catch { continue; }
    const { header, rows } = parseCSV(csv);
    if (!header.length) continue;

    const fieldIdx = colIndex(header, ["^field$", "name", "column", "campo"]);
    const accIdx   = colIndex(header, ["accuracy", "acc%", "acc", "precision"]); // flexible
    if (fieldIdx === -1 || accIdx === -1) continue;

    for (const r of rows) {
      const field = r[fieldIdx];
      const acc = r[accIdx];
      if (!field || acc == null || acc === "") continue;
      md.push(`| ${String(field).toLowerCase().replace(/\s+/g,"_")} | ${run} | ${acc} |`);
    }
  }

  const outPath = join(ART, "validation_history.md");
  writeFileSync(outPath, md.join("\n"));
  console.log("Wrote", outPath);
}

function main() {
  ensureDirs();
  snapshotExportCSV();
  buildValidationHistory();
}
main();
