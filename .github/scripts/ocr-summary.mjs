import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ART_ROOT = path.join(ROOT, "packages/ocr/artifacts");
const TREND = path.join(ART_ROOT, "validation_trend.md");
const HIST = path.join(ART_ROOT, "validation_history.md");

const trend = fs.existsSync(TREND) ? fs.readFileSync(TREND, "utf8").trim().split(/\r?\n/).slice(-1)[0] : "";
const history = fs.existsSync(HIST) ? fs.readFileSync(HIST, "utf8") : "";
const lastWeekBlock = (history.match(/##\s+[\d-]+W\d{2}[\s\S]*?(?=##\s+|$)/g) || []).pop() || "";
const stats = [];
for (const line of lastWeekBlock.split(/\r?\n/)) {
  if (/Runs:/.test(line) || /Max diff:/.test(line) || /Last totals:/.test(line)) stats.push(line.trim());
}

const summary = [
  `# OCR Validation — Summary`,
  ``,
  `**Trend**`,
  ``,
  "```\n" + (trend || "_insufficient data for sparkline_") + "\n```",
  ``,
  `**Latest Week**`,
  ``,
  stats.join("\n") || "_no weekly stats yet_",
  ``,
  `_Artifacts: validation_trend.md, validation_history.md_`
].join("\n");

const out = process.env.GITHUB_STEP_SUMMARY;
if (out) { fs.appendFileSync(out, summary + "\n"); console.log("Wrote step summary."); }
else { console.log(summary); }
