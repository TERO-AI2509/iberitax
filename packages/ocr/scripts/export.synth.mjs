import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SAMPLES_DIR = path.resolve(ROOT, "tests/contracts/samples");
const OUT_DIR = path.resolve(ROOT, "artifacts");
fs.mkdirSync(OUT_DIR, { recursive: true });

function safeReadJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return null; }
}
function listSamples() {
  if (!fs.existsSync(SAMPLES_DIR)) return [];
  return fs.readdirSync(SAMPLES_DIR).filter(f => f.endsWith(".sample.json"));
}

const samples = listSamples();
let total = 0, passed = 0;
const perField = new Map();
function setFieldStat(k, ok) {
  if (!perField.has(k)) perField.set(k, { ok: 0, fail: 0 });
  perField.get(k)[ok ? "ok" : "fail"]++;
}

// IMPORTANT: use compiled module
const { normalizeFields } = await import("../dist/norm-index.js");

for (const f of samples) {
  const rec = safeReadJSON(path.join(SAMPLES_DIR, f));
  if (!rec || typeof rec !== "object") continue;
  const input  = (rec && rec.input)  || {};
  const golden = (rec && rec.golden) || {};
  const norm = normalizeFields(input);
  for (const k of Object.keys(golden)) {
    const got = String(norm?.[k] ?? "");
    const exp = String(golden[k] ?? "");
    const ok  = got === exp;
    total++; if (ok) passed++;
    setFieldStat(k, ok);
  }
}

const fieldsObj = {};
for (const [k, v] of perField.entries()) {
  const denom = v.ok + v.fail;
  const pct = denom ? +( (v.ok / denom) * 100 ).toFixed(2) : null;
  fieldsObj[k] = { passed: v.ok, failed: v.fail, pass_rate: pct };
}

const summary = {
  totals: { passed, failed: total - passed, total },
  fields: fieldsObj
};

fs.writeFileSync(path.join(OUT_DIR, "validation_summary.json"), JSON.stringify(summary, null, 2), "utf8");

// CSV that history/drift pipeline consumes
const rows = Object.entries(fieldsObj).map(([field, st]) => ({ field, pass_rate: st.pass_rate ?? "" }));
const header = "field,pass_rate\n";
const body = rows.map(r => `${r.field},${r.pass_rate}`).join("\n") + (rows.length ? "\n" : "");
fs.writeFileSync(path.join(OUT_DIR, "export.summary.csv"), header + body, "utf8");

console.log("# Synthetic Validation Summary");
console.log(JSON.stringify(summary, null, 2));
console.log("Wrote:", path.join(OUT_DIR, "export.summary.csv"));
