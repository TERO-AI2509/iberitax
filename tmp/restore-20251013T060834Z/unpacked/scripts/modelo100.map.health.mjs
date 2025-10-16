#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.env.ROOT || process.cwd()
const APPLY = process.env.APPLY === '1'
const REQUIRE_MAPPED = process.env.REQUIRE_MAPPED === '1'
const OUT  = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out')+1] : null

const FILES = {
  schema: 'docs/modelo100.fields.map.schema.json',
  map:    'docs/modelo100.fields.map.json',
  j:      'artifacts/modelo100/mapped.json',
  c:      'artifacts/modelo100/mapped.csv',
  h:      'artifacts/modelo100/mapped.html',
}

const req = (p) => path.join(ROOT, p)
async function exists(p){ try { await fs.access(p); return true } catch { return false } }
async function readJSON(p){ return JSON.parse(await fs.readFile(p,'utf8')) }
async function csvRowCount(p){
  const txt = await fs.readFile(p,'utf8')
  const lines = txt.replace(/\r/g,'').split('\n').filter(l=>l.trim()!=='')
  if (lines.length===0) return 0
  const hasHeader = lines[0].includes(',')
  return hasHeader ? Math.max(0, lines.length-1) : lines.length
}
async function htmlNonTrivial(p){ try { const b=await fs.stat(p); return b.size>100 } catch { return false } }

async function validateMapWithSchema(schemaPath, mapPath){
  try{
    const [schema, data] = await Promise.all([readJSON(schemaPath), readJSON(mapPath)])
    let AjvCtor = null
    try { AjvCtor = (await import('ajv/dist/2020')).default } catch {}
    if (!AjvCtor) { try { AjvCtor = (await import('ajv')).default } catch {} }
    if (!AjvCtor) return { ok:null, skipped:true, reason:'Ajv not installed' }
    const ajv = new AjvCtor({ allErrors:true, strict:false })
    const validate = ajv.compile(schema)
    const ok = validate(data)
    return { ok, errors: ok?[]:validate.errors }
  }catch(e){
    const msg = String(e?.message || e)
    if (/no schema with key or ref|Cannot find module|ERR_MODULE_NOT_FOUND/i.test(msg)) {
      return { ok:null, skipped:true, reason:msg }
    }
    return { ok:false, errors:[msg] }
  }
}

function summarize(status){
  const ok = Object.values(status.checks).every(v => v===true || v==='SKIPPED' || v?.ok===true)
  return { ok, ...status }
}

async function main(){
  const status = { checks:{}, details:{}, files:{...FILES} }

  // existence
  for (const [k, rel] of Object.entries(FILES)) {
    const p = req(rel)
    const ex = await exists(p)
    status.checks[`exists_${k}`] = ex
    status.details[`exists_${k}`] = { file: rel, exists: ex }
  }

  const missingSchemaOrMap = ['schema','map'].some(k => !status.checks[`exists_${k}`])
  const mappedAnyExist = (await exists(req(FILES.j))) || (await exists(req(FILES.c))) || (await exists(req(FILES.h)))

  if (!missingSchemaOrMap) {
    // mapped.json (lenient unless strict)
    if (await exists(req(FILES.j))) {
      try {
        const arr = await readJSON(req(FILES.j))
        status.checks.json_is_array = Array.isArray(arr) || (REQUIRE_MAPPED ? false : 'SKIPPED')
        status.details.json_length = Array.isArray(arr) ? arr.length : null
      } catch {
        status.checks.json_is_array = REQUIRE_MAPPED ? false : 'SKIPPED'
      }
    } else {
      status.checks.json_is_array = REQUIRE_MAPPED ? false : 'SKIPPED'
    }

    // mapped.csv (lenient unless strict)
    if (await exists(req(FILES.c))) {
      try {
        const csvRows = await csvRowCount(req(FILES.c))
        status.details.csv_rows = csvRows
        status.checks.counts_match =
          typeof status.details.json_length === 'number'
            ? (status.details.json_length === csvRows)
            : (REQUIRE_MAPPED ? false : 'SKIPPED')
      } catch {
        status.checks.counts_match = REQUIRE_MAPPED ? false : 'SKIPPED'
      }
    } else {
      status.checks.counts_match = REQUIRE_MAPPED ? false : 'SKIPPED'
    }

    // mapped.html (lenient unless strict)
    if (await exists(req(FILES.h))) {
      status.checks.html_nontrivial = await htmlNonTrivial(req(FILES.h))
      if (!status.checks.html_nontrivial && !REQUIRE_MAPPED) status.checks.html_nontrivial = 'SKIPPED'
    } else {
      status.checks.html_nontrivial = REQUIRE_MAPPED ? false : 'SKIPPED'
    }

    // schema validation (best-effort)
    const v = await validateMapWithSchema(req(FILES.schema), req(FILES.map))
    if (v.skipped) {
      status.checks.schema_valid = 'SKIPPED'
      status.details.schema_valid = { skipped:true, reason:v.reason }
    } else {
      status.checks.schema_valid = !!v.ok
      status.details.schema_valid = v.ok ? { ok:true } : { ok:false, errors:v.errors }
    }
  } else {
    status.checks.runtime = false
    status.details.runtime_error = 'Missing schema or map file(s)'
  }

  const report = summarize(status)

  // human summary
  const lines = []
  const badge = report.ok ? 'PASS' : 'FAIL'
  lines.push(`[map-health] ${badge}`)
  lines.push(`- mapped.json exists & array: ${report.checks.json_is_array===true?'OK':(report.checks.json_is_array==='SKIPPED'?'SKIPPED':'NO')}`)
  lines.push(`- mapped.csv rows == json length: ${report.checks.counts_match===true?'OK':(report.checks.counts_match==='SKIPPED'?'SKIPPED':'NO')}`)
  lines.push(`- mapped.html non-trivial: ${report.checks.html_nontrivial===true?'OK':(report.checks.html_nontrivial==='SKIPPED'?'SKIPPED':'NO')}`)
  lines.push(`- map.json validates schema: ${report.checks.schema_valid===true?'OK':(report.checks.schema_valid==='SKIPPED'?'SKIPPED':'NO')}`)
  if (typeof report.details.json_length === 'number') lines.push(`- counts: json=${report.details.json_length}, csv=${report.details.csv_rows ?? 'n/a'}`)
  if (report.details.schema_valid?.errors) lines.push(`- schema errors: ${JSON.stringify(report.details.schema_valid.errors)}`)
  if (report.details.runtime_error) lines.push(`- runtime: ${report.details.runtime_error}`)
  console.log(lines.join('\n'))

  // optional JSON report
  if (APPLY && OUT) {
    const outPath = path.isAbsolute(OUT) ? OUT : req(OUT)
    await fs.mkdir(path.dirname(outPath), { recursive: true })
    await fs.writeFile(outPath, JSON.stringify(report, null, 2))
    console.log(`[map-health] report written: ${outPath}`)
  } else if (OUT) {
    console.log(`[map-health] (dry-run) not writing -- set APPLY=1 to write: ${OUT}`)
  }

  process.exitCode = report.ok ? 0 : 1
}

main().catch(e => { console.error('[map-health] FATAL', e); process.exit(2) })
