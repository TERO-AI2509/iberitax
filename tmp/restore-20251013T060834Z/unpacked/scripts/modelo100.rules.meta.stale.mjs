#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadRules } from './modelo100.rules.load.mjs'

const OUT_DIR='artifacts/modelo100'
const OUT_JSON=path.join(OUT_DIR,'rules.meta.stale.json')
const OUT_CSV=path.join(OUT_DIR,'rules.meta.stale.csv')
const DAYS=parseInt(process.env.STALE_DAYS||'90',10)

function toCSV(rows){
  const head=['id','owner','status','updated','age_days']
  const esc=v=>{const s=(v??'').toString(); return /[,"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
  return [head.join(','),...rows.map(r=>head.map(k=>esc(r[k])).join(','))].join('\n')+'\n'
}
function daysSince(d){
  if(!d) return Number.POSITIVE_INFINITY
  const m=d.match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m) return Number.POSITIVE_INFINITY
  const dt=new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`)
  const ms=Date.now()-dt.getTime()
  return Math.floor(ms/86400000)
}
async function main(){
  const {rules,errors}=await loadRules()
  if(errors.length) throw new Error(errors.join('\n'))
  await fs.mkdir(OUT_DIR,{recursive:true})
  const items=[]
  for(const r of rules){
    const age=daysSince(r.updated||'')
    if(!isFinite(age) || age>DAYS) items.push({id:r.id,owner:r.owner||'',status:r.status||'',updated:r.updated||'',age_days:isFinite(age)?age:'NA'})
  }
  await fs.writeFile(OUT_JSON, JSON.stringify({threshold_days:DAYS,total:rules.length,stale:items.length,items},null,2),'utf8')
  await fs.writeFile(OUT_CSV, toCSV(items),'utf8')
  console.log(JSON.stringify({ok:true,out:{json:OUT_JSON,csv:OUT_CSV},stale:items.length,threshold_days:DAYS}))
}
main().catch(e=>{console.error(e.message||e);process.exit(1)})
