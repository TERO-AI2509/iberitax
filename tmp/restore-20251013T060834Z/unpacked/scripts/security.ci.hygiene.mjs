#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const wfDir = path.join(".github","workflows");
let warnings = [];

const list = (fs.existsSync(wfDir) ? fs.readdirSync(wfDir) : []).filter(f=>f.endsWith(".yml")||f.endsWith(".yaml"));

for (const f of list) {
  const p = path.join(wfDir, f);
  const t = fs.readFileSync(p,"utf8");
  if (!/permissions:/i.test(t)) warnings.push({ file:f, issue:"missing-permissions-block" });
  const uses = [...t.matchAll(/uses:\s*([^\s@]+)@([^\s#]+)/g)].map(m=>({file:f, action:m[1], ref:m[2]}));
  for (const u of uses) {
    if (/^(main|master|HEAD)$/i.test(u.ref)) warnings.push({ file:f, issue:"un-pinned-action", detail:`${u.action}@${u.ref}` });
  }
  const checkout = [...t.matchAll(/uses:\s*actions\/checkout@([^\s#]+)/g)].length > 0;
  if (checkout && !/persist-credentials:\s*false/i.test(t)) {
    warnings.push({ file:f, issue:"checkout-persist-credentials-default" });
  }
  const plainSecrets = [...t.matchAll(/env:\s*((?:\n\s+[A-Z0-9_]+:\s*.+)+)/g)];
  for (const block of plainSecrets) {
    const lines = block[1].split(/\n/).filter(Boolean);
    for (const ln of lines) {
      const m = ln.match(/^\s*([A-Z0-9_]+):\s*("?)([^"\n]+)\2\s*$/);
      if (!m) continue;
      const val = m[3].trim();
      if (!val) continue;
      if (!/\${{\s*secrets\./.test(val) && /(KEY|SECRET|TOKEN|PASSWORD|WEBHOOK)/.test(m[1])) {
        warnings.push({ file:f, issue:"literal-secret-in-env", key:m[1] });
      }
    }
  }
}

const summary = { ok: warnings.length===0, total:warnings.length, warnings };
if (process.env.GIT_CI) {
  if (warnings.length) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(summary));
  process.exit(0);
}
console.log(JSON.stringify(summary, null, 2));
