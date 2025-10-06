import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(__dirname, '..');
const ART = path.join(PKG, 'artifacts');
const DRIFT = path.join(ART, 'drift');
const CSV = path.join(DRIFT, 'drift_amounts.csv');
const OUT = path.join(DRIFT, 'summary.md');

function readCsv(p){
  const t = fs.readFileSync(p,'utf8').trim();
  const [head, ...rows] = t.split(/\r?\n/);
  const H = head.split(',');
  return rows.filter(Boolean).map(r=>{
    const c = r.split(',');
    const o = {};
    H.forEach((h,i)=>o[h]=c[i]);
    o.prev = +o.prev; o.last = +o.last; o.delta = +o.delta;
    return o;
  });
}

const rows = readCsv(CSV);
const improved = rows.filter(r=>r.delta>0);
const regressed = rows.filter(r=>r.delta<0);
const avgDelta = rows.length ? (rows.reduce((a,r)=>a+r.delta,0)/rows.length) : 0;

function topN(list,n,by='delta',desc=false){
  return [...list].sort((a,b)=> desc ? (b[by]-a[by]) : (a[by]-b[by]) ).slice(0,n);
}

const topReg = topN(regressed,5,'delta',false);
const topImp = topN(improved,5,'delta',true);

let md = `# OCR Drift — Summary
Fields: ${rows.length} · Improved: ${improved.length} · Regressed: ${regressed.length} · Avg Δ: ${avgDelta.toFixed(2)}
`;

if (topReg.length){
  md += `\n` + topReg.map((r,i)=>`- Top regression ${i+1}: **${r.field}** (${r.prev.toFixed(2)} → ${r.last.toFixed(2)}; Δ ${r.delta.toFixed(2)})`).join('\n');
}
if (topImp.length){
  md += `\n\n` + topImp.map((r,i)=>`- Top improvement ${i+1}: **${r.field}** (${r.prev.toFixed(2)} → ${r.last.toFixed(2)}; Δ ${r.delta.toFixed(2)})`).join('\n');
}

fs.writeFileSync(OUT, md.trim()+'\n', 'utf8');
console.log('Wrote', OUT);
