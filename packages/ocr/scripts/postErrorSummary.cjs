const fs = require("fs");
const path = require("path");
const cp = require("child_process");

function walk(dir, acc = []) {
  for (const f of fs.readdirSync(dir)) {
    const q = path.join(dir, f);
    const s = fs.statSync(q);
    s.isDirectory() ? walk(q, acc) : acc.push(q);
  }
  return acc;
}

(function main() {
  const packageDir = path.resolve(__dirname, "..");
  const artifactsCandidates = [
    path.join(packageDir, "artifacts"),
    path.resolve("packages/ocr/artifacts"),
  ];
  const distCandidates = [
    path.join(packageDir, "dist"),
    path.resolve("packages/ocr/dist"),
  ];

  const artifactsDir = artifactsCandidates.find(fs.existsSync);
  if (!artifactsDir) {
    console.error("No artifacts directory found. Run the harness first.");
    process.exit(2);
  }

  const runs = fs
    .readdirSync(artifactsDir)
    .filter((x) => !x.startsWith("."))
    .map((x) => [x, fs.statSync(path.join(artifactsDir, x)).mtimeMs])
    .sort((a, b) => b[1] - a[1]);

  if (!runs.length) {
    console.error("No artifact runs found in: " + artifactsDir);
    process.exit(2);
  }

  const latestDir = path.join(artifactsDir, runs[0][0]);
  const qualityCsv = path.join(latestDir, "quality.csv");
  if (!fs.existsSync(qualityCsv)) {
    console.error("Missing quality.csv in: " + latestDir);
    process.exit(2);
  }

  const distDir = distCandidates.find(fs.existsSync);
  if (!distDir) {
    console.error("Missing dist directory. Run: pnpm build:ocr");
    process.exit(2);
  }

  const summaryJs = walk(distDir).find((x) => x.endsWith(path.sep + "error.summary.js"));
  if (!summaryJs) {
    console.error("Missing compiled error.summary.js. Run: pnpm build:ocr");
    process.exit(2);
  }

  const res = cp.spawnSync(process.execPath, [summaryJs, qualityCsv, latestDir], { stdio: "inherit" });
  process.exit(res.status || 0);
})();
