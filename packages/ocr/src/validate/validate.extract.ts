import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

  /* FIELD_MAP_DEBUG:START */
  const __MAPDBG = process.env.MAP_DEBUG;
  if (__MAPDBG) {
    console.log('[FIELD_MAP_DEBUG] enabled');
    try {
      const ping = path.resolve(process.cwd(), 'packages/ocr/artifacts/field_map.ping.txt');
      fs.mkdirSync(path.dirname(ping), { recursive: true });
      fs.writeFileSync(ping, String(Date.now()));
    } catch {}
  }
  /* FIELD_MAP_DEBUG:END */
type FieldRule = { type: "string" | "number" | "date" | "pattern"; format?: "YYYY-MM" | "YYYY-MM-DD"; regex?: string };
type FieldMap = { fixture: string; required: Record<string, FieldRule>; optional?: Record<string, FieldRule> };

function readJSON(p: string) { return JSON.parse(fs.readFileSync(p, "utf8")); }

function checkDate(val: string, fmt?: "YYYY-MM" | "YYYY-MM-DD") {
  if (fmt === "YYYY-MM") return /^\d{4}-\d{2}$/.test(val);
  if (!fmt || fmt === "YYYY-MM-DD") return /^\d{4}-\d{2}-\d{2}$/.test(val);
  return false;
}

function validateValue(v: any, r: FieldRule): { ok: boolean; reason?: string } {
  switch (r.type) {
    case "string": return { ok: typeof v === "string" };

    case "number": return { ok: typeof v === "number" && Number.isFinite(v) };

    case "date": return { ok: typeof v === "string" && checkDate(v, r.format), reason: "date format" };

    case "pattern": return { ok: typeof v === "string" && new RegExp(r.regex || "").test(v), reason: "pattern mismatch" };

  }
}

function csvCell(x: any) {
  const s = typeof x === "string" ? x : JSON.stringify(x ?? "");
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

function writeCsv(filePath: string, rows: any[]) {
  const header = ["fixture","field","required","status","value","rule","reason"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push([
      csvCell(r.fixture),
      csvCell(r.field),
      csvCell(String(r.required)),
      csvCell(r.status),
      csvCell(r.value ?? ""),
      csvCell(r.rule ?? {}),
      csvCell(r.reason ?? "")
    ].join(","));
  }
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

function main() {
  const pkgRoot = process.cwd();
  const fieldsDir = path.join(pkgRoot, "src/fields");
  const artifactsDir = path.join(pkgRoot, "artifacts");
  const inputDir = path.join(artifactsDir, "input");
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  const fieldFiles = fs.readdirSync(fieldsDir).filter(f => f.endsWith(".json"));
  const allRows: any[] = [];

  for (const ff of fieldFiles) {
    const fmap = readJSON(path.join(fieldsDir, ff)) as FieldMap;
    const fixture = fmap.fixture;
    const inputPath = path.join(inputDir, `${fixture}.json`);
    if (!fs.existsSync(inputPath)) continue;
    const ocr = readJSON(inputPath);
/* EMIT_VALIDATOR_INPUT */
try {
  // write the first seen OCR input as a debug map
  const __base = path.join(artifactsDir);
  fs.mkdirSync(__base, { recursive: true });
  const __map = path.join(__base, 'field_map.debug.json');
  if (!fs.existsSync(__map)) {
    fs.writeFileSync(__map, JSON.stringify(ocr, null, 2));
  }
  // also expose for other steps if needed
  // @ts-ignore
  (globalThis as any).__lastValidateResult = { fieldMap: ocr };
} catch {}
const rows: any[] = [];
    for (const [field, rule] of Object.entries(fmap.required)) {
      const present = Object.prototype.hasOwnProperty.call(ocr, field);
      let ok = false, reason = "";
      if (present) {
        const res = validateValue(ocr[field], rule);
        ok = !!res.ok;
        if (!res.ok) reason = res.reason || "";
      } else {
        reason = "missing";
      }
      rows.push({ fixture, field, required: true, status: ok ? "OK" : "FAIL", value: ocr[field], rule, ...(reason ? { reason } : {}) });
    }
    for (const [field, rule] of Object.entries(fmap.optional || {})) {
      if (!Object.prototype.hasOwnProperty.call(ocr, field)) continue;
      const res = validateValue(ocr[field], rule);
      rows.push({ fixture, field, required: false, status: res.ok ? "OK" : "FAIL", value: ocr[field], rule, ...(res.ok ? {} : { reason: res.reason }) });
    }
    allRows.push(...rows);

    writeCsv(path.join(artifactsDir, `validation_report.${fixture}.csv`), rows);

    const okCount = rows.filter(r => r.status === "OK").length;
    const failCount = rows.filter(r => r.status === "FAIL").length;
    const md = `# Validation Summary · ${fixture}- Passed: ${okCount}- Failed: ${failCount}`;
    fs.writeFileSync(path.join(artifactsDir, `validation_report.${fixture}.md`), md, "utf8");
  }

  writeCsv(path.join(artifactsDir, "validation_report.all.csv"), allRows);
}

main();
