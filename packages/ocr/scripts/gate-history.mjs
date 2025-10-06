import fs from "fs";
import path from "path";

const PKG = path.resolve(process.cwd());
const HIST = path.join(PKG, "artifacts/validation_history.md");
const LIMIT_RAW = process.env.GATE_DRIFT; // e.g. ">0", ">=3"

if (!LIMIT_RAW) { console.log("GATE_DRIFT not set; drift gate is disabled."); process.exit(0); }
const m = String(LIMIT_RAW).match(/^\s*(>=|>|<=|<|=)\s*(\d+)\s*$/);
if (!m) { console.log("Invalid GATE_DRIFT (use '>0', '>=2', etc). Gate disabled."); process.exit(0); }
const limit = { op: m[1], val: Number(m[2]) };

if (!fs.existsSync(HIST)) { console.log("No history file; skipping drift gate."); process.exit(0); }
const text = fs.readFileSync(HIST, "utf8");
const blocks = text.match(/##\s+[\d-]+W\d{2}[\s\S]*?(?=##\s+|$)/g) || [];
if (!blocks.length) { console.log("History has no weekly blocks; skipping drift gate."); process.exit(0); }
const last = blocks[blocks.length-1];
const line = (last.split(/\r?\n/).find(l => /Max diff:/.test(l)) || "");
const val = Number((line.match(/Max diff:\s*(\d+)/) || [,"0"])[1]);

function cmp(op,a,b){return op==">"?a>b:op==">="?a>=b:op=="<"?a<b:op=="<="?a<=b:a===b;}
const ok = cmp(limit.op, val, limit.val);
if (!ok) { console.error(`Drift gate failed: Max diff ${val} does not satisfy ${limit.op} ${limit.val}`); process.exit(1); }
console.log(`Drift gate passed: Max diff ${val} satisfies ${limit.op} ${limit.val}`);
