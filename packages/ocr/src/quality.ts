import { runFixtureQuality, runFixtureQualityWithStages } from "./quality.report.js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);
  const mode = String(process.env.PRE_MODE || "fixed").toLowerCase();
  const outDir = join(__dirname, "..", "artifacts", `step09-${mode}-${stamp}`);
  mkdirSync(outDir, { recursive: true });
  const res = await runFixtureQuality(outDir);
  await runFixtureQualityWithStages(outDir);
  writeFileSync(join(outDir, "console.txt"), res.console, "utf8");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
