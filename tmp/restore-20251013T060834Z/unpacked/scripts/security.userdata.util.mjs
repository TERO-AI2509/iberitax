#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

export const BASE_DIRS = ["artifacts","report","uploads","history","notify"];
export const ALLOWED_DIRS = process.env.SCAN_TMP ? [...BASE_DIRS,"tmp"] : BASE_DIRS;
export const TOP_LEVEL_FILES = [
  "mapped.json","mapped.csv","mapped.html",
  "ocr.normalized.json","owners.csv","owners.html"
];

// Regex helper that supports "(?i)" → "i"
export const mkre = (p)=>{ let f="g"; if(p.startsWith("(?i)")){ p=p.slice(4); f+="i"; } return new RegExp(p,f); };

export const loadRedaction = ()=>{
  const spec = JSON.parse(fs.readFileSync("docs/security/redaction.rules.json","utf8"));
  return {
    rules: spec.rules,
    strategies: spec.strategies
  };
};

export const applyRule = (text, rule, strategies)=>{
  const strat = strategies[rule.strategy];
  if (!strat) return text;
  const re = mkre(rule.pattern);
  if (rule.strategy === "placeholder") return text.replace(re, strat.mask);
  if (rule.strategy === "partial_keep_last4") return text.replace(re, m=> (strat.prefix ?? "[REDACTED:*]") + m.slice(-4));
  return text;
};

export const applyAllRules = (text, rules, strategies)=>{
  let out = text, hits=0;
  for (const r of rules) {
    const before = out;
    out = applyRule(out, r, strategies);
    if (out !== before) hits++;
  }
  return { out, hits };
};

export const repoWalk = (root)=>{
  const out = [];
  const pushIf = (p)=>{ if (fs.existsSync(p)) out.push(p); };

  // top-level files
  for (const f of TOP_LEVEL_FILES) pushIf(path.join(root,f));

  // allowed directories
  for (const d of ALLOWED_DIRS) {
    const base = path.join(root,d);
    if (!fs.existsSync(base)) continue;
    for (const p of walk(base)) out.push(p);
  }
  return out;
};

const walk = (p)=>{
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    return fs.readdirSync(p)
      .filter(f=>f !== ".git" && f !== "node_modules")
      .flatMap(f=>walk(path.join(p,f)));
  }
  return st.isFile() ? [p] : [];
};

export const findMatches = (files, query)=>{
  const res = [];
  for (const f of files) {
    try {
      const buf = fs.readFileSync(f,"utf8");
      const idx = buf.indexOf(query);
      if (idx >= 0) {
        // grab a small context snippet
        const s = Math.max(0, idx-40);
        const e = Math.min(buf.length, idx+40);
        res.push({ file:f, hits:1, snippet: buf.slice(s,e) });
      }
    } catch {}
  }
  return res;
};
