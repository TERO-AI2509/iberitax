import fs from 'node:fs/promises'

async function fix(file){
  let s = await fs.readFile(file,'utf8')
  s = s.replace(/export\s+default\s+function(\s+[A-Za-z0-9_]+\s*\()/, 'export default async function$1')
  s = s.replace(/export\s+default\s+function(\s*\()/, 'export default async function$1')
  s = s.replace(/export\s+default\s+(?!async\s*)\(/, 'export default async (')
  await fs.writeFile(file, s, 'utf8')
  console.log(`asyncified: ${file}`)
}

for (const f of process.argv.slice(2)) await fix(f)
