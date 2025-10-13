#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadRules } from './modelo100.rules.load.mjs'

const OUT_DIR = 'artifacts/modelo100'
const CSV_ALL = path.join(OUT_DIR,'rules.meta.csv')
const CSV_MISSING = path.join(OUT_DIR,'rules.meta.missing.csv')
const JSON_MISSING = path.join(OUT_DIR,'rules.meta.missing.json')

function toCSV(rows){
  const head = ['id','owner','status','updated']
  const esc = v => {
    const s = (v??'').toString()
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`
    return s
  }
  return [head.join(','), ...rows.map(r=>head.map(k=>esc(r[k])).join(','))].join('\n')+'\n'
}

function missingAny(r){
  return !(r.owner && r.status && r.updated)
}

async function main(){
  const { rules, errors } = await loadRules()
  if(errors.length) throw new Error(errors.join('\n'))
  await fs.mkdir(OUT_DIR,{recursive:true})
  const meta = rules.map(r=>({ id:r.id, owner:r.owner||'', status:r.status||'', updated:r.updated||'' }))
  const miss = meta.filter(missingAny)
  await fs.writeFile(CSV_ALL, toCSV(meta), 'utf8')
  await fs.writeFile(CSV_MISSING, toCSV(miss), 'utf8')
  await fs.writeFile(JSON_MISSING, JSON.stringify({ total: meta.length, missing: miss.length, items: miss }, null, 2), 'utf8')
  console.log(JSON.stringify({ ok:true, out:{ all: CSV_ALL, missing_csv: CSV_MISSING, missing_json: JSON_MISSING }, total: meta.length, missing: miss.length }))
}
main().catch(e=>{ console.error(e.message||e); process.exit(1) })
