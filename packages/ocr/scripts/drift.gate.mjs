import fs from "node:fs";
import path from "node:path";

const PKG_ROOT = process.cwd();
const ART_DIR = path.join(PKG_ROOT, "artifacts", "drift");
const CSV_PATH = path.join(ART_DIR, "drift_amounts.csv");
const RULES_PATH = path.join(PKG_ROOT, "config", "drift.rules.json");

function readJSONSafe(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}

function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const header = lines.shift().split(",").map(s => s.trim());
  return lines.map(line => {
    const cells = line.split(",").map(s => s.trim());
    const row = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    const field = row.field || row.Field || row.name || row.KEY || "";
    const prev = Number(row.prev ?? row.Prev ?? row.previous ?? row.before ?? "NaN");
    const last = Number(row.last ?? row.Last ?? row.current ?? row.after ?? "NaN");
    const delta = Number(row.delta ?? row["Δ"] ?? row.diff ?? row.change ?? "NaN");
    const support = row.support ? Number(row.support) : (row.Support ? Number(row.Support) : null);
    return { field, prev, last, delta, support, raw: row };
  });
}

function pad(str, n) { return (String(str) + " ".repeat(n)).slice(0, n); }

const rules = readJSONSafe(RULES_PATH, {
  defaults: { rel_drop: -2.0, abs_floor: 80.0 },
  fields: {},
  exempt: [],
  quarantine: [],
  min_support: null
});

if (!fs.existsSync(CSV_PATH)) {
  console.error(`[drift.gate] Missing CSV at ${CSV_PATH}`);
  console.error(`Hint: run "pnpm -F @iberitax/ocr run drift:gen" first to generate artifacts.`);
  process.exit(2);
}

const rows = parseCSV(fs.readFileSync(CSV_PATH, "utf8"));

const offenders = [];
const skipped = [];
const notes = [];

const usingOverrides = Object.keys(rules.fields || {});
if (usingOverrides.length) notes.push(`Per-field overrides: ${usingOverrides.join(", ")}`);
if ((rules.exempt || []).length) notes.push(`Exempt fields: ${rules.exempt.join(", ")}`);
if ((rules.quarantine || []).length) notes.push(`Quarantine fields: ${rules.quarantine.join(", ")}`);
if (rules.min_support) notes.push(`Min support in effect: ${rules.min_support}`);

for (const r of rows) {
  const name = r.field;
  if (!name) continue;

  if (rules.exempt?.includes(name)) {
    skipped.push({ field: name, reason: "exempt" });
    continue;
  }

  if (rules.quarantine?.includes(name)) {
    skipped.push({ field: name, reason: "quarantine" });
    continue;
  }

  if (rules.min_support && r.support !== null && !Number.isNaN(r.support) && r.support < rules.min_support) {
    skipped.push({ field: name, reason: `support<${rules.min_support}` });
    continue;
  }

  const fOverride = rules.fields?.[name] || {};
  const relDrop = (Number.isFinite(fOverride.rel_drop) ? fOverride.rel_drop : rules.defaults.rel_drop);
  const absFloor = (Number.isFinite(fOverride.abs_floor) ? fOverride.abs_floor : rules.defaults.abs_floor);

  const relRuleLabel = Number.isFinite(fOverride.rel_drop) ? "field-override" : "global";
  const absRuleLabel = Number.isFinite(fOverride.abs_floor) ? "field-override" : "global";

  let failed = null;

  if (Number.isFinite(r.delta) && r.delta <= relDrop) {
    failed = { field: name, prev: r.prev, last: r.last, delta: r.delta, rule: `${relRuleLabel}: Δ≤${relDrop}` };
  }
  if (!failed && Number.isFinite(r.last) && r.last < absFloor) {
    failed = { field: name, prev: r.prev, last: r.last, delta: r.delta, rule: `${absRuleLabel}: last<${absFloor}` };
  }

  if (failed) offenders.push(failed);
}

if (notes.length) {
  console.log("# Drift Gate — Digest");
  for (const n of notes) console.log(`- ${n}`);
  console.log("");
}

if (skipped.length) {
  console.log("## Skipped");
  console.log(pad("Field", 30) + pad("Reason", 20));
  for (const s of skipped) console.log(pad(s.field, 30) + pad(s.reason, 20));
  console.log("");
}

if (offenders.length) {
  console.log("## Offenders");
  console.log(pad("Field", 30) + pad("Prev", 10) + pad("Last", 10) + pad("Δ", 8) + "Rule");
  for (const o of offenders) {
    console.log(
      pad(o.field, 30) +
      pad(o.prev ?? "", 10) +
      pad(o.last ?? "", 10) +
      pad(o.delta ?? "", 8) +
      o.rule
    );
  }
  console.error(`\nDrift gate FAILED (${offenders.length} offender(s)).`);
  process.exit(1);
} else {
  console.log("Drift gate passed: no offenders.");
}
