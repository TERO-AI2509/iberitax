#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR='artifacts/modelo100'
const SRC_MISSING=path.join(OUT_DIR,'rules.meta.missing.json')
const SRC_STALE=path.join(OUT_DIR,'rules.meta.stale.json')
const SRC_TAGS=path.join(OUT_DIR,'rules.tags.report.json')
const OUT_HTML=path.join(OUT_DIR,'rules.insights.html')

function loadJSON(p,fallback){return fs.readFile(p,'utf8').then(s=>JSON.parse(s)).catch(()=>fallback)}
function htm(s){return (s||'').toString().replace(/[&<>"]/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[m]))}

async function main(){
  const missing=await loadJSON(SRC_MISSING,{total:0,missing:0,items:[]})
  const stale=await loadJSON(SRC_STALE,{threshold_days:90,stale:0,items:[]})
  const tags=await loadJSON(SRC_TAGS,{total:0,empty:0,nonLower:[]})
  const html=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Modelo 100 — Insights</title>
<style>
:root{--bg:#0b0c10;--card:#121318;--muted:#69707d;--text:#d8dee9;--accent:#7aa2f7;--border:#262a36;--warn:#df6d57}
*{box-sizing:border-box}body{margin:0;padding:20px;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;color:var(--text);background:var(--bg)}
h1{margin:0 0 10px 0;font-size:20px}
.grid{display:grid;gap:12px}
.panel{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px}
.k{color:var(--muted);font-size:12px}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid var(--border);margin-right:6px}
.warn{color:#fff;background:var(--warn);border-color:#c55b49}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{padding:8px 10px;border-bottom:1px solid var(--border);text-align:left;font-size:13px}
th{color:var(--muted)}
input[type="search"]{width:100%;background:#171a22;border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:10px}
</style>
</head>
<body>
  <h1>Insights</h1>
  <div class="grid">
    <div class="panel">
      <div class="k">Metadata completeness</div>
      <div class="badge">Total rules: ${missing.total||0}</div>
      <div class="badge warn">Missing metadata: ${missing.missing||0}</div>
      <input id="q1" type="search" placeholder="Search missing metadata">
      <table><thead><tr><th>Rule</th><th>Owner</th><th>Status</th><th>Updated</th></tr></thead><tbody id="t1"></tbody></table>
    </div>
    <div class="panel">
      <div class="k">Stale rules (>${stale.threshold_days} days)</div>
      <div class="badge warn">Stale: ${stale.stale||0}</div>
      <input id="q2" type="search" placeholder="Search stale rules">
      <table><thead><tr><th>Rule</th><th>Owner</th><th>Status</th><th>Updated</th><th>Age</th></tr></thead><tbody id="t2"></tbody></table>
    </div>
    <div class="panel">
      <div class="k">Tag hygiene</div>
      <div class="badge">Empty tags: ${tags.empty||0}</div>
      <div class="badge">Non-lowercase tags: ${tags.nonLower.length||0}</div>
      <table><thead><tr><th>Non-lowercase tags</th></tr></thead><tbody id="t3"></tbody></table>
    </div>
  </div>
<script>
const missing=${JSON.stringify(missing)}
const stale=${JSON.stringify(stale)}
const tags=${JSON.stringify(tags)}
function fill1(q){const tb=document.getElementById('t1');tb.innerHTML='';(missing.items||[]).filter(x=>!q||[x.id,x.owner,x.status,x.updated].join(' ').toLowerCase().includes(q.toLowerCase())).forEach(x=>{const tr=document.createElement('tr');tr.innerHTML='<td>'+x.id+'</td><td>'+(x.owner||'-')+'</td><td>'+(x.status||'-')+'</td><td>'+(x.updated||'-')+'</td>';tb.appendChild(tr)})}
function fill2(q){const tb=document.getElementById('t2');tb.innerHTML='';(stale.items||[]).filter(x=>!q||[x.id,x.owner,x.status,x.updated,String(x.age_days)].join(' ').toLowerCase().includes(q.toLowerCase())).forEach(x=>{const tr=document.createElement('tr');tr.innerHTML='<td>'+x.id+'</td><td>'+(x.owner||'-')+'</td><td>'+(x.status||'-')+'</td><td>'+(x.updated||'-')+'</td><td>'+(x.age_days||'-')+'</td>';tb.appendChild(tr)})}
function fill3(){const tb=document.getElementById('t3');tb.innerHTML='';(tags.nonLower||[]).forEach(x=>{const tr=document.createElement('tr');tr.innerHTML='<td>'+x+'</td>';tb.appendChild(tr)})}
document.getElementById('q1').addEventListener('input',e=>fill1(e.target.value))
document.getElementById('q2').addEventListener('input',e=>fill2(e.target.value))
fill1('');fill2('');fill3();
</script>
</body>
</html>`
  await fs.mkdir(OUT_DIR,{recursive:true})
  await fs.writeFile(OUT_HTML,html,'utf8')
  console.log(JSON.stringify({ok:true,out:OUT_HTML}))
}
main().catch(e=>{console.error(e.message||e);process.exit(1)})
