import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

// Ensure fs/path import once
if (!/from 'node:fs'/.test(s))   s = "import fs from 'node:fs'\n" + s;
if (!/from 'node:path'/.test(s)) s = "import path from 'node:path'\n" + s;
if (!/from 'node:url'/.test(s))  s = "import { fileURLToPath } from 'node:url'\n" + s;

// Ensure __dirname is available
if (!/__dirname\s*=/.test(s)) {
  // insert right after the import block
  const lines = s.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) if (/^import /.test(lines[i])) lastImport = i;
  lines.splice(lastImport + 1, 0, "const __dirname = path.dirname(fileURLToPath(import.meta.url))");
  s = lines.join('\n');
}

// Replace the WRITE block to use <pkg>/artifacts resolved from __dirname
const re = /\/\* FIELD_MAP_DEBUG:WRITE \*\/[\s\S]*?return result;/m;
if (!re.test(s)) {
  console.error('WRITE block not found; cannot patch');
  process.exit(1);
}
s = s.replace(re, `
  /* FIELD_MAP_DEBUG:WRITE */
  try {
    if (__MAPDBG) {
      const base = path.resolve(__dirname, '..', '..', 'artifacts');
      fs.mkdirSync(base, { recursive: true });
      const rawPath = path.join(base, 'field_map.raw.json');
      const mapPath = path.join(base, 'field_map.debug.json');
      const fm = (result && (result).fieldMap) ? (result).fieldMap : {};
      fs.writeFileSync(rawPath, JSON.stringify({ keys: Object.keys(result||{}).slice(0,80) }, null, 2));
      fs.writeFileSync(mapPath, JSON.stringify(fm, null, 2));
    }
  } catch {}
  return result;`);

fs.writeFileSync(file, s);
console.log('patched write base -> packages/ocr/artifacts in', file);
