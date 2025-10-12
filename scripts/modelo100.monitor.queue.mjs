#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

async function readJSON(p){ try{ return JSON.parse(await fs.readFile(p,'utf8')) }catch{ return null } }
function toArray(v){ return Array.isArray(v) ? v : [] }
function now(){ return new Date().toISOString() }

async function main(){
  const APPLY = process.env.APPLY === '1'
  const MAX = parseInt(process.env.MAX || '500',10)
  const repo = process.cwd()
  const A = (...xs)=>path.join(repo,'artifacts','modelo100',...xs)
  const alerts = toArray(await readJSON(A('sla.owner.alerts.json')))
  const escal = toArray(await readJSON(A('sla.owner.escalations.json')))
  const outDir = A('notify')
  const queueFile = A('notify','queue.json')

  const events = []
  for(const r of alerts.slice(-MAX)){
    events.push({
      kind:'alert',
      owner:r && r.owner || 'unknown',
      ref:r && r.ref || null,
      sev:r && r.sev || null,
      ts:r && r.ts || null,
      payload:r || {}
    })
  }
  for(const r of escal.slice(-MAX)){
    events.push({
      kind:'escalation',
      owner:r && r.owner || 'unknown',
      level:r && r.level || null,
      ts:r && r.ts || null,
      payload:r || {}
    })
  }

  const meta = { generated_at: now(), total: events.length }
  const queue = { meta, events }

  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, plan:{ out: queueFile, total: events.length } }, null, 2))
    return
  }

  await fs.mkdir(outDir,{ recursive:true })
  await fs.writeFile(queueFile, JSON.stringify(queue,null,2))
  console.log(JSON.stringify({ ok:true, out: queueFile, total: events.length }, null, 2))
}

if(isMain){ main() }
