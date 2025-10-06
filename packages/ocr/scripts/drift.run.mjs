import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
(() => {
  const candidates = [
    path.resolve(process.cwd(), 'config/tuning.step29.json'),
    path.resolve(process.cwd(), 'packages/ocr/config/tuning.step29.json'),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'config', 'tuning.step29.json')
  ];
  let t = null, hit = null;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) { t = JSON.parse(fs.readFileSync(c, 'utf8')); hit = c; break; }
    } catch {}
  }
  const PF = (t && t.perField) || {};
  const F8 = PF.field_8 || {};
  console.log('[TUNING BANNER]', JSON.stringify({
    hit, flags: Object.keys(F8),
    hasBias: !!F8.biasRightTotals
  }));
})();

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.resolve(__dirname, '..')

// merge quarantine list from env (comma/space separated)
const QUAR_ENV = (process.env.QUARANTINE_FIELDS || '').split(/[, \t]+/).filter(Boolean)
if (QUAR_ENV.length) {
  console.log('🔹 Quarantine fields from env:', QUAR_ENV.join(', '))
} else {
  console.log('🔹 Quarantine fields from env: (none)')
}

// run the gate script in package cwd, pass env through
const gate = spawnSync('node', ['scripts/drift.gate.wrap.mjs'], {
  cwd: PKG,
  encoding: 'utf8',
  env: { ...process.env, QUARANTINE_FIELDS: QUAR_ENV.join(',') }
})

process.stdout.write(gate.stdout || '')
process.stderr.write(gate.stderr || '')
process.exit(gate.status ?? 0)
