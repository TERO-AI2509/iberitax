#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR='artifacts/modelo100'
const SRC_ESC=path.join(OUT_DIR,'owners.escalation.json')
const now=new Date()
const y=now.getFullYear(), m=String(now.getMonth()+1).padStart(2,'0'), d=String(now.getDate()).padStart(2,'0')
const dayFile=`sla.owner.day-${y}${m}${d}.json`
const outPath=path.join(OUT_DIR,dayFile)

function isBreach(s){ s=(s||'').toString().toLowerCase(); return ['breach','error','failed'].includes(s) }
function isWarn(s){ s=(s||'').toString().toLowerCase(); return ['warn','warning'].includes(s) }

let rows=[]
try{
  const buf=await fs.readFile(SRC_ESC,'utf8')
  const json=JSON.parse(buf)
  rows = Array.isArray(json)?json : Array.isArray(json?.rows)?json.rows : []
}catch(e){
  if(process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'MISSING_OR_BAD_INPUT',src:SRC_ESC})); process.exit(2) }
}

const owners=new Map()
for(const r of rows){
  const owner=(r.owner||'unassigned').toString()
  const s=r.status||r.state
  const o=owners.get(owner)||{ owner, totals:0, breaches:0, warns:0, pages:0 }
  o.totals++
  if(isBreach(s)) o.breaches++
  else if(isWarn(s)) o.warns++
  if(typeof r.pages==='number') o.pages+=r.pages
  owners.set(owner,o)
}

const out=[...owners.values()].map(o=>{
  const breach_rate = o.totals? Math.round((o.breaches/o.totals)*10000)/100 : 0
  const warn_rate   = o.totals? Math.round((o.warns/o.totals)*10000)/100   : 0
  return { date:`${y}-${m}-${d}`, ...o, breach_rate, warn_rate }
})

await fs.mkdir(OUT_DIR,{recursive:true})
await fs.writeFile(outPath, JSON.stringify({ date:`${y}-${m}-${d}`, owners: out }, null, 2))
console.log(JSON.stringify({ ok:true, out: outPath, owners: out.length }))
