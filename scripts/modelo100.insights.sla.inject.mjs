#!/usr/bin/env node
import fs from 'node:fs/promises'
const SRC = 'artifacts/modelo100/rules.insights.html'
const HTML = `
<section id="sla-trends-panel" style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;border-radius:12px">
  <h3 style="margin:0 0 8px 0;font:600 16px system-ui">SLA Trends</h3>
  <div style="display:flex;gap:12px;align-items:center">
    <canvas id="sla-spark" width="240" height="40"></canvas>
    <div id="sla-rates" style="font:14px system-ui"></div>
  </div>
</section>
<script>
(async function(){
  try{
    const res = await fetch('./sla.trends.json',{cache:'no-store'})
    const data = await res.json()
    const daily = data.daily.slice(-30)
    const vals = daily.map(r=>r.breach_rate||0)
    const c = document.getElementById('sla-spark')
    const ctx = c.getContext('2d')
    const w = c.width, h = c.height
    ctx.clearRect(0,0,w,h)
    if (vals.length === 0) return
    const min = Math.min(...vals), max = Math.max(...vals)
    const rng = (max-min)||1
    const step = w/(vals.length-1)
    ctx.beginPath()
    vals.forEach((v,i)=>{
      const x = i*step
      const y = h - ((v-min)/rng)*h
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
    })
    ctx.stroke()
    const d7 = data.rollups.d7?.breach_rate ?? 0
    const d30 = data.rollups.d30?.breach_rate ?? 0
    const d90 = data.rollups.d90?.breach_rate ?? 0
    document.getElementById('sla-rates').textContent = 'Breach rate — 7d: ' + d7 + '%, 30d: ' + d30 + '%, 90d: ' + d90 + '%'
  }catch(e){}
})();
</script>
`
let src = await fs.readFile(SRC,'utf8').catch(()=>null)
if(!src){
  const out = '/tmp/rules.insights.with-sla.html'
  await fs.writeFile(out, HTML)
  console.log(JSON.stringify({ ok:false, preview: out, note:'source_missing' }))
  process.exit(0)
}
let outHtml = src.replace('</body>', HTML + '\n</body>')
if(outHtml === src) outHtml = src + '\n' + HTML
if(process.env.APPLY==='1'){
  await fs.writeFile(SRC, outHtml)
  console.log(JSON.stringify({ ok:true, updated:SRC }))
}else{
  const out = '/tmp/rules.insights.with-sla.html'
  await fs.writeFile(out, outHtml)
  console.log(JSON.stringify({ ok:true, preview: out }))
}
