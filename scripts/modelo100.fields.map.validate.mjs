#!/usr/bin/env node
import fs from 'node:fs/promises'

async function main() {
  const schemaPath = 'docs/modelo100.fields.map.schema.json'
  const mapPath = 'docs/modelo100.fields.map.json'

  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'))
  const data = JSON.parse(await fs.readFile(mapPath, 'utf8'))

  const errors = []

  function typeOf(x) {
    if (Array.isArray(x)) return 'array'
    if (x === null) return 'null'
    return typeof x
  }

  function req(obj, key, t, ctx) {
    if (!(key in obj)) return errors.push(`${ctx}: missing '${key}'`)
    if (t && typeOf(obj[key]) !== t) return errors.push(`${ctx}: '${key}' expected ${t}, got ${typeOf(obj[key])}`)
  }

  // Minimal structural checks aligned with the JSON Schema above
  req(data, 'version', 'string', '$')
  req(data, 'model', 'string', '$')
  if (data.model !== 'modelo100') errors.push("$.model must be 'modelo100'")
  req(data, 'fields', 'array', '$')

  if (Array.isArray(data.fields)) {
    data.fields.forEach((f, i) => {
      const ctx = `fields[${i}]`
      req(f, 'id', 'string', ctx)
      req(f, 'label', 'string', ctx)
      req(f, 'target', 'object', ctx)
      req(f, 'sources', 'array', ctx)
      if (f.target) {
        ['json_key','csv_col'].forEach(k => req(f.target, k, 'string', `${ctx}.target`))
        if ('decimals' in f.target && !(Number.isInteger(f.target.decimals) && f.target.decimals >= 0 && f.target.decimals <= 6)) {
          errors.push(`${ctx}.target.decimals must be an integer 0..6`)
        }
        if ('round' in f.target && !['half-up','down','up'].includes(f.target.round)) {
          errors.push(`${ctx}.target.round must be one of half-up|down|up`)
        }
      }
      if (Array.isArray(f.sources) && f.sources.length === 0) errors.push(`${ctx}.sources must have at least one item`)
      if (f.combine && !['first','sum','max','min'].includes(f.combine)) {
        errors.push(`${ctx}.combine invalid value '${f.combine}'`)
      }
    })
  }

  const ok = errors.length === 0
  const out = { ok, errors, fields: Array.isArray(data.fields) ? data.fields.length : 0 }
  await fs.writeFile('artifacts/modelo100/fields.map.validate.json', JSON.stringify(out, null, 2))
  console.log(JSON.stringify(out))

  if (!ok) process.exitCode = 1
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e.stack || String(e))
    process.exitCode = 1
  })
}
