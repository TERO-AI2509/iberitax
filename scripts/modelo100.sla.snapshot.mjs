#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'
const SRC_ESC = path.join(OUT_DIR, 'owners.escalation.json')
const now = new Date()
const y = now.getFullYear()
const m = String(now.getMonth() + 1).padStart(2, '0')
const d = String(now.getDate()).padStart(2, '0')
const dayFile = `sla.day-${y}${m}${d}.json`
const outPath = path.join(OUT_DIR, dayFile)

function safeRate(n, d) {
  if (!d || d === 0) return 0
  return Math.round((n / d) * 10000) / 100
}

let src = null
let rows = []
let totals = 0
let breaches = 0
let warns = 0
let pages = 0

try {
  const buf = await fs.readFile(SRC_ESC, 'utf8')
  src = JSON.parse(buf)
  const arr = Array.isArray(src) ? src : Array.isArray(src?.rows) ? src.rows : []
  rows = arr
  totals = arr.length
  for (const r of arr) {
    const s = (r.status || r.state || '').toString().toLowerCase()
    if (s === 'breach' || s === 'error' || s === 'failed') breaches++
    else if (s === 'warn' || s === 'warning') warns++
    if (typeof r.pages === 'number') pages += r.pages
  }
} catch (e) {
  if (process.env.ALLOW_EMPTY === '1') {
    rows = []
  } else {
    console.error(JSON.stringify({ ok:false, error:'MISSING_OR_BAD_INPUT', src:SRC_ESC }))
    process.exit(2)
  }
}

const breach_rate = safeRate(breaches, totals)
const warn_rate = safeRate(warns, totals)

const summary = {
  date: `${y}-${m}-${d}`,
  totals,
  breaches,
  warns,
  breach_rate,
  warn_rate,
  pages
}

await fs.mkdir(OUT_DIR, { recursive: true })
await fs.writeFile(outPath, JSON.stringify({ summary, rows_count: rows.length }, null, 2))
console.log(JSON.stringify({ ok:true, out: outPath, summary }))
