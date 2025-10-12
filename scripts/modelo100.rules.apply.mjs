#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Rule Application Engine (MVP)
 * - Loads OCR JSON (default: artifacts/modelo100/ocr.normalized.json; override with OCR_JSON)
 * - Loads mapping file docs/modelo100.fields.map.json
 * - Evaluates sources + conditions, combines to field value, rounds, and emits mapped result with trace.
 * - Dry-run by default (logs JSON to stdout). Set APPLY=1 to write artifacts/modelo100/mapped.json
 * - No import-time side effects; all work happens in main().
 */

function typeOf(x){ if(Array.isArray(x)) return 'array'; if(x===null) return 'null'; return typeof x }
function isNum(x){ return typeof x === 'number' && Number.isFinite(x) }
function toFixedMode(n, decimals=2, mode='half-up'){
  const m = 10 ** decimals
  if(mode === 'down') return Math.trunc(n * m) / m
  if(mode === 'up')   return Math.ceil(Math.abs(n * m)) * Math.sign(n) / m
  // half-up
  return Math.round(n * m) / m
}
function splitRef(ref){
  // ref examples: "ocr.income.dividends_gross" or "rule.real_estate.imputed_income"
  return (ref||'').split('.')
}
function getPath(obj, pathStr){
  const parts = pathStr ? pathStr.split('.') : []
  return parts.reduce((acc,k)=> (acc && typeof acc === 'object' && k in acc) ? acc[k] : undefined, obj)
}
function resolveRef(ref, ctx){
  if(!ref) return undefined
  const seg = splitRef(ref)
  if(seg[0] === 'ocr')  return getPath(ctx.ocr,  seg.slice(1).join('.'))
  if(seg[0] === 'rule') return getPath(ctx.rules,seg.slice(1).join('.'))
  // fallback: treat as OCR path for MVP if no prefix given
  return getPath(ctx.ocr, ref)
}
function evalCond(left, op, right, ctx){
  const lv = resolveRef(left, ctx)
  switch(op){
    case 'truthy': return !!lv
    case '=':   return lv === right
    case '!=':  return lv !== right
    case '>':   return isNum(lv) && isNum(right) && lv >  right
    case '<':   return isNum(lv) && isNum(right) && lv <  right
    case '>=':  return isNum(lv) && isNum(right) && lv >= right
    case '<=':  return isNum(lv) && isNum(right) && lv <= right
    case 'in':      return Array.isArray(right) ? right.includes(lv) : false
    case 'not-in':  return Array.isArray(right) ? !right.includes(lv) : false
    default: return false
  }
}
function combineValues(values, mode='sum'){
  const usable = values.filter(v => v !== undefined && v !== null)
  if(usable.length===0) return undefined
  switch(mode){
    case 'first': return usable[0]
    case 'max':   return usable.reduce((a,b)=> (a>b?a:b))
    case 'min':   return usable.reduce((a,b)=> (a<b?a:b))
    case 'sum':
    default:
      return usable.reduce((a,b)=> (isNum(a)?a:0) + (isNum(b)?b:0), 0)
  }
}

async function safeJsonRead(pth, fallback){
  try{
    const txt = await fs.readFile(pth,'utf8')
    return JSON.parse(txt)
  }catch{
    return fallback
  }
}

async function main(){
  // Inputs
  const repoRoot = process.cwd()
  const artifactsDir = path.join(repoRoot, 'artifacts','modelo100')
  const ocrPath = process.env.OCR_JSON || path.join(artifactsDir,'ocr.normalized.json')
  const rulesPath = process.env.RULES_JSON || path.join(artifactsDir,'rules.eval.json') // optional
  const mapPath = process.env.MAP_JSON || path.join(repoRoot,'docs','modelo100.fields.map.json')

  // Load data
  const [ocr, rules, mapping] = await Promise.all([
    safeJsonRead(ocrPath, {}),
    safeJsonRead(rulesPath, {}),
    safeJsonRead(mapPath, null)
  ])

  if(!mapping || !Array.isArray(mapping.fields)){
    console.error(`Mapping file missing or invalid at ${mapPath}`)
    process.exitCode = 1
    return
  }

  const ctx = { ocr, rules }
  const outFields = {}            // json_key -> value
  const trace = {}                // field.id -> detailed trace
  const issues = []               // warnings / missing

  for(const f of mapping.fields){
    const jsonKey  = f?.target?.json_key
    const csvCol   = f?.target?.csv_col
    const decimals = (f?.target?.decimals ?? 2)
    const round    = (f?.target?.round ?? 'half-up')
    const combine  = (f?.combine ?? 'sum')

    const fieldTrace = { id: f.id, label: f.label, target: { json_key: jsonKey, csv_col: csvCol, decimals, round }, combine, considered: [], used: [] }
    const collected = []

    if(!jsonKey){
      issues.push({ field: f.id, type:'target-missing', msg:`Missing target.json_key` })
      trace[f.id] = fieldTrace
      continue
    }

    for(const s of (f.sources||[])){
      const whenList = Array.isArray(s.when) ? s.when : []
      const conds = whenList.map(c => ({
        ...c,
        left_value: resolveRef(c.left, ctx),
        pass: evalCond(c.left, c.op, c.right, ctx)
      }))
      const pass = conds.every(c => c.pass)

      let raw = undefined
      if(pass){
        raw = resolveRef(s.ref, ctx)
        const mult = ('multiplier' in s && isNum(s.multiplier)) ? s.multiplier : 1
        const val = (isNum(raw) ? raw * mult : raw)
        if(isNum(val) || typeof val !== 'undefined'){
          collected.push(val)
        }
        fieldTrace.used.push({ ref: s.ref, raw, multiplier: ('multiplier' in s ? s.multiplier : 1), value: val, when: conds, rule_hint: s.rule_hint })
      }

      fieldTrace.considered.push({ ref: s.ref, when: conds, passed: pass })
    }

    let combined = combineValues(collected, combine)
    if(typeof combined === 'number'){
      combined = toFixedMode(combined, decimals, round)
      // Ensure numeric type post rounding to avoid stringification quirks
      combined = Number(combined.toFixed(decimals))
    }

    if(combined === undefined || combined === null){
      issues.push({ field: f.id, type:'value-missing', msg:`No source produced a value` })
    }else{
      outFields[jsonKey] = combined
    }

    trace[f.id] = fieldTrace
  }

  const summary = {
    model: 'modelo100',
    mapping_version: mapping.version,
    generated_at: new Date().toISOString(),
    ocr_keys: Object.keys(ocr||{}).length,
    rules_keys: Object.keys(rules||{}).length,
    filled: Object.keys(outFields).length,
    total_fields: Array.isArray(mapping.fields)? mapping.fields.length : 0,
    warnings: issues
  }

  const result = { summary, fields: outFields, trace }

  // Output
  const APPLY = process.env.APPLY === '1'
  if(APPLY){
    await fs.mkdir(artifactsDir, { recursive: true })
    const outPath = path.join(artifactsDir, 'mapped.json')
    await fs.writeFile(outPath, JSON.stringify(result, null, 2))
    console.log(JSON.stringify({ ok:true, out: outPath, filled: summary.filled, total: summary.total_fields }))
  }else{
    // Dry-run: print the summary + first few items only (no files written)
    const preview = {
      ok: true,
      dry_run: true,
      filled: summary.filled,
      total: summary.total_fields,
      sample: Object.entries(outFields).slice(0,5).reduce((acc,[k,v])=> (acc[k]=v,acc), {}),
      warnings: summary.warnings.slice(0,5)
    }
    console.log(JSON.stringify(preview))
  }
}

if(import.meta.url === `file://${process.argv[1]}`){
  main().catch(err => { console.error(err.stack||String(err)); process.exitCode = 1 })
}
