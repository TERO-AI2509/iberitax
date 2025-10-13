#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const ESJ=path.join(OUT_DIR,'owners.escalation.json')
const ROUTES='docs/owners.routes.json'
const NDIR=path.join(OUT_DIR,'notify')
const QIDX=path.join(NDIR,'index.json')

function nowISO(){ return new Date().toISOString() }

async function main(){
  const esc = await fs.readFile(ESJ,'utf8').then(s=>JSON.parse(s)).catch(()=>null)
  const routes = await fs.readFile(ROUTES,'utf8').then(s=>JSON.parse(s)).catch(()=>null)
  if(!esc || !routes){
    console.log(JSON.stringify({ok:false,error:'missing_inputs',need:{escalation:ESJ,routes:ROUTES}}))
    process.exitCode=2; return
  }
  await fs.mkdir(NDIR,{recursive:true})
  const owners = (esc.owners||[]).filter(o=>o.pages||o.breaches||o.warns)
  const queue=[]
  for(const o of owners){
    const route = routes[o.owner] || routes['_unassigned'] || {}
    const webhook = (route && route.webhook || '').trim()
    if(!webhook){ continue } // disabled
    const payload = {
      kind: 'owner_escalation',
      ts: nowISO(),
      owner: o.owner,
      summary: {
        total:o.total, breaches:o.breaches, pages:o.pages, warns:o.warns, ok:o.ok, ignored:o.ignored, unknown:o.unknown
      },
      incidents: o.incidents
        .filter(i=>i.page||i.breach||i.status==='breach'||i.warn)
        .map(i=>({
          id:i.id, severity:i.severity, status:i.status, age_days:i.age_days, threshold_days:i.threshold_days, warn:!!i.warn, page:!!i.page
        })),
      route: { webhook }
    }
    const fname = path.join(NDIR, `${o.owner.replace(/[^a-z0-9_\-\.]/gi,'_')}.json`)
    await fs.writeFile(fname, JSON.stringify(payload,null,2))
    queue.push({ owner:o.owner, file: fname, webhook })
  }
  await fs.writeFile(QIDX, JSON.stringify({ok:true, ts:nowISO(), total:queue.length, queue}, null, 2))
  console.log(JSON.stringify({ok:true, out:{dir:NDIR,index:QIDX}, total:queue.length}))
}
await main()
