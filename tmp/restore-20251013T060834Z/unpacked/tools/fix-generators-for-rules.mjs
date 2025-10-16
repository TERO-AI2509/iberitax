import fs from 'node:fs/promises'

async function fix(file){
  let s = await fs.readFile(file,'utf8')
  if (!s.includes("from './modelo100.rules.load.mjs'") && !s.includes('from "./modelo100.rules.load.mjs"')) {
    const m = s.match(/^(?:import[\s\S]*?\n)+/m)
    const imp = `import { loadRules } from './modelo100.rules.load.mjs'\n`
    if (m) s = s.replace(m[0], m[0] + imp)
    else s = imp + s
  }
  s = s.replace(/^\s*const\s*\{\s*loadRules\s*\}\s*=\s*await\s+import\(["'][.]\/modelo100\.rules\.load\.mjs["']\);\s*\n?/m, '')
  s = s.replace(/export\s+default\s+function(\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/, 'export default async function$1')
  s = s.replace(/export\s+default\s+function(\s*\([^)]*\)\s*\{)/, 'export default async function$1')
  await fs.writeFile(file, s, 'utf8')
  console.log(`Fixed: ${file}`)
}

for (const f of process.argv.slice(2)) {
  await fix(f).catch(e => { console.error(`Failed ${f}:`, e); process.exitCode=1 })
}
