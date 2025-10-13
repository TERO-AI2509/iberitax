#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

async function readJSON(p){ try{ return JSON.parse(await fs.readFile(p,'utf8')) }catch{ return null } }

async function main(){
  const repo = process.cwd()
  const A = (...xs)=>path.join(repo,'artifacts','modelo100',...xs)
  const exp = await readJSON(A('sla.export.json')) || {}
  const queue = await readJSON(A('notify','queue.json')) || { events: [] }
  const routes = await readJSON(path.join(repo,'docs','owners.routes.json')) || {}
  const ownersFromExport = (exp.payload && exp.payload.owners || []).map(o=>o.owner)
  const ownersFromQueue = Array.from(new Set(queue.events.map(e=>e.owner||'unknown')))
  const ownersMissingRoutes = ownersFromQueue.filter(o=>!routes[o] && !routes.default)
  const counts = {
    export_owners: ownersFromExport.length,
    queue_events: queue.events.length,
    owners_with_events: ownersFromQueue.length,
    owners_missing_routes: ownersMissingRoutes.length
  }
  console.log(JSON.stringify({ ok:true, counts, owners_missing_routes: ownersMissingRoutes }, null, 2))
}

main()
