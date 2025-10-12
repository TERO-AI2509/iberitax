#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'

const OUT_DIR = 'artifacts/modelo100'
const MISS_JSON = path.join(OUT_DIR,'rules.meta.missing.json')
const ALLOW_MISSING = process.env.ALLOW_MISSING === '1'
const REQUIRE_DATE_FMT = process.env.REQUIRE_DATE_FMT !== '0'

function isISO(d){ return /^\d{4}-\d{2}-\d{2}$/.test(d) }

async function main(){
  const payload = JSON.parse(await fs.readFile(MISS_JSON,'utf8'))
  const issues=[]
  if((payload?.missing??0) > 0 && !ALLOW_MISSING){
    issues.push(`Missing metadata count is ${payload.missing}. Set ALLOW_MISSING=1 to bypass.`)
  }
  if(REQUIRE_DATE_FMT){
    for(const it of payload.items||[]){
      if(it.updated && !isISO(it.updated)) issues.push(`Bad date format in ${it.id}: ${it.updated} (YYYY-MM-DD expected)`)
    }
  }
  let diff=''
  try{
    diff = execSync('git diff --name-only', { stdio:['ignore','pipe','pipe'] }).toString().trim()
  }catch{}
  const changed = diff ? diff.split(/\r?\n/).filter(Boolean) : []
  const touchedRules = changed.filter(p=>p.startsWith('rules/'))
  const result = { ok: issues.length===0, missing: payload?.missing??0, issues, changed_rules: touchedRules }
  console.log(JSON.stringify(result,null,2))
  if(issues.length) process.exit(2)
}
main().catch(e=>{ console.error(e.message||e); process.exit(1) })
