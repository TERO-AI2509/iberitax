import fs from "node:fs";
import path from "node:path";
const OUT_DIR = path.resolve(process.cwd(), "artifacts");
const json = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "validation_summary.json"), "utf8"));
const rows = Object.entries(json.fields).map(([field, st]) => ({
  field, pass_rate: st.pass_rate
}));
const header = "field,pass_rate\n";
const body = rows.map(r => `${r.field},${r.pass_rate}`).join("\n") + "\n";
fs.writeFileSync(path.join(OUT_DIR, "validation_summary.csv"), header + body, "utf8");
console.log("Wrote", path.join(OUT_DIR, "validation_summary.csv"));
