#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

async function readJSON(p){ try{ return JSON.parse(await fs.readFile(p,'utf8')) }catch{ return null } }
function toArray(v){ return Array.isArray(v) ? v : [] }
function csvRow(arr){ return arr.map(x=>String(x??'').replace(/"/g,'""')).map(x=>`"${x}"`).join(',') }
async function exists(p){ try{ await fs.access(p); return true }catch{ return false } }

async function main(){
  const APPLY = process.env.APPLY === '1'
  const repo = process.cwd()
  const A = (...xs)=>path.join(repo,'artifacts','modelo100',...xs)
  const outDir = A('report')
  const exportPath = A('sla.export.json')
  const alertsPath = A('sla.owner.alerts.json')
  const escPath = A('sla.owner.escalations.json')

  const exp = await readJSON(exportPath)
  if(!exp){ console.error(JSON.stringify({ ok:false, error:'missing sla.export.json' },null,2)); process.exit(2) }

  const owners = toArray(exp.payload?.owners)
  const summary = exp.payload?.summary || { owners:0, alerts:0, escalations:0 }
  const meta = exp.signature || {}

  const alerts = toArray(await readJSON(alertsPath))
  const esc = toArray(await readJSON(escPath))

  const ownersCsv = [
    csvRow(['owner','alerts','escalations']),
    ...owners.map(o=>csvRow([o.owner, o.alerts, o.escalations]))
  ].join('\n')

  const summaryCsv = [
    csvRow(['owners','alerts','escalations','generated_at','repo_commit','hash']),
    csvRow([summary.owners, summary.alerts, summary.escalations, meta.generated_at||'', meta.repo_commit||'', meta.hash||''])
  ].join('\n')

  const alertsCsv = [
    csvRow(['owner','ref','sev','ts']),
    ...alerts.map(r=>csvRow([r?.owner||'unknown', r?.ref||'', r?.sev||'', r?.ts||'']))
  ].join('\n')

  const escalationsCsv = [
    csvRow(['owner','level','ts']),
    ...esc.map(r=>csvRow([r?.owner||'unknown', r?.level||'', r?.ts||'']))
  ].join('\n')

  const plan = { outDir, files:['owners.csv','summary.csv','alerts.csv','escalations.csv'] }
  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, plan }, null, 2))
    return
  }

  await fs.mkdir(outDir,{ recursive:true })
  await fs.writeFile(path.join(outDir,'owners.csv'), ownersCsv)
  await fs.writeFile(path.join(outDir,'summary.csv'), summaryCsv)
  await fs.writeFile(path.join(outDir,'alerts.csv'), alertsCsv)
  await fs.writeFile(path.join(outDir,'escalations.csv'), escalationsCsv)

  console.log(JSON.stringify({ ok:true, outDir, files:plan.files }, null, 2))
}

if(isMain){ main() }
