import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { classifyByRecall, inferErrorTypesFromPhrases, ErrorType } from "./error.taxonomy.js";

type Row = { fixture: string; RAW_recall: string; PRE_recall: string; BEST: string };

function parseCsv(s: string): Row[] {
  const lines = s.trim().split(/\r?\n/);
  const hdr = lines.shift(); if (!hdr) return [];
  const cols = hdr.split(","), idx = (k: string) => cols.indexOf(k);
  return lines.map(line => {
    const c = line.split(",");
    return { fixture: c[idx("fixture")], RAW_recall: c[idx("RAW_recall")], PRE_recall: c[idx("PRE_recall")], BEST: c[idx("BEST")] };
  });
}

function toNumberPercent(s: string): number { const m = /([\d.]+)%/.exec(s || ""); return m ? parseFloat(m[1]) : NaN; }

function loadPhrases(fixture: string): string[] {
  const p = join("packages/ocr/fixtures", fixture + ".phrases.txt");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function classify(fixture: string, rawRecallPct: number, preRecallPct: number): ErrorType {
  const hints = inferErrorTypesFromPhrases(loadPhrases(fixture));
  if (!isNaN(rawRecallPct) && !isNaN(preRecallPct) && preRecallPct + 2 < rawRecallPct) {
    if (hints.has("tokenization")) return "tokenization";
    return "ocr-skip";
  }
  const baseline = Math.max(rawRecallPct, preRecallPct);
  return classifyByRecall(baseline, hints);
}

function run(qualityCsvPath: string, outDir: string) {
  const rows = parseCsv(readFileSync(qualityCsvPath, "utf8"));
  const out: string[] = ["fixture,raw_recall,pre_recall,best,error_type"];
  const md: string[] = ["", "### Error Summary", "", "| Fixture | RAW | PRE | BEST | Error Type |", "|---|---:|---:|:---:|:---|"];
  for (const r of rows) {
    const raw = toNumberPercent(r.RAW_recall);
    const pre = toNumberPercent(r.PRE_recall);
    const err = classify(r.fixture, raw, pre);
    out.push([r.fixture, r.RAW_recall, r.PRE_recall, r.BEST, err].join(","));
    md.push(`| ${r.fixture} | ${r.RAW_recall} | ${r.PRE_recall} | ${r.BEST} | ${err} |`);
  }
  writeFileSync(join(outDir, "error_summary.csv"), out.join("\n"));
  writeFileSync(join(outDir, "error_summary.md"), md.join("\n"));
  process.stdout.write(md.join("\n") + "\n");
}

const q = process.argv[2]; const out = process.argv[3] || ".";
if (!q) { process.stderr.write("usage: node dist/error.summary.js <quality.csv> <outdir>\n"); process.exit(2); }
run(q, out);
