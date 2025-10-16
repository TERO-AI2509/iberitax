#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'

function parseDay(fn) {
  const m = fn.match(/sla\.day-(\d{4})(\d{2})(\d{2})\.json$/)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}`
}

function toPct(n, d) {
  if (!d) return 0
  return Math.round((n / d) * 10000) / 100
}

async function loadDaily() {
  const files = await fs.readdir(OUT_DIR).catch(()=>[])
  const dayFiles = files.filter(f => /^sla\.day-\d{8}\.json$/.test(f))
  dayFiles.sort()
  const rows = []
  for (const f of dayFiles) {
    try {
      const json = JSON.parse(await fs.readFile(path.join(OUT_DIR, f), 'utf8'))
      const date = parseDay(f)
      if (!date) continue
      const s = json.summary || {}
      rows.push({
        date,
        totals: Number(s.totals || 0),
        breaches: Number(s.breaches || 0),
        warns: Number(s.warns || 0),
        breach_rate: Number(s.breach_rate || 0),
        warn_rate: Number(s.warn_rate || 0),
        pages: Number(s.pages || 0)
      })
    } catch (e) {
      console.error(JSON.stringify({ ok:false, error:'BAD_SNAPSHOT', file:f }))
      if (process.env.ALLOW_EMPTY === '1') continue
      process.exit(3)
    }
  }
  return rows
}

function windowAgg(rows, days) {
  const tail = rows.slice(-days)
  const totals = tail.reduce((a,r)=>a+r.totals,0)
  const breaches = tail.reduce((a,r)=>a+r.breaches,0)
  const warns = tail.reduce((a,r)=>a+r.warns,0)
  const pages = tail.reduce((a,r)=>a+r.pages,0)
  return {
    days,
    totals,
    breaches,
    warns,
    pages,
    breach_rate: toPct(breaches, totals),
    warn_rate: toPct(warns, totals)
  }
}

const daily = await loadDaily()
if (daily.length === 0 && process.env.ALLOW_EMPTY !== '1') {
  console.error(JSON.stringify({ ok:false, error:'NO_SNAPSHOTS' }))
  process.exit(4)
}

const trends = {
  updated_at: new Date().toISOString(),
  counts: daily.length,
  daily,
  rollups: {
    d7: windowAgg(daily, 7),
    d30: windowAgg(daily, 30),
    d90: windowAgg(daily, 90)
  }
}

await fs.writeFile(path.join(OUT_DIR,'sla.trends.json'), JSON.stringify(trends, null, 2))

let csv = 'date,totals,breaches,warns,breach_rate\n'
for (const r of daily) {
  csv += `${r.date},${r.totals},${r.breaches},${r.warns},${r.breach_rate}\n`
}
await fs.writeFile(path.join(OUT_DIR,'sla.trends.csv'), csv)

console.log(JSON.stringify({ ok:true, out_json:'artifacts/modelo100/sla.trends.json', out_csv:'artifacts/modelo100/sla.trends.csv', d7:trends.rollups.d7, d30:trends.rollups.d30, d90:trends.rollups.d90 }))
