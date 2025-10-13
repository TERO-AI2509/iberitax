#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = fs.readdirSync(root).filter(f=>/^\.env(\..+)?$/.test(f));
let problems = [];

for (const f of files) {
  const t = fs.readFileSync(path.join(root,f),"utf8");
  const lines = t.split(/\r?\n/);
  for (const [i,ln] of lines.entries()) {
    if (!ln || /^\s*#/.test(ln)) continue;
    const m = ln.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2];
    if (/(KEY|SECRET|TOKEN|PASSWORD|WEBHOOK)/.test(key) && val && !/^\s*\$\{?{?\w+/.test(val)) {
      problems.push({ file:f, line:i+1, key, issue:"literal-secret-in-dotenv" });
    }
  }
}

const summary = { ok: problems.length===0, total: problems.length, problems };
if (process.env.GIT_CI) {
  if (problems.length) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(summary));
  process.exit(0);
}
console.log(JSON.stringify(summary, null, 2));
