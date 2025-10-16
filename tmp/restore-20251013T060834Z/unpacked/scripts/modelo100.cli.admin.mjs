#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import path from 'node:path'

const ROOT = process.cwd()
const sub = process.argv[2] || ''
const rest = process.argv.slice(3)

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, env: process.env })
  process.exitCode = r.status ?? 0
}

if (sub === 'map-health') {
  run('node', ['scripts/modelo100.map.health.mjs', ...rest])
} else if (sub === 'owners') {
  run('node', ['scripts/modelo100.rules.owners.build.mjs', ...rest])
} else if (sub === 'stale') {
  run('node', ['scripts/modelo100.rules.stale.flag.mjs', ...rest])
} else {
  console.log('Usage:')
  console.log('  admin map-health [--out artifacts/modelo100/health.report.json]')
  console.log('  admin owners')
  console.log('  admin stale')
  process.exitCode = 64
}
