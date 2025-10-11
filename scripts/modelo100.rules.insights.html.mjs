#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const INDEX_JSON=path.join(OUT_DIR,'rules.index.json')
const OUT_HTML=path.join(OUT_DIR,'rules.insights.html')
const INDEX_HTML_BASENAME='rules.index.html'

const isDashy=v=>v==null||String(v).trim()===''||['—','-','_'].includes(String(v).trim())
const clean=v=>isDashy(v)?'':String(v).trim()
function asArray(x){
  if(Array.isArray(x)) return x
  if(x&&typeof x==='object'){
    if(Array.isArray(x.index)) return x.index
    if(Array.isArray(x.rules)) return x.rules
    if(Array.isArray(x.items)) return x.items
    const vals=Object.values(x); if(vals.length&&vals.every(v=>v&&typeof v==='object')) return vals
  }
  return []
}
function normTags(t){
  if(!t) return []
  if(Array.isArray(t)) return t.map(clean).filter(Boolean)
  if(typeof t==='string') return t.split(/[,\s]+/).map(clean).filter(Boolean)
  return []
}
function deriveTags(r){
  const tags=new Set(normTags(r.tags))
  ;['tag','tags_str','section','group','category','type'].forEach(k=>{
    const v=r?.[k]; normTags(v).forEach(x=>tags.add(x)); if(typeof v==='string'&&clean(v)) tags.add(clean(v))
  })
  return Array.from(tags)
}
const pickId = r => clean(r.id ?? r.key ?? r.rule_id ?? r.code ?? r.name)
const pickSeverity = r => clean(r.severity ?? r.sev ?? r.level ?? r.priority) || 'unknown'
const pickMessage = r => clean(r.message ?? r.msg ?? r.text ?? r.description ?? r.title)
function isNoiseRule(r){
  const id=pickId(r), sev=pickSeverity(r), msg=pickMessage(r), tags=deriveTags(r)
  return !id && !msg && tags.length===0 && sev==='unknown'
}
const sevOrder=['critical','high','medium','low','info','none','unknown']
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
const q=o=>Object.entries(o).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')

async function main(){
  if(process.env.ENABLE_RULE_INSIGHTS_HTML!=='1'){ console.log(JSON.stringify({ok:false,skipped:true,reason:'ENABLE_RULE_INSIGHTS_HTML!=1'})); return }
  const raw=await fs.readFile(INDEX_JSON,'utf8').catch(()=>null)
  if(!raw){ console.log(JSON.stringify({ok:false,error:`missing ${INDEX_JSON}`})); process.exit(1) }
  let parsed; try{ parsed=JSON.parse(raw) }catch(e){ console.log(JSON.stringify({ok:false,error:`invalid JSON in ${INDEX_JSON}`,detail:String(e)})); process.exit(1) }
  const keep = asArray(parsed).filter(r=>!isNoiseRule(r))
  const total=keep.length
  const ts=new Date().toISOString()
  const sevCounts={}
  const tagCounts={}
  for(const r of keep){
    const sev = pickSeverity(r)
    sevCounts[sev]=(sevCounts[sev]||0)+1
    for(const t of deriveTags(r)) tagCounts[t]=(tagCounts[t]||0)+1
  }
  const orderedSev=Array.from(new Set([...sevOrder,...Object.keys(sevCounts)]))
  const topTags=Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10)
  const maxSev=Math.max(1,...Object.values(sevCounts))
  const svgW=Math.max(500, orderedSev.length*80), svgH=240, pad=30
  const barW=Math.floor((svgW-pad*2)/Math.max(1,orderedSev.length))
  const barX=i=>pad+i*barW, barH=c=>Math.round((c/maxSev)*(svgH-pad*2)), barY=c=>svgH-pad-barH(c)

  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Rule Insights — Modelo 100</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{--fg:#111;--muted:#555;--bg:#fff;--card:#f7f7f7}body{font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--fg);background:var(--bg);margin:20px}
h1{font-size:20px;margin:0 0 8px}.meta{color:var(--muted);margin-bottom:16px}.card{background:var(--card);border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.row{display:grid;gap:16px;grid-template-columns:1fr}@media(min-width:900px){.row{grid-template-columns:1.4fr 1fr}}table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px 10px;border-bottom:1px solid #e5e5e5}th{text-align:left}a{color:#0b62d6;text-decoration:none}a:hover{text-decoration:underline}.legend{display:flex;gap:12px;flex-wrap:wrap;margin:6px 0 0 6px;color:var(--muted);font-size:12px}.bar:hover{opacity:.85}.num{text-align:right;font-variant-numeric:tabular-nums}</style>
</head><body><h1>Rule Insights</h1>
<div class="meta">Total rules: <strong>${total}</strong> · Generated: <strong>${esc(ts)}</strong> · <a href="${esc(INDEX_HTML_BASENAME)}">Open Explorer</a></div>
<div class="row"><div class="card"><h2 style="margin:0 0 8px">By Severity</h2>
<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="${svgH}"><g>${
  orderedSev.map((name,i)=>{const count=sevCounts[name]||0; const href=INDEX_HTML_BASENAME+'?'+q({severity:name}); const x=barX(i)+6; const y=barY(count); const h=barH(count); const labelY=svgH-8;
    return `<a xlink:href="${esc(href)}"><rect class="bar" x="${x}" y="${y}" width="${barW-12}" height="${h}" rx="6" ry="6"></rect><text x="${x+(barW-12)/2}" y="${labelY}" font-size="12" text-anchor="middle">${esc(name)}</text><text x="${x+(barW-12)/2}" y="${y-6}" font-size="12" text-anchor="middle">${count}</text></a>`
  }).join('')}
<line x1="${pad}" y1="${svgH-pad}" x2="${svgW-pad}" y2="${svgH-pad}" stroke="#ccc"></line><line x1="${pad}" y1="${pad}" x2="${pad}" y2="${svgH-pad}" stroke="#eee"></line></g></svg>
<div class="legend">Click a bar to open the filtered explorer.</div></div>
<div class="card"><h2 style="margin:0 0 8px">Top Tags</h2>
<table id="tags"><thead><tr><th data-sort="tag">Tag</th><th data-sort="count" class="num">Count</th></tr></thead><tbody>${
  topTags.length? topTags.map(([tag,count])=>`<tr><td><a class="taglink" href="${INDEX_HTML_BASENAME+'?'+q({tag})}">${esc(tag)}</a></td><td class="num">${count}</td></tr>`).join('') : `<tr><td colspan="2">No tags found.</td></tr>`
}</tbody></table><div class="legend">Click a tag to open the filtered explorer. Table is sortable.</div></div></div>
<script>(function(){const table=document.getElementById('tags');let sortKey='count',dir=-1;function sortNow(){const tb=table.tBodies[0];if(!tb)return;const rows=Array.from(tb.rows);rows.sort((a,b)=>{const av=sortKey==='count'?+a.cells[1].textContent:a.cells[0].textContent.toLowerCase();const bv=sortKey==='count'?+b.cells[1].textContent:b.cells[0].textContent.toLowerCase();if(av<bv)return -1*dir;if(av>bv)return 1*dir;return 0});rows.forEach(r=>tb.appendChild(r))}table.querySelectorAll('th').forEach(th=>{th.style.cursor='pointer';th.addEventListener('click',()=>{const key=th.dataset.sort;if(sortKey===key){dir*=-1}else{sortKey=key;dir=key==='count'?-1:1}sortNow()})});sortNow()})();</script>
</body></html>`
  await fs.mkdir(OUT_DIR,{recursive:true})
  await fs.writeFile(OUT_HTML,html,'utf8')
  console.log(JSON.stringify({ok:true,out:OUT_HTML,total}))
}
main().catch(e=>{console.error(e);process.exit(1)})
