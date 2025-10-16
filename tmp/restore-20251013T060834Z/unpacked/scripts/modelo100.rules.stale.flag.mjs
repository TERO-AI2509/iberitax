#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.env.ROOT || process.cwd()
const APPLY = process.env.APPLY === '1'
const OUT_DIR = 'artifacts/modelo100'
const RULES_DIR = 'docs/modelo100.rules'
const STALE_DAYS = Number(process.env.STALE_DAYS || 90)

const now = Date.now()
const cutoffMs = STALE_DAYS * 24 * 60 * 60 * 1000
const cutoffISO = new Date(now - cutoffMs).toISOString()

const req = (p) => path.join(ROOT, p)
async function exists(p){ try { await fs.access(p); return true } catch { return false } }

async function loadRulesViaHelper() {
  try {
    const { loadRules } = await import(req('scripts/modelo100.rules.load.mjs'))
    const { rules } = await loadRules()
    return rules
  } catch {
    return null
  }
}

async function loadRulesFallback(dir) {
  const base = req(dir)
  const rules = []
  async function walk(d) {
    for (const ent of await fs.readdir(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name)
      if (ent.isDirectory()) await walk(p)
      else if (ent.isFile() && ent.name.endsWith('.json')) {
        try {
          const txt = await fs.readFile(p, 'utf8')
          const json = JSON.parse(txt)
          const arr = Array.isArray(json) ? json : [json]
          for (const r of arr) {
            rules.push({ __file: path.relative(ROOT, p), ...r })
          }
        } catch { /* ignore bad files */ }
      }
    }
  }
  if (await exists(base)) await walk(base)
  return rules
}

function ruleId(r){ return r.id || r.slug || r.key || r.name || '(unknown)' }
function ruleOwner(r){ return r.owner || r.meta?.owner || 'unassigned' }

function parseISO(s){
  if (!s) return null
  const t = Date.parse(s)
  return Number.isFinite(t) ? new Date(t) : null
}

function analyze(rules){
  const rows = []
  for (const r of rules) {
    const id = ruleId(r)
    const owner = ruleOwner(r)
    const u = r.updatedAt || r.meta?.updatedAt || null
    const dt = parseISO(u)
    const hasDate = !!dt
    const isStale = !hasDate || (dt.getTime() < (now - cutoffMs))
    rows.push({
      id, owner,
      updatedAt: hasDate ? dt.toISOString() : '',
      hasUpdatedAt: hasDate,
      stale: !!isStale,
      file: r.__file || '',
      tags: (Array.isArray(r.tags) ? r.tags : (Array.isArray(r.meta?.tags) ? r.meta.tags : []))
              .map(String).sort().join('|'),
    })
  }
  const staleRows = rows.filter(r => r.stale)
  return { rows, staleRows }
}

function toCSV(rows){
  const headers = ['id','owner','updatedAt','hasUpdatedAt','stale','file','tags']
  const esc = (v)=> {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h=>esc(r[h])).join(','))].join('\n')
}

function toHTML(rows, cutoffISO, staleDays){
  const esc = (s)=> String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const body = rows.map(r => `
    <tr class="${r.stale ? 'stale' : ''}">
      <td>${esc(r.id)}</td>
      <td>${esc(r.owner)}</td>
      <td>${esc(r.updatedAt || '—')}</td>
      <td>${r.hasUpdatedAt ? 'yes' : 'no'}</td>
      <td>${r.stale ? 'STALE' : 'OK'}</td>
      <td><code>${esc(r.file)}</code></td>
      <td>${esc(r.tags || '')}</td>
    </tr>`).join('')

  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Stale Rules Report</title>
<style>
  body{font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:24px}
  h1{font-size:20px;margin:0 0 12px}
  .meta{color:#555;margin-bottom:16px}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #ddd;padding:8px;vertical-align:top}
  th{background:#f6f6f6;text-align:left}
  tr:nth-child(even){background:#fafafa}
  tr.stale td{background:#fff3f3}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}
</style>
<h1>Stale Rules Report</h1>
<div class="meta">Generated: ${new Date().toISOString()} · Cutoff: ${esc(cutoffISO)} (>${staleDays} days old)</div>
<table>
  <thead>
    <tr>
      <th>Rule</th><th>Owner</th><th>updatedAt</th><th>hasDate</th><th>Status</th><th>File</th><th>Tags</th>
    </tr>
  </thead>
  <tbody>${body}</tbody>
</table>
</html>`
}

async function main(){
  const helper = await loadRulesViaHelper()
  const rules = helper ?? await loadRulesFallback(RULES_DIR)
  const { rows, staleRows } = analyze(rules)

  // console summary (for CI logs)
  console.log(`[stale] cutoff ISO: ${cutoffISO} (${STALE_DAYS} days)`)
  console.log(`[stale] scanned ${rows.length} rule(s); stale: ${staleRows.length}`)

  // build artifacts
  const json = JSON.stringify(staleRows, null, 2)
  const csv = toCSV(staleRows)
  const html = toHTML(staleRows, cutoffISO, STALE_DAYS)
  const badge = staleRows.length === 0 ? 'STALE=0 PASS' : `STALE=${staleRows.length} ATTENTION`

  if (!APPLY){
    console.log('[stale] dry-run: set APPLY=1 to write artifacts.')
    return
  }
  const outDir = req(OUT_DIR)
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'rules.stale.json'), json)
  await fs.writeFile(path.join(outDir, 'rules.stale.csv'), csv)
  await fs.writeFile(path.join(outDir, 'rules.stale.html'), html)
  await fs.writeFile(path.join(outDir, 'rules.stale.badge.txt'), badge)
  console.log(`[stale] wrote ${path.join(OUT_DIR,'rules.stale.json')}`)
  console.log(`[stale] wrote ${path.join(OUT_DIR,'rules.stale.csv')}`)
  console.log(`[stale] wrote ${path.join(OUT_DIR,'rules.stale.html')}`)
  console.log(`[stale] wrote ${path.join(OUT_DIR,'rules.stale.badge.txt')}`)
}

main().catch(e => { console.error('[stale] FATAL', e); process.exit(2) })
