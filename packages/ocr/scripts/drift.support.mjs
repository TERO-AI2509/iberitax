import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const ART = path.join(ROOT, "artifacts");
const DRIFT_DIR = path.join(ART, "drift");
const HIST_DIR = path.join(ART, "history");

// 1) Build support counts from history CSVs (count rows per field across snapshots)
const support = new Map(); // field -> count
if (fs.existsSync(HIST_DIR)) {
  const runs = fs.readdirSync(HIST_DIR).filter(d => fs.existsSync(path.join(HIST_DIR, d, "export.summary.csv")));
  for (const run of runs) {
    const p = path.join(HIST_DIR, run, "export.summary.csv");
    const txt = fs.readFileSync(p, "utf8").trim();
    const lines = txt.split(/\r?\n/).slice(1); // skip header
    for (const line of lines) {
      if (!line) continue;
      const [field] = line.split(",");
      if (!field) continue;
      support.set(field, (support.get(field) ?? 0) + 1);
    }
  }
}

// 2) Read current drift CSV and merge a Support column
const DRIFT_CSV = path.join(DRIFT_DIR, "drift_amounts.csv");
if (!fs.existsSync(DRIFT_CSV)) {
  console.error("Missing drift CSV:", DRIFT_CSV);
  process.exit(1);
}

const inTxt = fs.readFileSync(DRIFT_CSV, "utf8").trim();
const [hdr, ...rows] = inTxt.split(/\r?\n/);
const cols = hdr.split(",");
const hasSupport = cols.includes("Support");
const outCols = hasSupport ? cols : [...cols, "Support"];

const outRows = rows.map(r => {
  const parts = r.split(",");
  const fieldIdx = cols.indexOf("Field") >= 0 ? cols.indexOf("Field") : 0;
  const field = parts[fieldIdx];
  const sup = support.get(field) ?? "";
  if (hasSupport) {
    const supIdx = cols.indexOf("Support");
    const parts2 = [...parts];
    if (supIdx >= 0) parts2[supIdx] = String(sup);
    return parts2.join(",");
  } else {
    return [...parts, String(sup)].join(",");
  }
});

// 3) Write back the augmented CSV
const outTxt = [outCols.join(","), ...outRows].join("\n") + "\n";
fs.mkdirSync(DRIFT_DIR, { recursive: true });
fs.writeFileSync(DRIFT_CSV, outTxt, "utf8");
console.log("Updated with Support counts:", DRIFT_CSV);
