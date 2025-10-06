import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateDriftDashboard } from './drift.dashboard.mjs'
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(__dirname, '..');             // packages/ocr
const ART = path.join(PKG, 'artifacts');
const DRIFT_DIR = path.join(ART, 'drift');
const DRIFT_FILE = path.join(DRIFT_DIR, 'drift_amounts.csv');
const REPORT_ALL = path.join(ART, 'validation_report.all.csv'); // may be CSV or NDJSON

function sniffContent(p) {
  if (!fs.existsSync(p)) return { kind:'missing', txt:'' };
  const txt = fs.readFileSync(p, 'utf8');
  const first = (txt.trimStart()[0] || '').toLowerCase();
  if (first === '{' || first === '[') return { kind:'ndjson', txt };
  // quick CSV heuristic: has commas and the word field/status in the header
  const firstLine = txt.split(/\r?\n/)[0] || '';
  if (/,/.test(firstLine) && /(field|status)/i.test(firstLine)) return { kind:'csv', txt };
  // default to ndjson — safer for your output shape
  return { kind:'ndjson', txt };
}

// -- CSV reader (quotes-safe) --
function readCsv(txt) {
  txt = (txt || '').trim();
  if (!txt) return [];
  const [head, ...rows] = txt.split(/\r?\n/);
  const headers = head.split(',').map(h => h.replace(/^"|"$/g,''));
  return rows.filter(Boolean).map(line => {
    const cols = [];
    let cur = '', inq = false;
    for (let i=0;i<line.length;i++){
      const ch=line[i];
      if (ch === '"') { if (line[i+1] === '"'){cur+='"'; i++;} else {inq=!inq;} }
      else if (ch === ',' && !inq) { cols.push(cur); cur=''; }
      else { cur += ch; }
    }
    cols.push(cur);
    const o = {};
    headers.forEach((h,idx)=>o[h]=cols[idx]?.replace(/^"|"$/g,''));
    return o;
  });
}

// -- NDJSON reader (one JSON per line) --
function readNDJSON(txt) {
  return txt.split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

// -- Compute accuracy from CSV rows with columns: field, status --
function computeFromCsv(rows) {
  const byField = new Map();
  for (const r of rows) {
    const f = r.field;
    if (!f) continue;
    const status = (r.status || '').toUpperCase();
    const m = byField.get(f) || { ok:0, total:0 };
    m.total += 1;
    if (status === 'OK' || status === 'TRUE' || status === 'PASS') m.ok += 1;
    byField.set(f, m);
  }
  const acc = {};
  for (const [f,{ok,total}] of byField) acc[f] = total ? +(ok*100/total).toFixed(2) : 0;
  return acc;
}

// -- Compute accuracy from NDJSON lines shaped like:
// { fixture: "…", fieldA: {OK:true}, fieldB:{status:"OK"}, fieldC:{passed:true}, ... }
function computeFromNdjson(lines) {
  const byField = new Map();
  for (const rec of lines) {
    for (const [k,v] of Object.entries(rec)) {
      if (k === 'fixture') continue;
      const val = v || {};
      const rawStatus = (val.status ?? val.Status ?? '').toString().toUpperCase();
      const ok =
        val.OK === true ||
        val.ok === true ||
        val.passed === true ||
        rawStatus === 'OK' ||
        rawStatus === 'TRUE' ||
        rawStatus === 'PASS';
      const m = byField.get(k) || { ok:0, total:0 };
      m.total += 1;
      if (ok) m.ok += 1;
      byField.set(k, m);
    }
  }
  const acc = {};
  for (const [f,{ok,total}] of byField) acc[f] = total ? +(ok*100/total).toFixed(2) : 0;
  return acc;
}

function readPrev(pathCsv) {
  if (!fs.existsSync(pathCsv)) return {};
  const txt = fs.readFileSync(pathCsv,'utf8').trim();
  const out = {};
  for (const line of txt.split(/\r?\n/).slice(1)) {
    if (!line) continue;
    const [f,p] = line.split(',');
    const pv = parseFloat(p);
    if (f && Number.isFinite(pv)) out[f] = pv;
  }
  return out;
}

// ----- main -----
fs.mkdirSync(DRIFT_DIR, { recursive: true });
const { kind, txt } = sniffContent(REPORT_ALL);
if (kind === 'missing') {
  console.error('No validator output at', REPORT_ALL);
  process.exit(1);
}

let last = {};
if (kind === 'csv') {
  last = computeFromCsv(readCsv(txt));
} else {
  last = computeFromNdjson(readNDJSON(txt));
}

const prev = readPrev(DRIFT_FILE);
const fields = Array.from(new Set([...Object.keys(prev), ...Object.keys(last)])).sort();
let out = 'field,prev,last,delta\n';
for (const f of fields) {
  const p = prev[f];
  const l = last[f];
  const prevVal = Number.isFinite(p) ? p : l; // first run: prev=last
  const delta = (Number.isFinite(prevVal) && Number.isFinite(l)) ? +(l - prevVal).toFixed(2) : 0;
  out += `${f},${prevVal ?? ''},${l ?? ''},${delta}\n`;
}
fs.writeFileSync(DRIFT_FILE, out, 'utf8');
console.log(`Wrote ${DRIFT_FILE} with ${fields.length} fields (parsed as ${kind.toUpperCase()}).`);

await generateDriftDashboard()
