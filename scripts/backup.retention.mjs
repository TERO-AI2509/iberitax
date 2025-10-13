import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT_DIR = 'artifacts/backups'
const ARCHIVE_DIR = join(OUT_DIR, 'archive')
const QUAR_DIR = join(OUT_DIR, 'quarantine')
mkdirSync(ARCHIVE_DIR, { recursive: true })
mkdirSync(QUAR_DIR, { recursive: true })

const KEEP = {
  daily: Number(process.env.KEEP_DAILY || 7),
  weekly: Number(process.env.KEEP_WEEKLY || 4),
  monthly: Number(process.env.KEEP_MONTHLY || 12),
}
const APPLY = process.argv.includes('--apply') // otherwise dry-run

// Helpers
const rx = /^backup-(\d{8}T\d{6}Z)\.zip$/
function parseTs(s) {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s)
  if (!match) return null
  const [_, Y, MM, DD, hh, mm, ss] = match
  return new Date(Date.UTC(+Y, +MM-1, +DD, +hh, +mm, +ss))
}
function ym(dt){ return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}` }
function yw(dt){
  const d = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(),0,4))
  const week = 1 + Math.round(((d - firstThu)/86400000 - 3 + ((firstThu.getUTCDay()+6)%7))/7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2,'0')}`
}

// Load verify map (zip → ok)
let verify = {}
const verifyPath = join(OUT_DIR, 'verify.json')
if (existsSync(verifyPath)) {
  try {
    const v = JSON.parse(readFileSync(verifyPath,'utf8'))
    for (const item of v.checked || []) verify[item.zip] = !!item.ok
  } catch {}
}

// Gather backups
const zips = (readdirSync(OUT_DIR).filter(f => rx.test(f))).map(name => {
  const tsStr = rx.exec(name)[1]
  const dt = parseTs(tsStr)
  return { name, dt, tsStr, ok: verify[name] !== false } // default to ok if unknown
}).filter(x => x.dt).sort((a,b) => b.dt - a.dt)

// Partition into keep/prune
const keep = new Set()
const buckets = { daily:[], weekly:{}, monthly:{} }

// Keep latest N daily
for (let i=0; i<zips.length && i<KEEP.daily; i++) {
  keep.add(zips[i].name); buckets.daily.push(zips[i])
}
// Weekly representatives
for (const z of zips.slice(KEEP.daily)) {
  const keyW = yw(z.dt)
  if (!buckets.weekly[keyW]) buckets.weekly[keyW] = []
  buckets.weekly[keyW].push(z)
}
const weeklyKeys = Object.keys(buckets.weekly).sort().reverse()
for (let i=0; i<weeklyKeys.length && i<KEEP.weekly; i++) {
  const list = buckets.weekly[weeklyKeys[i]].sort((a,b)=>b.dt-a.dt)
  if (list[0]) keep.add(list[0].name)
}
// Monthly representatives
for (const z of zips.slice(KEEP.daily)) {
  const keyM = ym(z.dt)
  if (!buckets.monthly[keyM]) buckets.monthly[keyM] = []
  buckets.monthly[keyM].push(z)
}
const monthlyKeys = Object.keys(buckets.monthly).sort().reverse()
for (let i=0; i<monthlyKeys.length && i<KEEP.monthly; i++) {
  const list = buckets.monthly[monthlyKeys[i]].sort((a,b)=>b.dt-a.dt)
  if (list[0]) keep.add(list[0].name)
}

// Plan actions
const actions = []
for (const z of zips) {
  if (keep.has(z.name)) {
    actions.push({ zip:z.name, action:'keep', verified:z.ok })
  } else {
    const base = z.name.replace(/\.zip$/,'')
    const companions = [`${base}.zip.sha256`, `${base}.zip.meta.json`]
    if (z.ok) {
      actions.push({ zip:z.name, action:'archive', to: join('archive', z.name), verified:true })
      for (const c of companions) actions.push({ zip:c, action:'archive', to: join('archive', c), verified:true })
    } else {
      actions.push({ zip:z.name, action:'quarantine', to: join('quarantine', z.name), verified:false })
      for (const c of companions) actions.push({ zip:c, action:'quarantine', to: join('quarantine', c), verified:false })
    }
  }
}

// Apply (moves) or dry-run
let moved = 0, errors = 0
if (APPLY) {
  for (const a of actions) {
    if (a.action === 'keep') continue
    const from = join(OUT_DIR, a.zip)
    const to = join(OUT_DIR, a.to)
    try {
      if (existsSync(from)) { renameSync(from, to); moved++ }
    } catch (e) { a.error = String(e); errors++ }
  }
}

// Report JSON
const report = {
  ok: errors === 0,
  totals: {
    backups: zips.length,
    keep: actions.filter(a=>a.action==='keep').length,
    archive: actions.filter(a=>a.action==='archive').length,
    quarantine: actions.filter(a=>a.action==='quarantine').length,
    moved
  },
  keepPolicy: KEEP,
  actions
}
writeFileSync(join(OUT_DIR, 'retention.json'), JSON.stringify(report,null,2), 'utf8')

// Report HTML
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;') }
const rows = zips.map(z=>{
  const k = keep.has(z.name)
  const cls = k ? 'keep' : (verify[z.name]===false ? 'quarantine' : 'archive')
  const badge = k ? 'KEEP' : (verify[z.name]===false ? 'QUARANTINE' : 'ARCHIVE')
  return `<tr class="${cls}"><td>${esc(z.name)}</td><td>${z.dt.toISOString()}</td><td>${badge}</td></tr>`
}).join('\n')

const html = `<!doctype html>
<meta charset="utf-8">
<title>Backup Retention</title>
<style>
body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:20px}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:8px}
th{background:#fafafa}
.keep{background:#f6ffed}
.archive{background:#fffbe6}
.quarantine{background:#fff1f0}
.summary{margin:10px 0;font-weight:600}
code{background:#f6f8fa;padding:2px 4px;border-radius:4px}
</style>
<h1>Backup Retention</h1>
<div class="summary">
Backups: ${report.totals.backups} • Keep: ${report.totals.keep} • To archive: ${report.totals.archive} • To quarantine: ${report.totals.quarantine} • ${APPLY?'Moved':'Dry-run'}: ${report.totals.moved}
</div>
<p>Policy — daily: <code>${KEEP.daily}</code> • weekly: <code>${KEEP.weekly}</code> • monthly: <code>${KEEP.monthly}</code></p>
<table>
<thead><tr><th>ZIP</th><th>Date (UTC)</th><th>Action</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`
writeFileSync(join(OUT_DIR, 'retention.html'), html, 'utf8')

if (errors) process.exit(1)
