#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

function hEsc(s){ return String(s ?? '').replace(/[&<>"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])) }

function badge(status){
  const map = { ok:'#16a34a', warning:'#ca8a04', missing:'#dc2626' }
  const label = status.toUpperCase()
  const color = map[status] || '#6b7280'
  return `<span style="display:inline-block;padding:.2rem .5rem;border-radius:9999px;background:${color};color:white;font-weight:600;font-size:.75rem">${label}</span>`
}

function condLine(c){
  const left = hEsc(c.left)
  const op = hEsc(c.op)
  const right = typeof c.right === 'object' ? hEsc(JSON.stringify(c.right)) : hEsc(c.right)
  const lv = hEsc(c.left_value)
  const pass = c.pass ? '✅' : '❌'
  return `<code>${left} ${op} ${right}</code> <em>(left=${lv})</em> ${pass}`
}

async function main(){
  const repoRoot = process.cwd()
  const artifactsDir = path.join(repoRoot, 'artifacts', 'modelo100')
  const mappedPath = process.env.MAPPED_JSON || path.join(artifactsDir, 'mapped.json')
  const outPath = process.env.OUT_HTML || path.join(artifactsDir, 'mapped.html')

  const mapped = JSON.parse(await fs.readFile(mappedPath,'utf8'))
  const fields = mapped.fields || {}
  const trace = mapped.trace || {}
  const warnings = Array.isArray(mapped.summary?.warnings) ? mapped.summary.warnings : []

  const warnByField = warnings.reduce((acc,w)=>{
    const k = w.field || '_'
    acc[k] = acc[k] || []
    acc[k].push(w)
    return acc
  }, {})

  let rows = ''
  for(const [fid, tr] of Object.entries(trace)){
    const jsonKey = tr?.target?.json_key
    const csvCol  = tr?.target?.csv_col
    const value   = jsonKey in fields ? fields[jsonKey] : null
    const hasValue = jsonKey in fields
    const wList = warnByField[fid] || []
    const status = hasValue ? (wList.length ? 'warning' : 'ok') : 'missing'

    let used = ''
    if(Array.isArray(tr.used) && tr.used.length){
      used = tr.used.map(u=>{
        const cond = Array.isArray(u.when) && u.when.length ? `<div>${u.when.map(condLine).join('<br>')}</div>` : ''
        return `<li><code>${hEsc(u.ref)}</code> → <strong>${hEsc(u.value)}</strong>${u.rule_hint?` <small style="color:#555">[${hEsc(u.rule_hint)}]</small>`:''}${cond}</li>`
      }).join('')
      used = `<ul>${used}</ul>`
    }else{
      used = `<em>No contributing sources.</em>`
    }

    const wHtml = wList.length ? `<ul>${wList.map(w=>`<li>${hEsc(w.type||'warn')}: ${hEsc(w.msg||'')}</li>`).join('')}</ul>` : '<em>None</em>'

    rows += `
      <tr>
        <td><code>${hEsc(fid)}</code><div style="color:#555">${hEsc(tr?.label||'')}</div></td>
        <td><code>${hEsc(jsonKey||'')}</code><div style="color:#555">${hEsc(csvCol||'')}</div></td>
        <td>${value===null||value===undefined?'<em>—</em>':hEsc(value)}</td>
        <td>${badge(status)}</td>
        <td>${wHtml}</td>
      </tr>
      <tr>
        <td colspan="5" style="background:#f8fafc">
          <div><strong>Combine:</strong> ${hEsc(tr?.combine||'')}</div>
          <div><strong>Target:</strong> decimals=${hEsc(tr?.target?.decimals??'')}, round=${hEsc(tr?.target?.round??'')}</div>
          <div><strong>Used sources:</strong> ${used}</div>
        </td>
      </tr>
    `
  }

  const total = mapped.summary?.total_fields ?? Object.keys(trace).length
  const filled = mapped.summary?.filled ?? 0

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Modelo 100 — Mapped Report</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;margin:2rem;line-height:1.5}
  h1{font-size:1.5rem;margin:0 0 .25rem}
  .muted{color:#555}
  table{border-collapse:collapse;width:100%;margin-top:1rem}
  th,td{border:1px solid #e5e7eb;padding:.5rem;vertical-align:top}
  th{background:#f1f5f9;text-align:left}
  code{background:#e5e7eb;padding:.05rem .3rem;border-radius:.25rem}
</style>
</head>
<body>
  <h1>Modelo 100 — Field Mapping Report</h1>
  <div class="muted">Generated: ${hEsc(mapped.summary?.generated_at || new Date().toISOString())}</div>
  <div class="muted">Mapping version: ${hEsc(mapped.mapping_version || '')}</div>
  <div class="muted">Filled ${hEsc(filled)} / ${hEsc(total)} fields</div>

  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Target</th>
        <th>Value</th>
        <th>Status</th>
        <th>Warnings</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="5"><em>No trace entries.</em></td></tr>'}
    </tbody>
  </table>
</body></html>`

  await fs.writeFile(outPath, html)
  console.log(JSON.stringify({ok:true, out: outPath}))
}

if(import.meta.url === `file://${process.argv[1]}`){
  main().catch(e=>{ console.error(e.stack||String(e)); process.exitCode=1 })
}
