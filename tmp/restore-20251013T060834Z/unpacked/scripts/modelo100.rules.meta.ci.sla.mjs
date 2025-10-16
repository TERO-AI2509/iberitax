#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const SLAJ=path.join(OUT_DIR,'rules.meta.sla.json')
async function main(){
  const txt = await fs.readFile(SLAJ,'utf8').catch(()=>null)
  if(!txt){ console.log(JSON.stringify({ok:false,error:'missing_sla',file:SLAJ})); process.exitCode=2; return }
  const data = JSON.parse(txt)
  const allow = process.env.SLA_ALLOW==='1'
  if(data.summary && data.summary.breaches>0 && !allow){
    console.log(JSON.stringify({ok:false,error:'sla_breach',breaches:data.summary.breaches,allow_overrides:false}))
    process.exitCode=1; return
  }
  console.log(JSON.stringify({ok:true,breaches:data.summary?data.summary.breaches:0,allow_overrides:allow}))
}
await main()
