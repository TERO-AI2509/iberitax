import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.resolve(__dirname, '..')

const QUAR_ENV = (process.env.QUARANTINE_FIELDS || '').split(/[, \t]+/).filter(Boolean)
const gate = spawnSync('node', ['scripts/drift.gate.mjs'], {
  cwd: PKG,
  encoding: 'utf8',
  env: { ...process.env, QUARANTINE_FIELDS: QUAR_ENV.join(',') }
})

let out = gate.stdout || ''
if (QUAR_ENV.length) {
  const line = `- Quarantine fields: ${QUAR_ENV.join(', ')}`
  out = out.replace(/- Quarantine fields: .*/g, line)
}
process.stdout.write(out)
process.stderr.write(gate.stderr || '')
process.exit(gate.status ?? 0)
