import fs from "node:fs";
import path from "node:path";
import { normalizeFields } from "../norm-index.js";

const SAMPLES_DIR = path.resolve(process.cwd(), "tests/contracts/samples");
const OUT_DIR = path.resolve(process.cwd(), "artifacts");
fs.mkdirSync(OUT_DIR, { recursive: true });

type Rec = { input: any; golden: any };
const files = fs.readdirSync(SAMPLES_DIR).filter(f => f.endsWith(".sample.json"));
let total = 0, passed = 0;
const perField: Record<string,{ok:number;fail:number}> = {};

for (const f of files) {
  const rec: Rec = JSON.parse(fs.readFileSync(path.join(SAMPLES_DIR, f), "utf8"));
  const norm = normalizeFields(rec.input);
  if (!rec.golden) continue; if (!rec.golden) continue; for (const k of Object.keys(rec.golden)) {
    total++;
    const got = String((norm as any)[k] ?? "");
    const exp = String((rec.golden as any)[k] ?? "");
    const ok = got === exp;
    if (ok) passed++;
    perField[k] ??= { ok: 0, fail: 0 };
    perField[k][ok ? "ok" : "fail"]++;
  }
}

const summary = {
  totals: { passed, failed: total - passed, total },
  fields: Object.fromEntries(Object.entries(perField).map(([k,v])=>{
    const pct = (v.ok / (v.ok + v.fail)) * 100;
    return [k, { passed:v.ok, failed:v.fail, pass_rate: Number.isFinite(pct)? Number(pct.toFixed(2)) : null }];
  }))
};

// Write JSON; downstream CSV step reads this
fs.writeFileSync(path.join(OUT_DIR, "validation_summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log("# Validation Summary (Synthetic)\n", JSON.stringify(summary, null, 2));
