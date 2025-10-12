#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

async function readJSON(p){ try{ return JSON.parse(await fs.readFile(p,'utf8')) }catch{ return null } }
async function exists(p){ try{ await fs.access(p); return true }catch{ return false } }

async function main(){
  const APPLY = process.env.APPLY === '1'
  const ENABLE = process.env.NOTIFY_ENABLE === '1'
  const repo = process.cwd()
  const A = (...xs)=>path.join(repo,'artifacts','modelo100',...xs)
  const queuePath = A('notify','queue.json')
  const routesPath = path.join(repo,'docs','owners.routes.json')
  const outDir = A('notify','out')

  const queue = await readJSON(queuePath) || { events: [] }
  const routes = await readJSON(routesPath) || { default: { webhook:"", email:"" } }

  const results = []

  for(const evt of queue.events){
    const target = routes[evt.owner] || routes.default || {}
    const payload = { kind: evt.kind, owner: evt.owner, ts: evt.ts || new Date().toISOString(), sev: evt.sev || evt.level || null, ref: evt.ref || null }
    const name = `${evt.owner || 'unknown'}-${evt.kind}-${Date.now()}.json`
    await fs.mkdir(outDir,{ recursive:true })
    await fs.writeFile(path.join(outDir,name), JSON.stringify({ target, payload }, null, 2))
    if(ENABLE && target.webhook){
      const res = spawnSync('curl', ['-sS','-X','POST','-H','Content-Type: application/json','--data-binary', JSON.stringify(payload), target.webhook], { encoding:'utf8' })
      results.push({ owner: evt.owner, kind: evt.kind, sent: res.status===0 })
    }else{
      results.push({ owner: evt.owner, kind: evt.kind, sent: false })
    }
  }

  const summary = { total: queue.events.length, attempted: results.filter(r=>r.sent).length, dry_run: !ENABLE }
  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, summary }, null, 2))
    return
  }
  console.log(JSON.stringify({ ok:true, summary }, null, 2))
}

if(isMain){ main() }
