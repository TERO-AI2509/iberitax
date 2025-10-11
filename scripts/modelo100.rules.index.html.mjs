#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'
const INDEX_MD = path.join(OUT_DIR, 'rules.index.md')
const INDEX_JSON = path.join(OUT_DIR, 'rules.index.json')
const INDEX_HTML = path.join(OUT_DIR, 'rules.index.html')

const envTag = process.env.RULE_TAG || ''
const envSev = process.env.RULE_SEVERITY || ''
const now = new Date().toISOString()

const md = await fs.readFile(INDEX_MD, 'utf8').catch(() => null)
if (!md) {
  console.error(`[rules.index.html] missing ${INDEX_MD}`)
  process.exit(1)
}

function parseMarkdownTable(md) {
  const lines = md.split('\n').filter(l => l.trim().startsWith('|'))
  const headerIdx = lines.findIndex(l => /\|\s*id\s*\|/i.test(l))
  const body = headerIdx >= 0 ? lines.slice(headerIdx + 2) : lines.slice(1)
  const rows = []
  for (const line of body) {
    const cells = line.split('|').slice(1, -1).map(s => s.trim())
    if (!cells.length) continue
    const [id, tagsCell, message, severity] = cells
    if (!id) continue
    const tags = (tagsCell || '').split(',').map(t => t.trim()).filter(Boolean)
    rows.push({
      id,
      tags,
      message,
      severity: (severity && severity.length) ? severity : 'Unspecified'
    })
  }
  return rows
}

const rows = parseMarkdownTable(md)

const minimal = rows.map(r => ({
  id: r.id,
  tags: r.tags,
  message: r.message,
  severity: r.severity
}))

await fs.writeFile(INDEX_JSON, JSON.stringify({
  generated_at: now,
  total: minimal.length,
  items: minimal
}, null, 2), 'utf8')

const initial = { tag: envTag, severity: envSev }
const dataJS = `window.__RULE_INDEX__=${JSON.stringify(minimal)};window.__INITIAL__=${JSON.stringify(initial)};`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Modelo 100 — Rule Index</title>
<style>
  :root { --bg:#0b0c10; --card:#121318; --muted:#69707d; --text:#e8eaed; --chip:#1f2230; --chip-on:#2d3550; --accent:#7aa2f7; --border:#262a36; --input:#171a22; }
  *{box-sizing:border-box}
  body{margin:0;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--text);background:var(--bg)}
  .wrap{max-width:1100px;margin:0 auto}
  h1{margin:0 0 8px;font-size:24px}
  .sub{color:var(--muted);margin-bottom:16px;font-size:13px}
  .bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
  input[type="search"]{flex:1;min-width:260px;border:1px solid var(--border);background:var(--input);color:var(--text);padding:10px 12px;border-radius:12px;outline:none}
  .chips{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 4px}
  .chip{padding:6px 10px;border-radius:999px;background:var(--chip);border:1px solid var(--border);cursor:pointer;font-size:12px}
  .chip.active{background:var(--chip-on);border-color:var(--accent)}
  .card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:14px 16px;display:grid;grid-template-columns:160px 1fr;gap:10px;align-items:start}
  .grid{display:grid;gap:10px}
  .id a{color:var(--accent);text-decoration:none;font-weight:600}
  .tags{display:flex;gap:6px;flex-wrap:wrap}
  .tag{background:var(--chip);border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px}
  .sev{font-size:12px;color:var(--muted)}
  .meta{display:flex;gap:12px;align-items:center}
  .links a{font-size:12px;color:var(--accent);text-decoration:none;margin-right:8px}
  .pill{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--border);background:var(--chip);cursor:pointer}
  .sep{height:1px;background:var(--border);margin:10px 0}
  .empty{color:var(--muted);padding:16px;border:1px dashed var(--border);border-radius:12px}
  .head{display:flex;justify-content:space-between;align-items:center}
  .small{font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div>
      <h1>Rule Index</h1>
      <div class="sub">Instant search and filters. Click IDs to open rule details, click tags to open group rollups.</div>
    </div>
    <div class="small" id="count"></div>
  </div>

  <div class="bar">
    <input id="q" type="search" placeholder="Search by ID, message, or tag…">
    <span class="pill" id="clear">Clear</span>
  </div>

  <div class="chips" id="sev"></div>
  <div class="chips" id="tags"></div>

  <div class="sep"></div>

  <div class="grid" id="list"></div>
</div>
<script>${dataJS}</script>
<script>
  const data = window.__RULE_INDEX__ || []
  const initial = window.__INITIAL__ || { tag:'', severity:'' }
  const uniq = (arr) => Array.from(new Set(arr))
  const severities = uniq(data.map(x => x.severity || 'Unspecified')).sort((a,b)=>a.localeCompare(b))
  const tags = uniq(data.flatMap(x => x.tags || [])).sort((a,b)=>a.localeCompare(b))
  const el = (sel) => document.querySelector(sel)
  const makeChip = (label, active, onclick) => {
    const s = document.createElement('span')
    s.className = 'chip' + (active ? ' active':'')
    s.textContent = label
    s.onclick = () => onclick(label, s)
    return s
  }
  const q = el('#q')
  const list = el('#list')
  const sevWrap = el('#sev')
  const tagWrap = el('#tags')
  const count = el('#count')
  const clear = el('#clear')
  let state = { q: '', sev: initial.severity || '', tag: initial.tag || '' }
  function anchorId(id){ return encodeURIComponent(String(id)) }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') }
  function renderChips() {
    sevWrap.innerHTML = ''
    tagWrap.innerHTML = ''
    const sevAll = makeChip(state.sev ? 'Severity: ' + state.sev + ' ✕' : 'Severity: All', !!state.sev, () => { state.sev = ''; update() })
    sevWrap.appendChild(sevAll)
    severities.forEach(s => sevWrap.appendChild(makeChip(s, state.sev===s, (v)=>{ state.sev = v; update() })))
    const tagAll = makeChip(state.tag ? 'Tag: ' + state.tag + ' ✕' : 'Tag: All', !!state.tag, () => { state.tag = ''; update() })
    tagWrap.appendChild(tagAll)
    tags.forEach(t => tagWrap.appendChild(makeChip(t, state.tag===t, (v)=>{ state.tag = v; update() })))
  }
  function matches(d) {
    if (state.sev && (d.severity||'Unspecified') !== state.sev) return false
    if (state.tag && !(d.tags||[]).includes(state.tag)) return false
    const qq = state.q.trim().toLowerCase()
    if (!qq) return true
    const hay = [d.id, d.message, ...(d.tags||[])].join(' ').toLowerCase()
    return hay.includes(qq)
  }
  function update() {
    const filtered = data.filter(matches)
    list.innerHTML = ''
    count.textContent = filtered.length + '/' + data.length
    if (!filtered.length) {
      const div = document.createElement('div')
      div.className = 'empty'
      div.textContent = 'No rules match the current filters.'
      list.appendChild(div)
      renderChips()
      return
    }
    filtered.forEach(d => {
      const card = document.createElement('div')
      card.className = 'card'
      const left = document.createElement('div')
      left.className = 'id'
      const a = document.createElement('a')
      a.href = 'rules.rollup.md#' + anchorId(d.id)
      a.textContent = d.id
      a.title = 'Open rule details'
      left.appendChild(a)
      left.appendChild(document.createElement('div')).className = 'sev'
      left.lastChild.textContent = 'Severity: ' + (d.severity || 'Unspecified')
      const right = document.createElement('div')
      const msg = document.createElement('div')
      msg.textContent = d.message || ''
      const links = document.createElement('div')
      links.className = 'links'
      const aRule = document.createElement('a')
      aRule.href = 'rules.rollup.md#' + anchorId(d.id)
      aRule.textContent = 'Rule'
      const aGroup = document.createElement('a')
      aGroup.href = 'rules.groups.rollup.md#' + (d.tags && d.tags.length ? slug(d.tags[0]) : '')
      aGroup.textContent = 'Group'
      links.appendChild(aRule)
      links.appendChild(aGroup)
      const tagsDiv = document.createElement('div')
      tagsDiv.className = 'tags'
      ;(d.tags||[]).forEach(t => {
        const sp = document.createElement('span')
        sp.className = 'tag'
        const link = document.createElement('a')
        link.href = 'rules.groups.rollup.md#' + slug(t)
        link.textContent = t
        link.style.textDecoration = 'none'
        link.style.color = 'inherit'
        sp.appendChild(link)
        tagsDiv.appendChild(sp)
      })
      right.appendChild(msg)
      right.appendChild(tagsDiv)
      right.appendChild(links)
      card.appendChild(left)
      card.appendChild(right)
      list.appendChild(card)
    })
    renderChips()
  }
  q.addEventListener('input', () => { state.q = q.value; update() })
  clear.addEventListener('click', () => { q.value=''; state.q=''; state.sev=''; state.tag=''; update() })
  q.value = ''
  renderChips()
  update()
  if (state.tag) {
    const chip = Array.from(document.querySelectorAll('#tags .chip')).find(c => c.textContent === state.tag)
    if (chip) chip.classList.add('active')
  }
  if (state.sev) {
    const chip = Array.from(document.querySelectorAll('#sev .chip')).find(c => c.textContent === state.sev)
    if (chip) chip.classList.add('active')
  }
</script>
</body>
</html>`

await fs.writeFile(INDEX_HTML, html, 'utf8')
console.log(JSON.stringify({ ok: true, out: INDEX_HTML, json: INDEX_JSON, total: minimal.length }))
