import fs from 'node:fs/promises'

const injection =
`  const { loadRules } = await import("./modelo100.rules.load.mjs");
  const { rules, errors } = await loadRules();
  if (errors.length) { throw new Error("Rule schema invalid:\\n" + errors.join("\\n")); }
  ctx.rules = rules; ctx.rules_count = rules.length;
`

async function inject(file){
  let s = await fs.readFile(file, 'utf8')
  const patterns = [
    /export\s+default\s+async\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{/s, // named
    /export\s+default\s+async\s+function\s*\([^)]*\)\s*\{/s                // anonymous
  ]
  let matched = false
  for (const rx of patterns){
    if (rx.test(s)) {
      s = s.replace(rx, m => m + '\n' + injection)
      matched = true
      break
    }
  }
  if (!matched) {
    // Fallback: inject after the first "{"
    const i = s.indexOf('{')
    if (i === -1) throw new Error(`No "{" found to inject in ${file}`)
    s = s.slice(0, i+1) + '\n' + injection + s.slice(i+1)
  }
  await fs.writeFile(file, s, 'utf8')
  console.log(`Injected loader into: ${file}`)
}

const files = process.argv.slice(2)
if (!files.length) {
  console.error('Usage: node tools/inject-rules-loader.mjs <file1> <file2> ...')
  process.exit(2)
}

for (const f of files) {
  await inject(f).catch(e => {
    console.error(`Failed to inject ${f}:`, e.message)
    process.exitCode = 1
  })
}
