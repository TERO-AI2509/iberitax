import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

// 1) Ensure imports (once)
if (!/from 'node:fs'/.test(s))   s = "import fs from 'node:fs'\n" + s;
if (!/from 'node:path'/.test(s)) s = "import path from 'node:path'\n" + s;
if (!/from 'node:url'/.test(s))  s = "import { fileURLToPath } from 'node:url'\n" + s;
if (!/__dirname\s*=/.test(s)) {
  const lines = s.split(/\r?\n/);
  let lastImport=-1; for (let i=0;i<lines.length;i++) if (/^import /.test(lines[i])) lastImport=i;
  lines.splice(lastImport+1,0,"const __dirname = path.dirname(fileURLToPath(import.meta.url))");
  s = lines.join('\n');
}

// 2) If already wrapped, skip
if (/export\s+async\s+function\s+validateExtract\s*\([\s\S]*?\)\s*{\s*const\s+__wrapped_marker\s*=\s*true/.test(s)) {
  console.log('already wrapped');
  process.exit(0);
}

// 3) Rename the original export to an internal impl and capture parameters
const m = s.match(/export\s+async\s+function\s+validateExtract\s*\(([\s\S]*?)\)\s*{/);
if (!m) {
  console.error('Could not find exported validateExtract signature');
  process.exit(1);
}
const params = m[1].trim();

// Replace only the first exported signature with internal impl
s = s.replace(/export\s+async\s+function\s+validateExtract\s*\(([\s\S]*?)\)\s*{/, `async function __validateExtract_impl(${params}) {`);

// 4) Append a new exported wrapper at the end
const wrapper = `
export async function validateExtract(${params}) {
  const __wrapped_marker = true;
  const __MAPDBG = process.env.MAP_DEBUG;
  const result = await __validateExtract_impl(${params});
  if (__MAPDBG) {
    try {
      const base = path.resolve(__dirname, '..', '..', 'artifacts');
      fs.mkdirSync(base, { recursive: true });
      const rawPath = path.join(base, 'field_map.raw.json');
      const mapPath = path.join(base, 'field_map.debug.json');
      const fm = (result && result.fieldMap) ? result.fieldMap : {};
      fs.writeFileSync(rawPath, JSON.stringify({ keys: Object.keys(result||{}).slice(0,80) }, null, 2));
      fs.writeFileSync(mapPath, JSON.stringify(fm, null, 2));
      console.log('[FIELD_MAP_DEBUG] wrote', mapPath);
    } catch (e) {
      console.log('[FIELD_MAP_DEBUG] write error', String(e && e.message || e));
    }
  }
  return result;
}
`;
s = s + '\n' + wrapper;

fs.writeFileSync(file, s);
console.log('wrapped and added field-map dump in', file);
