#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR='artifacts/modelo100'

function pct(n,d){ return d? Math.round((n/d)*10000)/100 : 0 }

async function loadDaily(){
  const files = await fs.readdir(OUT_DIR).catch(()=>[])
  const dayFiles = files.filter(f=>/^sla\.owner\.day-\d{8}\.json$/.test(f)).sort()
  const days=[]
  for(const f of dayFiles){
    try{
      const j=JSON.parse(await fs.readFile(path.join(OUT_DIR,f),'utf8'))
      const date=(j.date||'').toString()
      for(const o of (j.owners||[])) days.push({ date, owner:o.owner, totals:o.totals, breaches:o.breaches, warns:o.warns, pages:o.pages })
    }catch(e){
      if(process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'BAD_OWNER_SNAPSHOT',file:f})); process.exit(3) }
    }
  }
  return days
}

function rollup(rows, days){
  const tail = rows.slice(-Infinity) // already unspecific; filter by last N dates per owner below
  // Build map of last N dates per owner
  const byOwner=new Map()
  const dates=[...new Set(tail.map(r=>r.date))].sort()
  const keepDates = dates.slice(-days)
  for(const r of tail){
    if(!keepDates.includes(r.date)) continue
    const key=r.owner
    const arr=byOwner.get(key)||[]
    arr.push(r); byOwner.set(key,arr)
  }
  const res=[]
  for(const [owner,arr] of byOwner){
    const totals=arr.reduce((a,r)=>a+r.totals,0)
    const breaches=arr.reduce((a,r)=>a+r.breaches,0)
    const warns=arr.reduce((a,r)=>a+r.warns,0)
    const pages=arr.reduce((a,r)=>a+r.pages,0)
    res.push({ owner, days, totals, breaches, warns, pages, breach_rate:pct(breaches,totals), warn_rate:pct(warns,totals) })
  }
  res.sort((a,b)=> (b.breach_rate - a.breach_rate) || (b.breaches - a.breaches))
  return res
}

const daily = await loadDaily()
if(daily.length===0 && process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'NO_OWNER_SNAPSHOTS'})); process.exit(4) }

const d7  = rollup(daily,7)
const d30 = rollup(daily,30)
const d90 = rollup(daily,90)

const trends = { updated_at:new Date().toISOString(), owners_total:[...new Set(daily.map(r=>r.owner))].length, windows:{ d7, d30, d90 } }
await fs.writeFile(path.join(OUT_DIR,'sla.owner.trends.json'), JSON.stringify(trends,null,2))

let csv='owner,window,totals,breaches,warns,breach_rate,warn_rate,pages\n'
for(const [win,rows] of Object.entries(trends.windows)){
  for(const r of rows){ csv+=`${r.owner},${win},${r.totals},${r.breaches},${r.warns},${r.breach_rate},${r.warn_rate},${r.pages}\n` }
}
await fs.writeFile(path.join(OUT_DIR,'sla.owner.trends.csv'), csv)

const top5 = (trends.windows.d7||[]).slice(0,5).map(r=>({owner:r.owner, breach_rate:r.breach_rate, breaches:r.breaches, totals:r.totals}))
await fs.writeFile(path.join(OUT_DIR,'sla.owner.top.json'), JSON.stringify({ updated_at:trends.updated_at, top5 }, null, 2))

console.log(JSON.stringify({ ok:true, out_json:'artifacts/modelo100/sla.owner.trends.json', out_csv:'artifacts/modelo100/sla.owner.trends.csv', top:top5 }))
