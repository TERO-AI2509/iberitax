#!/usr/bin/env node
import fs from 'node:fs/promises'
import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(_exec)

const ALERTS = 'artifacts/modelo100/sla.alerts.json'
const ROUTES = 'docs/owners.routes.json'

let alerts=null, routes=null
try{ alerts = JSON.parse(await fs.readFile(ALERTS,'utf8')) }catch(e){
  console.error(JSON.stringify({ok:false,error:'NO_ALERTS'})); process.exit(2)
}
routes = await fs.readFile(ROUTES,'utf8').then(JSON.parse).catch(()=>({ rows:[] }))

const status = alerts.overall || 'ok'
const shouldSend = process.env.NOTIFY_ENABLE==='1' && (status==='warn' || status==='fail')
const rows = Array.isArray(routes?.rows) ? routes.rows : []
const targets = rows.map(r=>r.webhook).filter(Boolean)

const payload = JSON.stringify({ kind:'sla_alert', status, alerts }, null, 2)

if(!shouldSend){
  console.log(JSON.stringify({ ok:true, sent:false, reason:'dry-run-or-ok', targets:targets.length }))
  process.exit(0)
}

let ok=0, fail=0
for(const url of targets){
  try{
    await exec(`curl -fsS -X POST -H "Content-Type: application/json" --data @- ${url}`, { input: payload })
    ok++
  }catch(e){ fail++ }
}
console.log(JSON.stringify({ ok:true, sent:true, delivered:ok, failed:fail, targets:targets.length }))
