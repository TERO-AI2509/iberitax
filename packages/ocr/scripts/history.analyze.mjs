import fs from "fs";
import path from "path";

const PKG = process.cwd();
const HIST_DIR = path.join(PKG, "artifacts/history");
const OUT_TREND = path.join(PKG, "artifacts/validation_trend.md");
const OUT_HISTORY = path.join(PKG, "artifacts/validation_history.md");

fs.mkdirSync(path.dirname(OUT_TREND), { recursive: true });
fs.mkdirSync(HIST_DIR, { recursive: true });

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { isoYear: d.getUTCFullYear(), weekNo };
}
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines.shift().split(",").map(s => s.trim());
  return lines.filter(Boolean).map(line => {
    const cells = line.split(",").map(s => s.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = cells[i]);
    return obj;
  });
}
const toNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : NaN;
};
const validNums = (...ns) => ns.every(Number.isFinite);

function loadRows() {
  if (!fs.existsSync(HIST_DIR)) return [];
  const files = fs.readdirSync(HIST_DIR).filter(f => f.endsWith(".csv")).sort();
  const rows = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(HIST_DIR, f), "utf8");
    for (const r of parseCSV(text)) rows.push(r);
  }
  return rows;
}

const rows = loadRows();
const weekly = new Map();
const series = [];
let seq = 0; // fallback ordering when timestamps are bad or missing

for (const r of rows) {
  let ts = new Date(r.timestamp || r.time || r.date || "");
  if (isNaN(ts.getTime())) ts = new Date(++seq); // monotonic fallback

  const { isoYear, weekNo } = isoWeek(ts);
  const key = `${isoYear}-W${String(weekNo).padStart(2,"0")}`;

  const total = toNum(r.total ?? r.cases ?? r.count);
  const passed = toNum(r.passed ?? r.ok ?? r.success);
  const failed = toNum(r.failed ?? r.errors ?? r.fail);
  const diff = toNum(r.diff ?? r.delta ?? r.change);

  // Series value: prefer (total - failed) when valid, else skip
  if (validNums(total, failed)) series.push({ ts, val: total - failed });

  const cur = weekly.get(key) || { count: 0, maxDiff: 0, last: null };
  cur.count += 1;
  if (Number.isFinite(diff)) cur.maxDiff = Math.max(cur.maxDiff, Math.abs(diff));

  // Only set "last" when we have valid totals; prefer the most recent ts
  if (validNums(total, passed, failed)) {
    if (!cur.last || ts > cur.last.ts) {
      cur.last = { ts, total, passed, failed };
    }
  }
  weekly.set(key, cur);
}

// Sparkline
function spark(values){
  if (values.length < 2) return "_insufficient data for sparkline_";
  const blocks=["▁","▂","▃","▄","▅","▆","▇","█"];
  const min=Math.min(...values), max=Math.max(...values), span=Math.max(1,max-min);
  return values.map(v => blocks[Math.min(blocks.length-1, Math.floor(((v-min)/span)*(blocks.length-1)))]).join("");
}
const trendValues = series.sort((a,b)=>a.ts-b.ts).map(p=>p.val).slice(-30);
const trend = spark(trendValues);
fs.writeFileSync(OUT_TREND, `# Validation Trend\n\n${trend}\n`, "utf8");

// History
let md = `# Validation History (ISO Weeks)\n\n`;
if (weekly.size === 0) {
  md += `_no weekly stats yet — add CSV files under packages/ocr/artifacts/history/_\n`;
} else {
  const ordered = Array.from(weekly.entries()).sort(([a],[b])=>a.localeCompare(b));
  for (const [key, info] of ordered) {
    const last = info.last;
    md += `## ${key}\n\n`;
    md += `- Runs: ${info.count}\n`;
    md += `- Max diff: ${info.maxDiff}\n`;
    if (last) {
      md += `- Last totals: ${last.passed}/${last.total} passed, failed=${last.failed}\n\n`;
    } else {
      md += `- Last totals: _no valid rows_\n\n`;
    }
  }
}
fs.writeFileSync(OUT_HISTORY, md, "utf8");
console.log("[history.analyze] wrote", OUT_TREND, "and", OUT_HISTORY);
