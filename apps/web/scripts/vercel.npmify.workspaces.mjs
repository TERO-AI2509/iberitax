import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { dirname, relative, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
function findUp(start, filename) {
  let dir = resolve(start);
  while (dir !== "/") {
    const p = resolve(dir, filename);
    if (existsSync(p)) return p;
    dir = dirname(dir);
  }
  return null;
}
const appDir = resolve(__dirname, "..");
const wsFile = findUp(appDir, "pnpm-workspace.yaml");
const repoRoot = dirname(wsFile || appDir);
let patterns = [];
if (wsFile) {
  const raw = readFileSync(wsFile, "utf8");
  const m = raw.match(/packages:\s*([\s\S]*)/);
  if (m) {
    const lines = m[1].split("\n")
      .map(s => s.trim().replace(/^-+\s*/, ""))
      .map(s => s.replace(/^['"]|['"]$/g, ""))
      .filter(s => !!s && !s.startsWith("#"));
    for (const l of lines) if (!l.includes(":")) patterns.push(l);
  }
}
function globDirs(root, pat) {
  if (!pat.includes("*")) return [resolve(root, pat)];
  const base = pat.split("/*")[0];
  const baseDir = resolve(root, base);
  if (!existsSync(baseDir)) return [];
  return readdirSync(baseDir).map(n => resolve(baseDir, n)).filter(p => statSync(p).isDirectory());
}
const packageMap = new Map();
for (const pat of patterns) {
  for (const dir of globDirs(repoRoot, pat)) {
    const pj = resolve(dir, "package.json");
    if (!existsSync(pj)) continue;
    const j = JSON.parse(readFileSync(pj, "utf8"));
    if (j.name) packageMap.set(j.name, dir);
  }
}
function rewriteDeps(obj, fromDir) {
  let changed = false;
  for (const key of ["dependencies","devDependencies","optionalDependencies","peerDependencies"]) {
    const block = obj[key];
    if (!block) continue;
    for (const [name, spec] of Object.entries(block)) {
      if (typeof spec === "string" && spec.startsWith("workspace:")) {
        const target = packageMap.get(name);
        if (!target) continue;
        const rel = relative(fromDir, target);
        block[name] = `file:${rel}`;
        changed = true;
      }
    }
  }
  return changed;
}
const appPkgPath = resolve(appDir, "package.json");
const appPkg = JSON.parse(readFileSync(appPkgPath, "utf8"));
const changed = rewriteDeps(appPkg, appDir);
if (changed) writeFileSync(appPkgPath, JSON.stringify(appPkg, null, 2));
console.log(JSON.stringify({ ok:true, changed }, null, 0));
