import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const OUT_DIR = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'artifacts/backups'
const REQUIRED_PATH = process.argv.includes('--required') ? process.argv[process.argv.indexOf('--required') + 1] : 'docs/backup.required.json'
mkdirSync(OUT_DIR, { recursive: true })

function sha256File(p) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const s = createReadStream(p)
    s.on('data', d => hash.update(d))
    s.on('error', reject)
    s.on('end', () => resolve(hash.digest('hex')))
  })
}

function listZip(zipPath) {
  try {
    const out = execFileSync('unzip', ['-l', zipPath], { encoding: 'utf8' })
    const lines = out.split('\n').slice(3, -2)
    const files = []
    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      const fname = parts.slice(3).join(' ')
      if (fname) files.push(fname)
    }
    return files
  } catch (e) {
    return { error: String(e) }
  }
}

function loadRequiredList() {
  if (existsSync(REQUIRED_PATH)) {
    try {
      const list = JSON.parse(readFileSync(REQUIRED_PATH, 'utf8'))
      if (Array.isArray(list) && list.every(x => typeof x === 'string')) return list
    } catch {}
  }
  return ['README.md', 'package.json', 'scripts/', 'docs/']
}

function htmlEscape(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

const zips = readdirSync(OUT_DIR).filter(f => f.endsWith('.zip')).sort()
const required = loadRequiredList()
const report = { ok: true, checked: [], totals: { passed:0, failed:0, skipped:0 } }

const shaLine = s => s.trim().split(/\s+/)[0]

for (const zip of zips) {
  const zipPath = join(OUT_DIR, zip)
  const base = zip.replace(/\.zip$/,'')
  const metaPath = join(OUT_DIR, base + '.zip.meta.json')
  const shaPath  = join(OUT_DIR, base + '.zip.sha256')
  let status = { zip, ok: true, checks: [] }

  const files = listZip(zipPath)
  if (Array.isArray(files)) {
    const present = new Set(files)
    for (const req of required) {
      const hit = [...present].some(f => req.endsWith('/') ? f.startsWith(req) : f === req)
      status.checks.push({ type:'required', target:req, ok:hit })
      if (!hit) status.ok = false
    }
  } else {
    status.checks.push({ type:'zip_list', ok:false, error:String(files.error || 'list error') })
    status.ok = false
  }

  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
      const minimal = typeof meta === 'object' && meta && (meta.created || meta.ts || meta.timestamp)
      status.checks.push({ type:'meta', ok: !!minimal })
      if (!minimal) status.ok = false
    } catch {
      status.checks.push({ type:'meta', ok:false })
      status.ok = false
    }
  } else {
    status.checks.push({ type:'meta', ok:false })
    status.ok = false
  }

  if (existsSync(shaPath)) {
    const expected = shaLine(readFileSync(shaPath, 'utf8') || '')
    let computed = ''
    try {
      computed = await sha256File(zipPath)
    } catch {}
    const ok = expected && computed && expected.toLowerCase() === computed.toLowerCase()
    status.checks.push({ type:'sha256', ok, expected, computed })
    if (!ok) status.ok = false
  } else {
    status.checks.push({ type:'sha256', ok:false, expected:null, computed:null })
    status.ok = false
  }

  report.checked.push(status)
  if (status.ok) report.totals.passed++; else report.totals.failed++
}

report.ok = report.totals.failed === 0
const jsonPath = join(OUT_DIR, 'verify.json')
const htmlPath = join(OUT_DIR, 'verify.html')
writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8')

let rows = ''
for (const item of report.checked) {
  const cls = item.ok ? 'ok' : 'fail'
  const details = item.checks.map(c => {
    if (c.type === 'sha256') return `${c.type}: ${c.ok ? 'OK' : 'FAIL'}`
    if (c.type === 'required') return `${c.type} [${c.target}]: ${c.ok ? 'OK' : 'FAIL'}`
    return `${c.type}: ${c.ok ? 'OK' : 'FAIL'}`
  }).join(' • ')
  rows += `<tr class="${cls}"><td>${htmlEscape(item.zip)}</td><td>${item.ok?'PASS':'FAIL'}</td><td>${htmlEscape(details)}</td></tr>\n`
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>Backup Verify</title>
<style>
body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:20px}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:8px}
tr.ok{background:#f6ffed}
tr.fail{background:#fff1f0}
th{background:#fafafa}
.summary{margin:10px 0;font-weight:600}
</style>
<h1>Backup Verify</h1>
<div class="summary">Passed: ${report.totals.passed} • Failed: ${report.totals.failed}</div>
<table>
<thead><tr><th>ZIP</th><th>Status</th><th>Checks</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`
writeFileSync(htmlPath, html, 'utf8')

if (!report.ok) process.exit(1)
