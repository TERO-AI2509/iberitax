#!/usr/bin/env node
import fs from 'node:fs/promises'

const OUT='artifacts/modelo100/sla.owners.html'
const HTML=String.raw`<!doctype html><meta charset="utf-8"/>
<title>Owner SLA Rollups</title>
<style>
body{font:14px system-ui;margin:16px}
input,select{padding:6px;border:1px solid #e5e7eb;border-radius:8px}
table{border-collapse:collapse;width:100%;margin-top:12px}
th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
th button{border:0;background:none;cursor:pointer;font:inherit}
.badge{padding:4px 8px;border-radius:999px;border:1px solid #e5e7eb}
</style>
<h2>Owner SLA Rollups</h2>
<div style="display:flex;gap:8px;align-items:center">
  <label>Window <select id="win"><option value="d7">7d</option><option value="d30">30d</option><option value="d90">90d</option></select></label>
  <input id="q" placeholder="Filter owner…"/>
  <span id="updated" class="badge">—</span>
</div>
<table id="t"><thead><tr>
  <th><button data-k="owner">Owner</button></th>
  <th><button data-k="breach_rate">Breach %</button></th>
  <th><button data-k="breaches">Breaches</button></th>
  <th><button data-k="totals">Totals</button></th>
  <th><button data-k="warns">Warns</button></th>
  <th><button data-k="pages">Pages</button></th>
</tr></thead><tbody></tbody></table>
<script>
let data=null, dir= -1, key='breach_rate'
const tb=document.querySelector('#t tbody'), q=document.querySelector('#q'), win=document.querySelector('#win')
for(const b of document.querySelectorAll('th button')) b.onclick=()=>{ key=b.dataset.k; dir*=-1; render() }
q.oninput=render; win.onchange=render

async function load(){
  const r=await fetch('./sla.owner.trends.json',{cache:'no-store'}); data=await r.json()
  document.getElementById('updated').textContent = 'Updated ' + (data.updated_at||'')
  render()
}

function esc(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])) }

function render(){
  if(!data) return
  let rows = (data.windows?.[win.value]||[])
  const qv=(q.value||'').toLowerCase()
  if(qv) rows = rows.filter(r=>String(r.owner).toLowerCase().includes(qv))
  rows.sort((a,b)=> (a[key] < b[key] ? dir : -dir))
  tb.innerHTML = rows.map(function(r){
    return '<tr>'
      + '<td>'+esc(r.owner)+'</td>'
      + '<td>'+r.breach_rate+'%</td>'
      + '<td>'+r.breaches+'</td>'
      + '<td>'+r.totals+'</td>'
      + '<td>'+r.warns+'</td>'
      + '<td>'+r.pages+'</td>'
      + '</tr>'
  }).join('')
}
load()
</script>`
await fs.mkdir('artifacts/modelo100',{recursive:true})
await fs.writeFile(OUT,HTML)
console.log(JSON.stringify({ok:true,out:OUT}))
