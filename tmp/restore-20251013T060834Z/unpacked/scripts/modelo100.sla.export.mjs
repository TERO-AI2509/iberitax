#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

function stableStringify(input){
  const seen = new WeakSet()
  const sorter = (v)=>{
    if(v && typeof v === 'object'){
      if(seen.has(v)) return null
      seen.add(v)
      if(Array.isArray(v)) return v.map(sorter)
      return Object.keys(v).sort().reduce((acc,k)=>{ acc[k]=sorter(v[k]); return acc },{})
    }
    return v
  }
  return JSON.stringify(sorter(input), null, 2)
}

async function readJSONMaybe(p){
  try{
    const s = await fs.readFile(p,'utf8')
    return JSON.parse(s)
  }catch(e){
    return null
  }
}

function toArray(v){
  if(Array.isArray(v)) return v
  if(v && typeof v==='object'){
    if(Array.isArray(v.rows)) return v.rows
    if(Array.isArray(v.items)) return v.items
    if(Array.isArray(v.data)) return v.data
    const vals = Object.values(v).filter(x=>x && typeof x==='object' && !Array.isArray(x))
    if(vals.length===0) return []
    return []
  }
  return []
}

async function sha256File(p){
  const b = await fs.readFile(p)
  return crypto.createHash('sha256').update(b).digest('hex')
}

async function gitCommit(){
  try{
    await fs.readFile('.git/HEAD','utf8')
    const { execSync } = await import('node:child_process')
    return execSync('git rev-parse HEAD').toString().trim()
  }catch{
    return 'unknown'
  }
}

async function main(){
  const APPLY = process.env.APPLY === '1'
  const repo = process.cwd()
  const artifactsDir = path.join(repo,'artifacts','modelo100')
  const outFile = path.join(artifactsDir,'sla.export.json')

  const commit = await gitCommit()
  const ts = new Date().toISOString()

  const ownersAlertsRaw = await readJSONMaybe(path.join(artifactsDir,'sla.owner.alerts.json'))
  const ownersEscRaw = await readJSONMaybe(path.join(artifactsDir,'sla.owner.escalations.json'))
  const thresholds = await readJSONMaybe(path.join('docs','owner.sla.thresholds.json')) || {}
  const matrix = await readJSONMaybe(path.join('docs','sla.escalation.matrix.json')) || {}

  const ownersAlerts = toArray(ownersAlertsRaw)
  const ownersEsc = toArray(ownersEscRaw)

  const owners = new Set()
  for(const r of ownersAlerts){ if(r && r.owner) owners.add(r.owner) }
  for(const r of ownersEsc){ if(r && r.owner) owners.add(r.owner) }

  const alertsByOwner = {}
  for(const r of ownersAlerts){ const k=r && r.owner ? r.owner : 'unknown'; alertsByOwner[k]=(alertsByOwner[k]||0)+1 }
  const escByOwner = {}
  for(const r of ownersEsc){ const k=r && r.owner ? r.owner : 'unknown'; escByOwner[k]=(escByOwner[k]||0)+1 }

  const totalAlerts = ownersAlerts.length
  const totalEscalations = ownersEsc.length

  const summary = {
    owners: owners.size,
    alerts: totalAlerts,
    escalations: totalEscalations
  }

  const global = {
    thresholds,
    escalation_matrix: matrix
  }

  const ownersList = Array.from(owners).sort().map(o=>({
    owner: o,
    alerts: alertsByOwner[o]||0,
    escalations: escByOwner[o]||0
  }))

  const payload = {
    meta: {
      project: 'TERO Fiscal · Iberitax · Modelo 100',
      kind: 'sla-export',
      version: 1,
      generated_at: ts,
      repo_commit: commit
    },
    summary,
    global,
    owners: ownersList
  }

  const canonical = stableStringify(payload)
  const hash = crypto.createHash('sha256').update(canonical).digest('hex')

  const signed = {
    signature: {
      alg: 'sha256',
      hash,
      generated_at: ts,
      repo_commit: commit
    },
    payload
  }

  const plan = { out: outFile, bytes: Buffer.byteLength(JSON.stringify(signed)) }

  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, plan }, null, 2))
    return
  }

  await fs.mkdir(artifactsDir,{ recursive:true })
  await fs.writeFile(outFile, stableStringify(signed))
  const verifyHash = await sha256File(outFile)

  const ok = verifyHash === hash
  console.log(JSON.stringify({ ok, out: outFile, file_sha256: verifyHash, payload_sha256: hash, owners: owners.size, alerts: totalAlerts, escalations: totalEscalations }, null, 2))
  process.exit(ok ? 0 : 2)
}

if(isMain){ main() }
