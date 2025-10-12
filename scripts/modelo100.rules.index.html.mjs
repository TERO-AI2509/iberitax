#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadRules } from './modelo100.rules.load.mjs'

const OUT_DIR = 'artifacts/modelo100'
const INDEX_JSON = path.join(OUT_DIR, 'rules.index.json')
const INDEX_HTML = path.join(OUT_DIR, 'rules.index.html')

const envTag = process.env.RULE_TAG || ''
const envSev = process.env.RULE_SEVERITY || ''

function htm(str){ return (str||'').replace(/[&<>"]/g,s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s])) }

const { rules } = await loadRules()
const minimal = rules.map(r=>({ id:r.id, tags:r.tags, message:r.message, severity:r.severity, owner:r.owner||'', status:r.status||'', updated:r.updated||'' }))
await fs.mkdir(OUT_DIR, { recursive:true })
await fs.writeFile(INDEX_JSON, JSON.stringify({ generated_at: new Date().toISOString(), total: minimal.length, items: minimal }, null, 2),'utf8')

const dataJS = `window.__RULE_INDEX__=${JSON.stringify(minimal)};window.__INITIAL__=${JSON.stringify({ tag: envTag, severity: envSev })};`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Modelo 100 — Rule Index</title>
<style>
:root{--bg:#0b0c10;--card:#121318;--muted:#69707d;--text:#d8dee9;--chip:#161922;--chip-on:#1e2533;--accent:#7aa2f7;--border:#262a36;--input:#171a22}
*{box-sizing:border-box}body{margin:0;padding:24px;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;color:var(--text);background:var(--bg)}
.wrap{max-width:1100px;margin:0 auto}h1{margin:0 0 8px;font-size:24px}.sub{color:var(--muted);margin-bottom:16px;font-size:13px}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
input[type="search"]{flex:1;min-width:260px;border:1px solid var(--border);background:var(--input);color:var(--text);padding:10px 12px;border-radius:12px;outline:none}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 4px}
.chip{padding:6px 10px;border-radius:999px;background:var(--chip);border:1px solid var(--border);cursor:pointer;font-size:12px}
.chip.active{background:var(--chip-on);border-color:var(--accent)}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;display:grid;grid-template-columns:160px 1fr;gap:10px;align-items:start}
.grid{display:grid;gap:10px}.id a{color:var(--accent);text-decoration:none;font-weight:600}.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{background:var(--chip);border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px}
.sev{font-size:12px;color:var(--muted)}.meta{display:flex;gap:12px;align-items:center}.links a{font-size:12px;color:var(--accent);text-decoration:none;margin-right:8px}
.pill{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--border);background:var(--chip);cursor:pointer}
.sep{height:1px;background:var(--border);margin:10px 0}.empty{color:var(--muted);padding:16px;border:1px dashed var(--border);border-radius:12px}
.head{display:flex;justify-content:space-between;align-items:center}.small{font-size:12px;color:var(--muted)}
.kv{display:inline-flex;gap:6px;align-items:center}.kv b{font-weight:600}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div>
      <h1>Rule Index</h1>
      <div class="sub">Search, filter by severity or tag. Owner, Status, Updated shown per rule.</div>
    </div>
    <div class="small" id="count"></div>
  </div>

  <div class="bar">
    <input id="q" type="search" placeholder="Search by id, message, tag, owner, status">
    <div id="sev" class="chips"></div>
    <div id="tags" class="chips"></div>
  </div>

  <div class="grid" id="list"></div>
</div>
<script>
${dataJS}
const state={ q:(new URL(location.href)).searchParams.get('q')||'', tag:window.__INITIAL__.tag||'', sev:window.__INITIAL__.severity||'' }
const sevOrder=['critical','high','medium','low','']
const tags=[...new Set(window.__RULE_INDEX__.flatMap(r=>r.tags||[]))].sort()
const sevSet=[...new Set(window.__RULE_INDEX__.map(r=>r.severity||''))].filter(Boolean).sort((a,b)=>sevOrder.indexOf(a)-sevOrder.indexOf(b))
function setParam(k,v){ const u=new URL(location.href); if(v) u.searchParams.set(k,v); else u.searchParams.delete(k); history.replaceState(null,'',u) }
function slug(s){return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
function renderChips(){
  const sevEl=document.getElementById('sev'); sevEl.innerHTML=''
  ;['',...sevSet].forEach(s=>{
    const c=document.createElement('button'); c.className='chip'; c.textContent=s||'all'; c.addEventListener('click',()=>{state.sev=(state.sev===s)?'':s; setParam('severity',state.sev); refresh()})
    if(state.sev===s) c.classList.add('active'); sevEl.appendChild(c)
  })
  const tagsEl=document.getElementById('tags'); tagsEl.innerHTML=''
  ;['',...tags].forEach(t=>{
    const c=document.createElement('button'); c.className='chip'; c.textContent=t||'all'; c.addEventListener('click',()=>{state.tag=(state.tag===t)?'':t; setParam('tag',state.tag); refresh()})
    if(state.tag===t) c.classList.add('active'); tagsEl.appendChild(c)
  })
}
document.getElementById('q').value=state.q
document.getElementById('q').addEventListener('input',e=>{state.q=e.target.value; setParam('q',state.q); refresh()})
function matches(r){
  if(state.sev && (r.severity||'')!==state.sev) return false
  if(state.tag && !(r.tags||[]).includes(state.tag)) return false
  if(state.q){
    const hay=[r.id,r.message,(r.tags||[]).join(' '),r.severity||'',r.owner||'',r.status||'',r.updated||''].join(' ').toLowerCase()
    if(!hay.includes(state.q.toLowerCase())) return false
  }
  return true
}
function groupBySeverity(items){
  const m=new Map()
  items.forEach(r=>{const k=r.severity||'unspecified'; if(!m.has(k)) m.set(k,[]); m.get(k).push(r)})
  const keys=[...m.keys()].sort((a,b)=>sevOrder.indexOf(a)-sevOrder.indexOf(b))
  return keys.map(k=>({key:k, items:m.get(k)}))
}
function card(r){
  const wrap=document.createElement('div'); wrap.className='card'
  const left=document.createElement('div'); left.className='id'
  const a=document.createElement('a'); a.href='rules.rollup.md#'+slug(r.id); a.textContent=r.id
  left.appendChild(a)
  const sev=document.createElement('div'); sev.className='sev'; sev.textContent='Severity: '+(r.severity||'Unspecified'); left.appendChild(sev)
  const right=document.createElement('div')
  const msg=document.createElement('div'); msg.textContent=r.message||''; right.appendChild(msg)
  const meta=document.createElement('div'); meta.className='meta'
  const o=document.createElement('span'); o.className='kv'; o.innerHTML='<b>Owner</b> '+(r.owner?htm(r.owner):'-')
  const s=document.createElement('span'); s.className='kv'; s.innerHTML='<b>Status</b> '+(r.status?htm(r.status):'-')
  const u=document.createElement('span'); u.className='kv'; u.innerHTML='<b>Updated</b> '+(r.updated?htm(r.updated):'-')
  meta.appendChild(o); meta.appendChild(s); meta.appendChild(u); right.appendChild(meta)
  const links=document.createElement('div'); links.className='links'
  const aRule=document.createElement('a'); aRule.href='rules.rollup.md#'+slug(r.id); aRule.textContent='Rule'
  const aGroup=document.createElement('a'); aGroup.href='rules.groups.rollup.md#'+(r.tags&&r.tags[0]?slug(r.tags[0]):''); aGroup.textContent='Group'
  links.appendChild(aRule); links.appendChild(aGroup); right.appendChild(links)
  const tagsDiv=document.createElement('div'); tagsDiv.className='tags'
  ;(r.tags||[]).forEach(t=>{const sp=document.createElement('span'); sp.className='tag'; const link=document.createElement('a'); link.href='rules.groups.rollup.md#'+slug(t); link.textContent=t; link.style.textDecoration='none'; sp.appendChild(link); tagsDiv.appendChild(sp)})
  right.appendChild(tagsDiv)
  wrap.appendChild(left); wrap.appendChild(right)
  return wrap
}
function refresh(){
  renderChips()
  const list=document.getElementById('list'); list.innerHTML=''
  const filtered=window.__RULE_INDEX__.filter(matches)
  const grouped=groupBySeverity(filtered)
  let total=0
  grouped.forEach(g=>{
    const h=document.createElement('div'); h.className='sep'; list.appendChild(h)
    const title=document.createElement('div'); title.className='small'; title.textContent=(g.key||'unspecified')+' — '+g.items.length; list.appendChild(title)
    g.items.forEach(r=>list.appendChild(card(r)))
    total+=g.items.length
  })
  if(total===0){const e=document.createElement('div'); e.className='empty'; e.textContent='No rules match the filters.'; list.appendChild(e)}
  document.getElementById('count').textContent = total+' shown'
}
refresh()
</script>
</body>
</html>`
await fs.writeFile(INDEX_HTML, html, 'utf8')
console.log(JSON.stringify({ ok: true, out: INDEX_HTML, total: minimal.length }))
