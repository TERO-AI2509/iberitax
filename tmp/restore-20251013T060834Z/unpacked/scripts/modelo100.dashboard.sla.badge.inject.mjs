#!/usr/bin/env node
import fs from 'node:fs/promises'
const SRC='artifacts/modelo100/rules.dashboard.html'
const TILE=`
<section id="sla-alerts-tile" style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="font:600 16px system-ui">SLA</div>
    <span id="sla-badge-dash" style="padding:4px 8px;border-radius:999px;border:1px solid #e5e7eb;font:600 12px system-ui">—</span>
  </div>
  <div id="sla-windows" style="margin-top:8px;font:14px system-ui"></div>
</section>
<script>
(async function(){
  try{
    const r = await fetch('./sla.alerts.json',{cache:'no-store'})
    const a = await r.json()
    const b = document.getElementById('sla-badge-dash')
    const w = document.getElementById('sla-windows')
    const color = a.overall==='fail' ? '#ef4444' : (a.overall==='warn' ? '#f59e0b' : '#10b981')
    b.style.background = color + '20'; b.style.borderColor = color; b.style.color = color
    b.textContent = a.overall.toUpperCase()
    const seg = []
    for (const k of ['d7','d30','d90']){
      const x = a.windows?.[k]; if(!x) continue
      seg.push(k.toUpperCase()+': '+x.status.toUpperCase()+' ('+x.rate+'%)')
    }
    w.textContent = seg.join('  •  ')
  }catch(e){}
})();
</script>
`
let src = await fs.readFile(SRC,'utf8').catch(()=>null)
if(!src){
  const out='/tmp/rules.dashboard.with-sla-badge.html'
  await fs.writeFile(out,TILE)
  console.log(JSON.stringify({ok:false,preview:out,note:'source_missing'})); process.exit(0)
}
let outHtml = src.replace('</body>', TILE+'\n</body>')
if(outHtml===src) outHtml = src+'\n'+TILE
if(process.env.APPLY==='1'){ await fs.writeFile(SRC,outHtml); console.log(JSON.stringify({ok:true,updated:SRC})) }
else{ const out='/tmp/rules.dashboard.with-sla-badge.html'; await fs.writeFile(out,outHtml); console.log(JSON.stringify({ok:true,preview:out})) }
