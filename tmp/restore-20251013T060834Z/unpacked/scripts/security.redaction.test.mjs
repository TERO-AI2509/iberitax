#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert";

const classes = JSON.parse(fs.readFileSync("docs/security/data.classes.json","utf8"));
const rules = JSON.parse(fs.readFileSync("docs/security/redaction.rules.json","utf8"));

assert(Array.isArray(classes.classes), "classes list must exist");
assert(rules.rules?.length > 0, "redaction rules must exist");
const ids = new Set();
for (const r of rules.rules) {
  assert(!ids.has(r.id), "duplicate rule id: "+r.id);
  ids.add(r.id);
  assert(typeof r.pattern === "string" && r.pattern.length > 0, "pattern required for "+r.id);
  assert(["PII","SENSITIVE_PII","CONFIDENTIAL","INTERNAL","PUBLIC"].includes(r.class), "invalid class for "+r.id);
}

const mkre = (p)=>{ let f="g"; if(p.startsWith("(?i)")){ p=p.slice(4); f+="i"; } return new RegExp(p,f); };
const apply = async (s, rule)=>{
  const strat = rules.strategies[rule.strategy];
  if (rule.strategy === "placeholder") return s.replace(mkre(rule.pattern), strat.mask);
  if (rule.strategy === "partial_keep_last4") return s.replace(mkre(rule.pattern), (m)=> strat.prefix + m.slice(-4));
  if (rule.strategy === "hash") {
    const crypto = await import("node:crypto");
    return s.replace(mkre(rule.pattern), (m)=> strat.prefix + crypto.createHash("sha256").update(m).digest("hex").slice(0,16) + strat.suffix);
  }
  return s;
};

let input = `
Name: Ana Gómez
Email: ana.gomez@example.com
Phone: +34 612 345 678
NIF: 12345678Z
NIE: X1234567T
IBAN: ES7620770024003102575766
Secret: sk_live_ABCDEFGHIJKLmnop1234
C. Mayor 123, 3ºB, Madrid
`;

let out = input;
for (const rule of rules.rules) out = await apply(out, rule);

assert(!/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i.test(out), "email not redacted");
assert(!/\b[0-9]{8}[A-Z]\b/.test(out), "NIF not redacted");
assert(!/\b[XYZ][0-9]{7}[A-Z]\b/.test(out), "NIE not redacted");
assert(!/\bES[0-9]{22}\b/.test(out), "IBAN not redacted");
assert(!/sk[_\-]?[A-Za-z0-9]{16,}\b/.test(out), "secret not redacted");

console.log(JSON.stringify({ ok: true }));
