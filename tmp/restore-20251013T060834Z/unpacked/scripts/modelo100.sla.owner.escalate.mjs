#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const ALERTS=path.join(OUT_DIR,'sla.owner.alerts.json')
const MATRIX='docs/sla.escalation.matrix.json'

function maxTrailingStreak(boolSeries){
  let s=0, max=0
  for(let i=boolSeries.length-1;i>=0;i--){
    if(boolSeries[i]){ s++; if(s>max) max=s } else break
  }
  return s
}

async function loadOwnerDaily(){
  const files = await fs.readdir(OUT_DIR).catch(()=>[])
  const dayFiles = files.filter(f=>/^sla\.owner\.day-\d{8}\.json$/.test(f)).sort()
  const perOwnerDates = new Map()
  for(const f of dayFiles){
    try{
      const j=JSON.parse(await fs.readFile(path.join(OUT_DIR,f),'utf8'))
      const date=j.date
      for(const o of (j.owners||[])){
        const a=perOwnerDates.get(o.owner)||[]
        a.push({date, breaches:o.breaches})
        perOwnerDates.set(o.owner,a)
      }
    }catch(e){}
  }
  return perOwnerDates
}

function decideLevel(a, streak, matrix){
  const d7s  = a.windows?.d7?.status || 'ok'
  const d7r  = a.windows?.d7?.rate   || 0
  const overall = a.overall || 'ok'
  const rules = matrix.rules||[]
  let level='none'
  const order = {none:0, notify:1, page:2}
  for(const r of rules){
    const w=r.when||{}
    const conds=[
      w.overall ? (overall===w.overall) : true,
      w.d7_status ? (d7s===w.d7_status) : true,
      w.d7_rate_gte!=null ? (d7r >= w.d7_rate_gte) : true,
      w.streak_gte!=null ? (streak >= w.streak_gte) : true
    ]
    if(conds.every(Boolean)){
      if(order[r.level] > order[level]) level = r.level
    }
  }
  return level
}

let alerts=null, matrix=null
try{ alerts=JSON.parse(await fs.readFile(ALERTS,'utf8')) }catch(e){ if(process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'NO_OWNER_ALERTS'})); process.exit(2) } else { alerts={owners:[]} } }
try{ matrix=JSON.parse(await fs.readFile(MATRIX,'utf8')) }catch(e){ if(process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'NO_MATRIX'})); process.exit(3) } else { matrix={rules:[]} } }

const perOwnerDaily = await loadOwnerDaily()
const out=[]
for(const a of (alerts.owners||[])){
  const owner=a.owner
  const series = (perOwnerDaily.get(owner)||[]).map(x=> (x.breaches||0) > 0 )
  const streak = maxTrailingStreak(series)
  const level = decideLevel(a, streak, matrix)
  out.push({ owner, streak, level, overall:a.overall, d7_rate:a.windows?.d7?.rate||0, d7_status:a.windows?.d7?.status||'ok' })
}

await fs.writeFile(path.join(OUT_DIR,'sla.owner.escalations.json'), JSON.stringify({ updated_at:new Date().toISOString(), rows: out }, null, 2))
let csv='owner,streak,level,overall,d7_rate,d7_status\n'
for(const r of out) csv+=`${r.owner},${r.streak},${r.level},${r.overall},${r.d7_rate},${r.d7_status}\n`
await fs.writeFile(path.join(OUT_DIR,'sla.owner.escalations.csv'), csv)
console.log(JSON.stringify({ ok:true, out_json:'artifacts/modelo100/sla.owner.escalations.json', out_csv:'artifacts/modelo100/sla.owner.escalations.csv', rows:out.length }))
