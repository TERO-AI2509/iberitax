import fs from "node:fs";
import path from "node:path";
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
import { gateModelo100 } from "./contract.gate.js";

type Row = Record<string, any>;

const artifactsDir = path.resolve(__dirname, "../../artifacts");
const itemsDir = path.join(artifactsDir, "items");
const csvPath = path.join(artifactsDir, "validation_summary.csv");
const mdPath = path.join(artifactsDir, "validation_summary.md");

function readJSONItems(dir: string): any[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    return { __file: f, raw };
  });
}

function loadCSV(p: string): { headers: string[]; rows: Row[] } {
  const out = { headers: [] as string[], rows: [] as Row[] };
  if (!fs.existsSync(p)) return out;
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return out;
  out.headers = lines[0].split(",");
  out.rows = lines.slice(1).map(line => {
    const cells = line.split(",");
    const r: Row = {};
    out.headers.forEach((h, i) => (r[h] = cells[i] ?? ""));
    return r;
  });
  return out;
}

function saveCSV(p: string, headers: string[], rows: Row[]) {
  const out = [headers.join(",")].concat(
    rows.map(r => headers.map(h => (r[h] ?? "").toString().replace(/[\r\n,]/g, " ")).join(","))
  ).join("\n");
  fs.writeFileSync(p, out);
}

function patchMarkdown(mdPath: string, pass: number, fail: number) {
  const lines = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, "utf8").split(/\r?\n/) : [];
  const idx = lines.findIndex(l => l.toLowerCase().includes("## contract validation"));
  const block = [
    "## Contract validation",
    "",
    `- pass: ${pass}`,
    `- fail: ${fail}`,
    ""
  ];
  if (idx === -1) {
    lines.push("", ...block);
  } else {
    let end = idx + 1;
    while (end < lines.length && !lines[end].startsWith("## ")) end++;
    lines.splice(idx, end - idx, ...block);
  }
  fs.writeFileSync(mdPath, lines.join("\n"));
}

function main() {
  const items = readJSONItems(itemsDir);
  const { headers, rows } = loadCSV(csvPath);

  const haveContractCols = headers.includes("contract_ok") && headers.includes("contract_reason");
  const newHeaders = haveContractCols ? headers : headers.concat(["contract_ok", "contract_reason"]);

  let pass = 0, fail = 0;
  const byFile = new Map(items.map(it => [it.__file, it.raw]));

  const enriched = rows.map(r => {
    const fileKey = r.file || r.filename || r.source || "";
    const raw = byFile.get(fileKey) ?? null;
    const verdict = gateModelo100(raw ?? r);
    if (verdict.ok) pass++; else fail++;
    return { ...r, contract_ok: verdict.ok ? "true" : "false", contract_reason: verdict.reason ?? "" };
  });

  saveCSV(csvPath, newHeaders, enriched);
  patchMarkdown(mdPath, pass, fail);
}

main();
