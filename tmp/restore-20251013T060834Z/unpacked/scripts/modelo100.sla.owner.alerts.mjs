#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const TRENDS=path.join(OUT_DIR,'sla.owner.trends.json')
const THR='docs/owner.sla.thresholds.json'
const OUTJ=path.join(OUT_DIR,'sla.owner.alerts.json')
const OUTC=path.join(OUT_DIR,'sla.owner.alerts.csv')

function evalWin(rate, th){ if(!th) return 'ok'; if(rate>=th.fail_max_breach_rate) return 'fail'; if(rate>=th.warn_max_breach_rate) return 'warn'; return 'ok' }

let trends=null, cfg=null
try{ trends=JSON.parse(await fs.readFile(TRENDS,'utf8')) }catch(e){ if(process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'NO_OWNER_TRENDS'})); process.exit(2) } }
try{ cfg=JSON.parse(await fs.readFile(THR,'utf8')) }catch(e){ if(process.env.ALLOW_EMPTY!=='1'){ console.error(JSON.stringify({ok:false,error:'NO_OWNER_THRESHOLDS'})); process.exit(3) } else { cfg={defaults:{},owners:{}} } }

const defaults=cfg.defaults||{}
const ownersCfg=cfg.owners||{}
const byWin=trends?.windows||{}
const ownersSet=new Set()
for(const w of ['d7','d30','d90']) (byWin[w]||[]).forEach(r=>ownersSet.add(r.owner))
const owners=[...ownersSet]

const order={ok:0,warn:1,fail:2}
const result=[]
for(const owner of owners){
  const oCfg = ownersCfg[owner] || ownersCfg['*'] || {}
  const d7  = (byWin.d7 || []).find(r=>r.owner===owner)  || { breach_rate:0, breaches:0, totals:0 }
  const d30 = (byWin.d30|| []).find(r=>r.owner===owner)  || { breach_rate:0, breaches:0, totals:0 }
  const d90 = (byWin.d90|| []).find(r=>r.owner===owner)  || { breach_rate:0, breaches:0, totals:0 }
  const s7  = evalWin(d7.breach_rate,  oCfg.d7  || defaults.d7)
  const s30 = evalWin(d30.breach_rate, oCfg.d30 || defaults.d30)
  const s90 = evalWin(d90.breach_rate, oCfg.d90 || defaults.d90)
  let overall='ok'
  for(const s of [s7,s30,s90]) if(order[s]>order[overall]) overall=s
  result.push({
    owner,
    windows:{
      d7:  { rate:d7.breach_rate,  breaches:d7.breaches,  totals:d7.totals,  status:s7 },
      d30: { rate:d30.breach_rate, breaches:d30.breaches, totals:d30.totals, status:s30 },
      d90: { rate:d90.breach_rate, breaches:d90.breaches, totals:d90.totals, status:s90 }
    },
    overall
  })
}

await fs.writeFile(OUTJ, JSON.stringify({ updated_at:new Date().toISOString(), owners: result }, null, 2))

let csv='owner,window,rate,breaches,totals,status\n'
for(const r of result){
  for(const w of ['d7','d30','d90']){
    const x=r.windows[w]; csv+=`${r.owner},${w},${x.rate},${x.breaches},${x.totals},${x.status}\n`
  }
}
await fs.writeFile(OUTC, csv)

console.log(JSON.stringify({ ok:true, out_json:OUTJ, out_csv:OUTC, owners:result.length }))
