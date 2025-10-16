#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const spec = JSON.parse(fs.readFileSync("docs/security/secrets.patterns.json","utf8"));
const patterns = spec.rules.map(r=>{
  const flags = r.pattern?.startsWith("(?i)") ? "gi" : "g";
  const pat = r.pattern?.startsWith("(?i)") ? r.pattern.slice(4) : r.pattern;
  return { ...r, re: r.pattern ? new RegExp(pat, flags) : null, fe: r.filename ? new RegExp(r.filename) : null };
});

const ci = !!process.env.GIT_CI;
const root = process.cwd();
const exclude = /(^|\/)(node_modules|\.git)\//;

const walk = p=>{
  const st = fs.statSync(p);
  if (st.isDirectory()) return fs.readdirSync(p).flatMap(f=>walk(path.join(p,f))).filter(x=>!exclude.test(x));
  if (st.isFile()) return [p];
  return [];
};

const files = walk(root);
const findings = [];

for (const f of files) {
  const rel = path.relative(root, f);
  let flagged = false;
  for (const r of patterns) {
    if (r.fe && r.fe.test(path.basename(f))) {
      findings.push({ file: rel, rule: r.id, desc: r.desc, type: "filename" });
      flagged = true;
      continue;
    }
    if (r.re) {
      const txt = fs.readFileSync(f,"utf8");
      if (r.re.test(txt)) {
        findings.push({ file: rel, rule: r.id, desc: r.desc, type: "content" });
        flagged = true;
      }
    }
  }
  if (flagged) continue;
}

const summary = { ok: findings.length === 0, total: findings.length, findings };
if (ci) {
  if (findings.length) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(summary));
  process.exit(0);
}
console.log(JSON.stringify(summary, null, 2));
