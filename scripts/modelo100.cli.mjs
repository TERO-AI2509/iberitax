#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';
if (process.argv[2] === 'admin') {
  const r = spawnSync(process.execPath, ['scripts/modelo100.cli.admin.mjs', ...process.argv.slice(3)], { stdio: 'inherit' });
  process.exit(r.status ?? 0);
}
import { spawnSync } from 'node:child_process';
import process from 'node:process';
if (process.argv[2] === 'admin') {
  const r = spawnSync(process.execPath, ['scripts/modelo100.cli.admin.mjs', ...process.argv.slice(3)], { stdio: 'inherit' });
  process.exit(r.status ?? 0);
}
#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

function runNode(script, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      stdio: 'inherit',
      env: { ...process.env, ...env }
    })
    child.on('close', (code) => resolve(code ?? 1))
  })
}

async function mapApply() {
  const code = await runNode(path.join('scripts','modelo100.rules.apply.mjs'), {})
  process.exitCode = code
}

async function mapReport() {
  const csvCode  = await runNode(path.join('scripts','modelo100.mapped.csv.mjs'), {})
  const htmlCode = await runNode(path.join('scripts','modelo100.mapped.html.mjs'), {})
  process.exitCode = (csvCode || htmlCode) ? 1 : 0
}

async function mapAll() {
  const applyCode = await runNode(path.join('scripts','modelo100.rules.apply.mjs'), { APPLY: '1' })
  if (applyCode) { process.exitCode = 1; return }
  const csvCode  = await runNode(path.join('scripts','modelo100.mapped.csv.mjs'), {})
  const htmlCode = await runNode(path.join('scripts','modelo100.mapped.html.mjs'), {})
  process.exitCode = (csvCode || htmlCode) ? 1 : 0
}

async function main() {
  const cmd = process.argv[2]
  if (!cmd || ['-h','--help','help'].includes(cmd)) {
    console.log(`
Modelo 100 CLI — mapping & reports

Usage:
  node scripts/modelo100.cli.mjs map-apply   # dry-run by default; use APPLY=1 to write mapped.json
  node scripts/modelo100.cli.mjs map-report  # generate mapped.csv and mapped.html from mapped.json
  node scripts/modelo100.cli.mjs map-all     # APPLY=1 then generate CSV+HTML

Environment overrides:
  OCR_JSON=/path/to/ocr.json
  RULES_JSON=/path/to/rules.eval.json
  MAP_JSON=/path/to/modelo100.fields.map.json
  MAPPED_JSON=/path/to/mapped.json (for report commands)
`)
    return
  }

  if (cmd === 'map-apply') return mapApply()
  if (cmd === 'map-report') return mapReport()
  if (cmd === 'map-all') return mapAll()

  console.error(`Unknown command: ${cmd}`)
  process.exitCode = 1
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e.stack || String(e)); process.exitCode = 1 })
}

// === ADMIN BRIDGE (08.4) ===
if (import.meta.url === `file://${process.cwd()}/scripts/modelo100.cli.mjs` && process.argv[2] === "admin") {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, ["scripts/modelo100.cli.admin.mjs", ...process.argv.slice(3)], { stdio:"inherit" });
  process.exit(r.status ?? 0);
}
