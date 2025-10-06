import { readFileSync, readdirSync, writeFileSync } from "fs";
import { resolve, basename, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const pkgRoot    = resolve(__dirname, "..");                 // packages/ocr
const fixturesDir= resolve(pkgRoot, "tests", "contracts", "fixtures");
const artifactsDir= resolve(pkgRoot, "artifacts");

const f2 = (x) => (x==="" || x==null || Number.isNaN(Number(x)) ? "" : Number(x).toFixed(2));

async function loadValidator() {
  const modUrl = pathToFileURL(resolve(pkgRoot, "dist", "contracts", "validator.js")).toString();
  const mod = await import(modUrl);
  if (typeof mod.validate === "function") return mod.validate;
  throw new Error("validate() not found; did you run the build?");
}

function toRow(sample, data, result) {
  const year = data?.year ?? "";
  const taxId = data?.declarant?.tax_id ?? "";
  const base = f2(data?.totals?.base ?? "");
  const tax  = f2(data?.totals?.tax ?? "");
  const due  = f2(data?.totals?.due ?? "");
  return [sample, year, taxId, base, tax, due, String(result.ok)];
}

function toCsv(rows) {
  return ["sample,year,tax_id,base,tax,due,valid", ...rows.map(r => r.join(","))].join("\n");
}

function toMd(rows) {
  const header = "| sample | year | tax_id | base | tax | due | valid |";
  const sep = "|---|---:|---|---:|---:|---:|---|";
  const body = rows.map(([s,y,t,b,tx,d,v]) =>
    `| ${s} | ${y} | ${t} | ${f2(b)} | ${f2(tx)} | ${f2(d)} | ${v} |`
  ).join("\n");
  return `# Modelo 100 — Validation Summary\n\n${header}\n${sep}\n${body}\n`;
}

async function main() {
  const validate = await loadValidator();
  const files = readdirSync(fixturesDir).filter(f => f.endsWith(".json")).sort();
  const rows = [];
  for (const f of files) {
    const full = resolve(fixturesDir, f);
    const data = JSON.parse(readFileSync(full, "utf8"));
    const result = validate(data);
    rows.push(toRow(basename(f), data, result));
  }
  writeFileSync(resolve(artifactsDir, "validation_current.csv"), toCsv(rows));
  writeFileSync(resolve(artifactsDir, "validation_current.md"), toMd(rows));
  console.log("OK");
}

main().catch(e => { console.error(e); process.exit(1); });
