#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const HTML=path.join(OUT_DIR,'rules.dashboard.html')
const ESJ =path.join(OUT_DIR,'owners.escalation.json')

function ownersToPing(data){
  if(!data||!data.owners) return 0
  return data.owners.filter(o=>o.pages||o.breaches||o.warns).length
}

async function main(){
  const html = await fs.readFile(HTML,'utf8').catch(()=>null)
  if(!html){ console.log(JSON.stringify({ok:false,error:'missing_dashboard_html',file:HTML})); process.exitCode=2; return }
  const data = await fs.readFile(ESJ,'utf8').then(s=>JSON.parse(s)).catch(()=>null)
  const count = ownersToPing(data)
  const card = `
<div class="card">
  <div class="card-title">Owners to ping</div>
  <div class="card-value">${count}</div>
  <div class="card-sub">warns/pages/breaches</div>
</div>`
  let out = html
  if(html.includes('<div id="top-cards">')) out = html.replace('<div id="top-cards">','<div id="top-cards">\n'+card+'\n')
  else if(html.includes('</body>')) out = html.replace('</body>', card+'\n</body>')
  else out = html+'\n'+card+'\n'
  await fs.writeFile(HTML,out)
  console.log(JSON.stringify({ok:true,out:HTML,inserted:true,count}))
}
await main()
