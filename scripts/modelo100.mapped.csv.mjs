#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

function csvEscape(s){
  if(s === null || s === undefined) return ''
  const str = String(s)
  if(/[,"\n]/.test(str)) return `"${str.replace(/"/g,'""')}"`
  return str
}

async function main(){
  const repoRoot = process.cwd()
  const artifactsDir = path.join(repoRoot, 'artifacts', 'modelo100')
  const mappedPath = process.env.MAPPED_JSON || path.join(artifactsDir, 'mapped.json')
  const outPath = process.env.OUT_CSV || path.join(artifactsDir, 'mapped.csv')

  const mapped = JSON.parse(await fs.readFile(mappedPath, 'utf8'))
  const fields = mapped.fields || {}
  const trace = mapped.trace || {}
  const warnings = Array.isArray(mapped.summary?.warnings) ? mapped.summary.warnings : []

  const warnByField = warnings.reduce((acc,w)=>{
    const k = w.field || '_'
    acc[k] = acc[k] || []
    acc[k].push(w)
    return acc
  }, {})

  const header = [
    'field_id',
    'label',
    'json_key',
    'csv_col',
    'combine',
    'value',
    'decimals',
    'round',
    'status',
    'warnings_count',
    'used_refs'
  ]

  const lines = [header.join(',')]
  for(const [fid, tr] of Object.entries(trace)){
    const jsonKey = tr?.target?.json_key
    const csvCol  = tr?.target?.csv_col
    const value   = jsonKey in fields ? fields[jsonKey] : ''
    const hasValue = jsonKey in fields
    const wCount = (warnByField[fid]?.length || 0)
    const status = hasValue ? (wCount ? 'warning' : 'ok') : 'missing'
    const usedRefs = Array.isArray(tr.used) ? tr.used.map(u => u.ref).filter(Boolean).join('|') : ''

    const row = [
      fid,
      tr?.label || '',
      jsonKey || '',
      csvCol || '',
      tr?.combine || '',
      isFinite(value) ? value : '',
      tr?.target?.decimals ?? '',
      tr?.target?.round ?? '',
      status,
      wCount,
      usedRefs
    ].map(csvEscape).join(',')

    lines.push(row)
  }

  await fs.writeFile(outPath, lines.join('\n'))
  console.log(JSON.stringify({ok:true, out: outPath, rows: lines.length-1}))
}

if(import.meta.url === `file://${process.argv[1]}`){
  main().catch(e => { console.error(e.stack||String(e)); process.exitCode=1 })
}
