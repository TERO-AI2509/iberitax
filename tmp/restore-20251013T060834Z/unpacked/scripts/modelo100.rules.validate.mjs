#!/usr/bin/env node
import { loadRules } from './modelo100.rules.load.mjs'
import fs from 'node:fs/promises'

const { rules, errors } = await loadRules()
if (errors.length) {
  console.error('Schema errors:')
  for (const e of errors) console.error('-', e)
  process.exit(1)
}
if (!rules.length) {
  console.error('No rules found under /rules — index would be empty.')
  process.exit(2)
}

const warnings=[]
for (const r of rules){
  if(!r.owner) warnings.push(`Optional "owner" missing for ${r.id}`)
  if(!r.status) warnings.push(`Optional "status" missing for ${r.id}`)
  if(!r.updated) warnings.push(`Optional "updated" missing for ${r.id}`)
}
if (warnings.length){
  console.warn('Optional field warnings:')
  for (const w of warnings) console.warn('-', w)
}

try {
  const html = await fs.readFile('artifacts/modelo100/rules.index.html','utf8').catch(()=>null)
  if (!html || !/RULE-/.test(html)) {
    console.error('rules.index.html missing or has no RULE-* content.')
    process.exit(3)
  }
} catch (e) {
  console.error('Validation error:', e.message)
  process.exit(4)
}
console.log(JSON.stringify({ ok:true, count: rules.length, warnings: warnings.length }, null, 2))
