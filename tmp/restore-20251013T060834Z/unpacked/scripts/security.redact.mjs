#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const rules = JSON.parse(fs.readFileSync("docs/security/redaction.rules.json","utf8")).rules;
const strategies = JSON.parse(fs.readFileSync("docs/security/redaction.rules.json","utf8")).strategies;
const applyWrite = !!process.env.APPLY;
const ciMode = !!process.env.GIT_CI;
const targets = process.argv.slice(2);
if (!targets.length) {
  console.error("Usage: node scripts/security.redact.mjs <file|dir> [...]");
  process.exit(1);
}

// regex helper (with (?i)→i support)
const mkre = (p)=>{ let f="g"; if(p.startsWith("(?i)")){ p=p.slice(4); f+="i"; } return new RegExp(p,f); };

// apply one rule to string
const applyRule = (text, rule)=>{
  const strat = strategies[rule.strategy];
  if (!strat) return text;
  const re = mkre(rule.pattern);
  if (rule.strategy === "placeholder")
    return text.replace(re, strat.mask);
  if (rule.strategy === "partial_keep_last4")
    return text.replace(re, m => strat.prefix + m.slice(-4));
  return text;
};

const walk = (p)=>{
  const st = fs.statSync(p);
  if (st.isDirectory()) return fs.readdirSync(p).flatMap(f=>walk(path.join(p,f)));
  if (st.isFile()) return [p];
  return [];
};

let findings = [];

for (const tgt of targets) {
  for (const file of walk(tgt)) {
    if (/node_modules|\.git/.test(file)) continue;
    const src = fs.readFileSync(file,"utf8");
    let out = src;
    let hits = 0;
    for (const rule of rules) {
      const re = mkre(rule.pattern);
      if (re.test(out)) {
        hits++;
        out = applyRule(out, rule);
      }
    }
    if (hits>0) {
      findings.push({ file, hits });
      if (applyWrite) fs.writeFileSync(file, out);
    }
  }
}

const summary = { ok:true, findings, applied:applyWrite, total:findings.length };
const report = JSON.stringify(summary,null,2);
if (ciMode) {
  if (findings.length>0) console.error("[SECURITY] redaction findings:", report);
  process.exit(0);
}
console.log(report);
