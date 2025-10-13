#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const SLAJ=path.join(OUT_DIR,'rules.meta.sla.json')
const topN = Number(process.env.SLA_TOP||'10')
const isGH = process.env.GITHUB_ACTIONS==='true'
async function main(){
  const txt = await fs.readFile(SLAJ,'utf8').catch(()=>null)
  if(!txt){ console.log('::error ::SLA: missing rules.meta.sla.json'); process.exitCode=2; return }
  const data = JSON.parse(txt)
  const s = data.summary||{}
  const rows = (data.rows||[]).filter(r=>r.status==='breach').sort((a,b)=>(b.age_days||0)-(a.age_days||0)).slice(0,topN)
  const head = `SLA breaches=${s.breaches||0} of total=${s.total||0}`
  if(isGH){
    if((s.breaches||0)>0) console.log(`::error ::${head}`)
    else console.log(`::notice ::${head}`)
    for(const r of rows){
      const msg = `id=${r.id} severity=${r.severity||'n/a'} age=${r.age_days||'?'}d > threshold=${r.threshold_days||'?'}d`
      console.log(`::warning ::${msg}`)
    }
  }else{
    console.log(head)
    for(const r of rows){
      console.log(`- ${r.id} severity=${r.severity||'n/a'} age=${r.age_days||'?'}d threshold=${r.threshold_days||'?'}d`)
    }
  }
}
await main()
