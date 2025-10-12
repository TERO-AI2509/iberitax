#!/usr/bin/env node
import fs from 'node:fs/promises'
import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(_exec)

const ESC='artifacts/modelo100/sla.owner.escalations.json'
const ROUTES='docs/owners.routes.json'

let esc=null, routes=null
try{ esc=JSON.parse(await fs.readFile(ESC,'utf8')) }catch(e){ console.error(JSON.stringify({ok:false,error:'NO_ESCALATIONS'})); process.exit(2) }
routes = await fs.readFile(ROUTES,'utf8').then(JSON.parse).catch(()=>({ rows:[] }))
const routeMap=new Map()
for(const r of (routes.rows||[])){ if(r.owner && r.webhook) routeMap.set(String(r.owner), String(r.webhook)) }

const candidates=(esc.rows||[]).filter(r=> r.level==='notify' || r.level==='page')
const shouldSend = process.env.NOTIFY_ENABLE==='1'

if(!shouldSend){
  console.log(JSON.stringify({ ok:true, sent:false, reason:'dry-run', candidates:candidates.length }))
  process.exit(0)
}

let delivered=0, failed=0
for(const r of candidates){
  const url = routeMap.get(String(r.owner))
  if(!url) { failed++; continue }
  const payload = JSON.stringify({ kind:'owner_sla_escalation', owner:r.owner, level:r.level, streak:r.streak, overall:r.overall, d7_rate:r.d7_rate, d7_status:r.d7_status }, null, 2)
  try{
    await exec(`curl -fsS -X POST -H "Content-Type: application/json" --data @- ${url}`, { input: payload })
    delivered++
  }catch(e){ failed++ }
}
console.log(JSON.stringify({ ok:true, sent:true, delivered, failed, candidates:candidates.length }))
