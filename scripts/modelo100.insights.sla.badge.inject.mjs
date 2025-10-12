#!/usr/bin/env node
import fs from 'node:fs/promises'
const SRC = 'artifacts/modelo100/rules.insights.html'
const HTML = `
<section id="sla-alerts-panel" style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px">
  <h3 style="margin:0 0 8px 0;font:600 16px system-ui">SLA Status</h3>
  <div style="display:flex;gap:12px;align-items:center">
    <span id="sla-badge" style="padding:4px 8px;border-radius:999px;border:1px solid #e5e7eb;font:600 12px system-ui">—</span>
    <span id="sla-updated" style="font:12px system-ui;color:#6b7280"></span>
  </div>
  <ul id="sla-alerts" style="margin:12px 0 0 18px;font:14px system-ui"></ul>
</section>
<script>
(async function(){
  try{
    const res = await fetch('./sla.alerts.json',{cache:'no-store'})
    const a = await res.json()
    const b = document.getElementById('sla-badge')
    const u = document.getElementById('sla-updated')
    const l = document.getElementById('sla-alerts')
    const color = a.overall==='fail' ? '#ef4444' : (a.overall==='warn' ? '#f59e0b' : '#10b981')
    b.style.background = color + '20'
    b.style.borderColor = color
    b.style.color = color
    b.textContent = a.overall.toUpperCase()
    u.textContent = 'Updated ' + (a.updated_at||'')
    const items = []
    for (const k of ['d7','d30','d90']){
      const w = a.windows?.[k]; if(!w) continue
      items.push(k.toUpperCase()+': breach rate ' + w.rate + '% → ' + w.status.toUpperCase())
    }
    l.innerHTML = items.map(x=>'<li>'+x+'</li>').join('')
  }catch(e){}
})();
</script>
`
let src = await fs.readFile(SRC,'utf8').catch(()=>null)
if(!src){
  const out='/tmp/rules.insights.with-sla-badge.html'
  await fs.writeFile(out,HTML)
  console.log(JSON.stringify({ok:false,preview:out,note:'source_missing'})); process.exit(0)
}
let outHtml = src.replace('</body>', HTML+'\n</body>')
if(outHtml===src) outHtml = src+'\n'+HTML
if(process.env.APPLY==='1'){ await fs.writeFile(SRC,outHtml); console.log(JSON.stringify({ok:true,updated:SRC})) }
else { const out='/tmp/rules.insights.with-sla-badge.html'; await fs.writeFile(out,outHtml); console.log(JSON.stringify({ok:true,preview:out})) }
