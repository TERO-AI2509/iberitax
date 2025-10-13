import { loadRules } from './modelo100.rules.load.mjs'
import * as fs from 'node:fs/promises'

const targets = [
  'artifacts/modelo100/rules.index.html',
  'artifacts/modelo100/rules.insights.html',
  'artifacts/modelo100/rules.dashboard.html',
]

const { rules, errors } = await loadRules()
if (errors.length) {
  console.error('Schema errors:', errors.join('\n'))
  process.exit(1)
}
if (!rules.length) {
  console.error('No rules found to append.')
  process.exit(2)
}

const block = [
  '\n<!-- AUTO-APPENDED RULES SECTION -->',
  '<section id="rules-source" style="margin:2rem 0">',
  '<h2>Rules (from /rules)</h2>',
  '<ul>',
  ...rules.map(r=>`<li><strong>${r.id}</strong> — ${r.severity} — [${(r.tags||[]).join(', ')}] — ${r.message}</li>`),
  '</ul>',
  '</section>\n'
].join('\n')

for (const file of targets) {
  const html = await fs.readFile(file,'utf8').catch(()=>null)
  if (!html) continue
  if (html.includes('<!-- AUTO-APPENDED RULES SECTION -->')) continue
  await fs.writeFile(file, html + block, 'utf8')
  console.log('Appended rules to', file)
}
