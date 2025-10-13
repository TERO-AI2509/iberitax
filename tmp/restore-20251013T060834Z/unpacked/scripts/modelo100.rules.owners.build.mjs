#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT  = process.env.ROOT || process.cwd()
const APPLY = process.env.APPLY === '1'
const OUT_DIR = 'artifacts/modelo100'
const RULES_DIR = 'docs/modelo100.rules'

async function exists(p){ try { await fs.access(p); return true } catch { return false } }
const req = (p) => path.join(ROOT, p)

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
          // allow files with single rule or arrays
          if (Array.isArray(json)) rules.push(...json)
          else rules.push(json)
        } catch {/* ignore bad files */}
      }
    }
  }
  if (await exists(base)) await walk(base)
  return rules
}

function normOwner(rule){
  return rule.owner || rule.meta?.owner || 'unassigned'
}
function normTags(rule){
  const t = rule.tags || rule.meta?.tags || []
  return Array.isArray(t) ? t : []
}
function normUpdatedAt(rule){
  return rule.updatedAt || rule.meta?.updatedAt || null
}
function ruleId(rule){
  return rule.id || rule.slug || rule.key || rule.name || '(unknown)'
}

function aggregate(rules){
  const owners = new Map()
  for (const r of rules){
    const owner = String(normOwner(r) || 'unassigned').trim() || 'unassigned'
    const tags = normTags(r)
    const updatedAt = normUpdatedAt(r)
    const id = ruleId(r)

    if (!owners.has(owner)){
      owners.set(owner, {
        owner,
        rule_count: 0,
        tagged_count: 0,
        untagged_count: 0,
        latest_updated_at: null,
        rules: [],
        tag_set: new Set(),
      })
    }
    const o = owners.get(owner)
    o.rule_count += 1
    if (tags.length) { o.tagged_count += 1; tags.forEach(t=>o.tag_set.add(String(t))) }
    else { o.untagged_count += 1 }
    if (updatedAt){
      if (!o.latest_updated_at || String(updatedAt) > String(o.latest_updated_at)){
        o.latest_updated_at = updatedAt
      }
    }
    o.rules.push(id)
  }
  // finalize
  const rows = Array.from(owners.values()).map(o => ({
    owner: o.owner,
    rule_count: o.rule_count,
    tagged_count: o.tagged_count,
    untagged_count: o.untagged_count,
    tags: Array.from(o.tag_set).sort().join('|'),
    latest_updated_at: o.latest_updated_at || '',
    rules: o.rules.sort().join(';')
  }))
  // sort by rule_count desc, then owner asc
  rows.sort((a,b)=> (b.rule_count - a.rule_count) || a.owner.localeCompare(b.owner))
  return rows
}

function toCSV(rows){
  const headers = ['owner','rule_count','tagged_count','untagged_count','tags','latest_updated_at','rules']
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h=>esc(r[h])).join(','))].join('\n')
}

function toHTML(rows){
  const escaped = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Rule Ownership Summary</title>
<style>
  body{font:14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin:24px;}
  h1{font-size:20px; margin:0 0 12px;}
  .meta{color:#555; margin-bottom:16px}
  table{border-collapse:collapse; width:100%;}
  th,td{border:1px solid #ddd; padding:8px; vertical-align:top;}
  th{background:#f6f6f6; text-align:left;}
  tr:nth-child(even){background:#fafafa;}
  code{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px;}
  .right{text-align:right}
  details{margin-top:6px}
</style>
<h1>Rule Ownership Summary</h1>
<div class="meta">Generated: ${new Date().toISOString()}</div>
<table>
  <thead>
    <tr>
      <th>Owner</th>
      <th class="right">Rules</th>
      <th class="right">Tagged</th>
      <th class="right">Untagged</th>
      <th>Tags</th>
      <th>Latest Updated</th>
      <th>Rules (ids)</th>
    </tr>
  </thead>
  <tbody>
    ${rows.map(r=>`
      <tr>
        <td>${escaped(r.owner)}</td>
        <td class="right">${r.rule_count}</td>
        <td class="right">${r.tagged_count}</td>
        <td class="right">${r.untagged_count}</td>
        <td>${escaped(r.tags)}</td>
        <td>${escaped(r.latest_updated_at)}</td>
        <td><details><summary>${r.rules.split(';').length} items</summary><code>${escaped(r.rules)}</code></details></td>
      </tr>`).join('')}
  </tbody>
</table>
</html>`
}

async function main(){
  const helperRules = await loadRulesViaHelper()
  const rules = helperRules ?? await loadRulesFallback(RULES_DIR)

  const rows = aggregate(rules)
  const csv = toCSV(rows)
  const html = toHTML(rows)

  // Always print a summary to stdout (dry-run friendly)
  console.log(`[owners] ${rows.length} owner row(s) from ${rules.length} rule(s).`)
  for (const r of rows.slice(0,5)) {
    console.log(` - ${r.owner}: ${r.rule_count} rule(s)`)
  }
  if (rows.length > 5) console.log(` - … ${rows.length - 5} more owners`)

  if (!APPLY){
    console.log('[owners] dry-run: set APPLY=1 to write artifacts.')
    return
  }
  const outDir = req(OUT_DIR)
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'owners.csv'), csv)
  await fs.writeFile(path.join(outDir, 'owners.html'), html)
  console.log(`[owners] wrote ${path.join(OUT_DIR,'owners.csv')}`)
  console.log(`[owners] wrote ${path.join(OUT_DIR,'owners.html')}`)
}

main().catch(e => { console.error('[owners] FATAL', e); process.exit(2) })
