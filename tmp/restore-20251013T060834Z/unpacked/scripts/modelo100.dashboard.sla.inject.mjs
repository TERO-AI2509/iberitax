#!/usr/bin/env node
import fs from 'node:fs/promises'
const SRC = 'artifacts/modelo100/rules.dashboard.html'
const TILE = `
<section id="sla-trends-tile" style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="font:600 16px system-ui">SLA Breach Rate</div>
    <div id="sla-triple" style="font:14px system-ui">7d: — 30d: — 90d: —</div>
  </div>
</section>
<script>
(async function(){
  try{
    const res = await fetch('./sla.trends.json',{cache:'no-store'})
    const t = await res.json()
    const d7 = t.rollups.d7?.breach_rate ?? 0
    const d30 = t.rollups.d30?.breach_rate ?? 0
    const d90 = t.rollups.d90?.breach_rate ?? 0
    document.getElementById('sla-triple').textContent = '7d: ' + d7 + '%  30d: ' + d30 + '%  90d: ' + d90 + '%'
  }catch(e){}
})();
</script>
`
let src = await fs.readFile(SRC,'utf8').catch(()=>null)
if(!src){
  const out = '/tmp/rules.dashboard.with-sla.html'
  await fs.writeFile(out, TILE)
  console.log(JSON.stringify({ ok:false, preview: out, note:'source_missing' }))
  process.exit(0)
}
let outHtml = src.replace('</body>', TILE + '\n</body>')
if(outHtml === src) outHtml = src + '\n' + TILE
if(process.env.APPLY==='1'){
  await fs.writeFile(SRC, outHtml)
  console.log(JSON.stringify({ ok:true, updated:SRC }))
}else{
  const out = '/tmp/rules.dashboard.with-sla.html'
  await fs.writeFile(out, outHtml)
  console.log(JSON.stringify({ ok:true, preview: out }))
}
