#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

async function readJSON(p){ try{ return JSON.parse(await fs.readFile(p,'utf8')) }catch{ return null } }
function toArray(v){ return Array.isArray(v) ? v : [] }

async function main(){
  const APPLY = process.env.APPLY === '1'
  const repo = process.cwd()
  const a = (...xs)=>path.join(repo,'artifacts','modelo100',...xs)
  const exportPath = a('sla.export.json')
  const outDir = a('public','api')

  const exp = await readJSON(exportPath)
  if(!exp){ console.error(JSON.stringify({ ok:false, error:'missing sla.export.json' },null,2)); process.exit(2) }

  const summary = exp.payload?.summary || {}
  const owners = toArray(exp.payload?.owners)
  const meta = { commit: exp.payload?.meta?.repo_commit || '', hash: exp.signature?.hash || '', generated_at: exp.signature?.generated_at || '' }

  const endpoints = {
    'summary.json': { summary, meta },
    'owners.json': owners,
    'badges.json': { owners: summary.owners||0, alerts: summary.alerts||0, escalations: summary.escalations||0 }
  }

  const plan = { outDir, files: Object.keys(endpoints) }
  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, plan }, null, 2))
    return
  }

  await fs.mkdir(outDir,{ recursive:true })
  for(const [name,body] of Object.entries(endpoints)){
    await fs.writeFile(path.join(outDir,name), JSON.stringify(body,null,2))
  }
  console.log(JSON.stringify({ ok:true, outDir, files: Object.keys(endpoints) }, null, 2))
}

if(isMain){ main() }
