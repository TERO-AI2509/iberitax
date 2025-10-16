#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadRules } from './modelo100.rules.load.mjs'

const OUT_DIR = 'artifacts/modelo100'
const OUT_HTML = path.join(OUT_DIR, 'rules.dashboard.html')
const INSIGHTS = 'rules.insights.html'
const EXPLORER = 'rules.index.html'

function totalsBySeverity(rules){
  const order=['critical','high','medium','low','unspecified']
  const m=new Map()
  for(const r of rules){const k=(r.severity||'unspecified').toLowerCase(); m.set(k,(m.get(k)||0)+1)}
  return [...m.entries()].sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0]))
}
function totalsByTag(rules){
  const m=new Map()
  for(const r of rules){ for(const t of (r.tags||[])){ m.set(t,(m.get(t)||0)+1) } }
  return [...m.entries()].sort((a,b)=>b[1]-a[1])
}
function qpSyncScript(){
return `(()=>{
  const params=new URL(location.href).searchParams
  const setParam=(k,v)=>{const u=new URL(location.href); if(v) u.searchParams.set(k,v); else u.searchParams.delete(k); history.replaceState(null,'',u)}
  const sev=params.get('severity')||''
  const tag=params.get('tag')||''
  const q=params.get('q')||''
  const ins=document.getElementById('insights')
  const exp=document.getElementById('explorer')
  const buildUrl=(base,p)=>{return base+'?'+Object.entries(p).filter(([,v])=>v).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&')}
  function assignAll(){ ins.src=buildUrl('${INSIGHTS}',{severity:sev,tag:tag,q:q,ts:Date.now()}); exp.src=buildUrl('${EXPLORER}',{severity:sev,tag:tag,q:q,ts:Date.now()}) }
  assignAll()
  window.addEventListener('message', ev=>{
    const {severity, tag, q, action} = ev.data||{}
    if(action!=='set-filters') return
    if(typeof severity==='string') setParam('severity', severity)
    if(typeof tag==='string') setParam('tag', tag)
    if(typeof q==='string') setParam('q', q)
    location.replace(location.href)
  })
})()`}
  
async function main(){
  const { rules, errors } = await loadRules()
  if (errors.length) { throw new Error("Rule schema invalid:\n" + errors.join("\n")); }
  const sevTotals = totalsBySeverity(rules)
  const tagTotals = totalsByTag(rules)
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Modelo 100 — Rules Dashboard</title>
<style>
:root{--bg:#0b0c10;--card:#121318;--muted:#69707d;--text:#d8dee9;--chip:#161922;--chip-on:#1e2533;--accent:#7aa2f7;--border:#262a36}
*{box-sizing:border-box}body{margin:0;padding:20px;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;color:var(--text);background:var(--bg)}
header{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.k{font-size:12px;color:var(--muted)}
.pill{font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid var(--border);background:var(--chip);cursor:pointer}
.grid{display:grid;gap:10px;grid-template-columns:1fr 1fr}
iframe{width:100%;min-height:70vh;border:1px solid var(--border);border-radius:12px;background:#0e1016}
h1{margin:0 0 6px 0;font-size:20px}.hint{font-size:12px;color:var(--muted)}
</style>
</head>
<body>
  <header>
    <h1>Rules Dashboard</h1>
    <div class="row"><span class="k">Totals by severity</span><span id="sevTotals"></span></div>
    <div class="row"><span class="k">Top tags</span><span id="tagTotals"></span></div>
    <div class="hint">Filters in either panel will sync across both.</div>
  </header>
  <main class="grid">
    <iframe id="insights" title="Insights"></iframe>
    <iframe id="explorer" title="Explorer"></iframe>
  </main>
  <script>
  const sevTotals=${JSON.stringify(sevTotals)}
  const tagTotals=${JSON.stringify(tagTotals)}
  function mountTotals(){
    const s=document.getElementById('sevTotals')
    sevTotals.forEach(([k,v])=>{const b=document.createElement('button'); b.className='pill'; b.textContent=k+': '+v; b.addEventListener('click',()=>parent.postMessage({action:'set-filters',severity:k},'*')); s.appendChild(b)})
    const t=document.getElementById('tagTotals')
    tagTotals.slice(0,10).forEach(([k,v])=>{const b=document.createElement('button'); b.className='pill'; b.textContent=k+': '+v; b.addEventListener('click',()=>parent.postMessage({action:'set-filters',tag:k},'*')); t.appendChild(b)})
  }
  mountTotals()
  </script>
  <script>${qpSyncScript()}</script>
</body>
</html>`
  await fs.mkdir(OUT_DIR,{recursive:true})
  await fs.writeFile(OUT_HTML, html, 'utf8')
  console.log(JSON.stringify({ok:true,out:OUT_HTML}))
}
main().catch(e=>{console.error(e);process.exit(1)})
