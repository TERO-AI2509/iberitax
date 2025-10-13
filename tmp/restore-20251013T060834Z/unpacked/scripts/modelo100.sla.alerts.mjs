#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'
const TRENDS = path.join(OUT_DIR,'sla.trends.json')
const THRESH = 'docs/sla.thresholds.json'
const OUT = path.join(OUT_DIR,'sla.alerts.json')

function evalWin(rate, th) {
  if (rate >= th.fail_max_breach_rate) return 'fail'
  if (rate >= th.warn_max_breach_rate) return 'warn'
  return 'ok'
}

let trends=null, cfg=null
try{ trends = JSON.parse(await fs.readFile(TRENDS,'utf8')) }catch(e){
  if(process.env.ALLOW_EMPTY==='1'){ trends=null } else { console.error(JSON.stringify({ok:false,error:'NO_TRENDS'})); process.exit(2) }
}
try{ cfg = JSON.parse(await fs.readFile(THRESH,'utf8')) }catch(e){
  if(process.env.ALLOW_EMPTY==='1'){ cfg={ windows:{} } } else { console.error(JSON.stringify({ok:false,error:'NO_THRESHOLDS'})); process.exit(3) }
}

const roll = trends?.rollups||{}
const wins = cfg.windows||{}
const d7r  = roll.d7?.breach_rate ?? 0
const d30r = roll.d30?.breach_rate ?? 0
const d90r = roll.d90?.breach_rate ?? 0

const res = {
  updated_at: new Date().toISOString(),
  windows: {
    d7:  { rate: d7r,  status: wins.d7  ? evalWin(d7r,  wins.d7)  : 'ok' },
    d30: { rate: d30r, status: wins.d30 ? evalWin(d30r, wins.d30) : 'ok' },
    d90: { rate: d90r, status: wins.d90 ? evalWin(d90r, wins.d90) : 'ok' }
  }
}
const order = { ok:0, warn:1, fail:2 }
let overall = 'ok'
for(const k of ['d7','d30','d90']){
  const s = res.windows[k]?.status || 'ok'
  if(order[s] > order[overall]) overall = s
}
res.overall = overall

await fs.mkdir(OUT_DIR,{recursive:true})
await fs.writeFile(OUT, JSON.stringify(res,null,2))
console.log(JSON.stringify({ ok:true, out:OUT, overall, d7:res.windows.d7, d30:res.windows.d30, d90:res.windows.d90 }))
