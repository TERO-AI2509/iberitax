import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

// Ensure single imports
if (!/from 'node:fs'/.test(s))   s = "import fs from 'node:fs'\n" + s;
if (!/from 'node:path'/.test(s)) s = "import path from 'node:path'\n" + s;
if (!/from 'node:url'/.test(s))  s = "import { fileURLToPath } from 'node:url'\n" + s;

// Ensure __dirname once
if (!/__dirname\s*=/.test(s)) {
  const lines = s.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) if (/^import /.test(lines[i])) lastImport = i;
  lines.splice(lastImport + 1, 0, "const __dirname = path.dirname(fileURLToPath(import.meta.url))");
  s = lines.join('\n');
}

// Ensure the debug flag is present near the function start (harmless if unused)
if (!/const __MAPDBG = process\.env\.MAP_DEBUG;/.test(s)) {
  s = s.replace(
    /export\s+async\s+function\s+validateExtract\s*\(([^\)]*)\)\s*{/,
    (m) => m + "\n  const __MAPDBG = process.env.MAP_DEBUG;\n  if (__MAPDBG) console.log('[FIELD_MAP_DEBUG] enabled');\n"
  );
}

// Inject writer before the **last** `return result;`
const writeBlock =
`  /* FIELD_MAP_DEBUG:WRITE (forced) */
  try {
    if (__MAPDBG) {
      const base = path.resolve(__dirname, '..', '..', 'artifacts');
      fs.mkdirSync(base, { recursive: true });
      const rawPath = path.join(base, 'field_map.raw.json');
      const mapPath = path.join(base, 'field_map.debug.json');
      const fm = (result && result.fieldMap) ? result.fieldMap : {};
      fs.writeFileSync(rawPath, JSON.stringify({ keys: Object.keys(result||{}).slice(0,80) }, null, 2));
      fs.writeFileSync(mapPath, JSON.stringify(fm, null, 2));
    }
  } catch {}`;

const matches = [...s.matchAll(/return\s+result\s*;/g)];
if (matches.length === 0) {
  console.error("Could not find 'return result;'. Aborting.");
  process.exit(1);
}
const last = matches[matches.length - 1];
const idx = last.index;
const before = s.slice(0, idx);
const after  = s.slice(idx);
s = before + writeBlock + "\n" + after;

fs.writeFileSync(file, s);
console.log('Injected write block before last `return result;` in', file);
