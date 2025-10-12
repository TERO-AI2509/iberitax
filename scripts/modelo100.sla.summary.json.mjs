#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const SLAJ=path.join(OUT_DIR,'rules.meta.sla.json')
async function main(){
  const txt = await fs.readFile(SLAJ,'utf8').catch(()=>null)
  if(!txt){ console.log(JSON.stringify({ok:false,error:'missing_sla'})); process.exitCode=2; return }
  const data = JSON.parse(txt)
  const s = data.summary||{}
  const rows = (data.rows||[]).filter(r=>r.status==='breach').map(r=>({id:r.id,severity:r.severity,age_days:r.age_days,threshold_days:r.threshold_days}))
  console.log(JSON.stringify({ok:true,summary:{total:s.total||0,breaches:s.breaches||0,ok:s.ok_count||0,ignored:s.ignored||0,unknown:s.unknown||0},breaches:rows}))
}
await main()
