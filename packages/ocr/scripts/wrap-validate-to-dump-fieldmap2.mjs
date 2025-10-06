import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

// 0) Ensure imports and __dirname (idempotent)
if (!/from 'node:fs'/.test(s))   s = "import fs from 'node:fs'\n" + s;
if (!/from 'node:path'/.test(s)) s = "import path from 'node:path'\n" + s;
if (!/from 'node:url'/.test(s))  s = "import { fileURLToPath } from 'node:url'\n" + s;
if (!/__dirname\s*=/.test(s)) {
  const lines = s.split(/\r?\n/);
  let lastImport = -1;
  for (let i=0;i<lines.length;i++) if (/^import /.test(lines[i])) lastImport = i;
  lines.splice(lastImport+1, 0, "const __dirname = path.dirname(fileURLToPath(import.meta.url))");
  s = lines.join('\n');
}

// 1) Skip if already wrapped
if (/export\s+async\s+function\s+validateExtract\s*\([\s\S]*?\)\s*{\s*const\s+__wrapped_marker\s*=/.test(s) ||
    /export\s+const\s+validateExtract\s*=\s*\(?[\s\S]*?\)?\s*=>\s*{\s*const\s+__wrapped_marker\s*=/.test(s)) {
  console.log('already wrapped');
  process.exit(0);
}

// 2) Try multiple patterns to find and rename the exported validateExtract to __validateExtract_impl

let replaced = false;

// A) export async function validateExtract(...) { ... }
s = s.replace(
  /export\s+async\s+function\s+validateExtract\s*\(([\s\S]*?)\)\s*{/,
  (m, params) => { replaced = true; return `async function __validateExtract_impl(${params}) {`; }
);

// B) export function validateExtract(...) { ... }
if (!replaced) {
  s = s.replace(
    /export\s+function\s+validateExtract\s*\(([\s\S]*?)\)\s*{/,
    (m, params) => { replaced = true; return `function __validateExtract_impl(${params}) {`; }
  );
}

// C) export const validateExtract = async (...) => {
if (!replaced) {
  s = s.replace(
    /export\s+const\s+validateExtract\s*=\s*async\s*\(([\s\S]*?)\)\s*=>\s*{/,
    (m, params) => { replaced = true; return `const __validateExtract_impl = async (${params}) => {`; }
  );
}

// D) export const validateExtract = (...) => {
if (!replaced) {
  s = s.replace(
    /export\s+const\s+validateExtract\s*=\s*\(([\s\S]*?)\)\s*=>\s*{/,
    (m, params) => { replaced = true; return `const __validateExtract_impl = (${params}) => {`; }
  );
}

if (!replaced) {
  console.error('Could not locate exported validateExtract in a known pattern. Aborting.');
  process.exit(1);
}

// 3) Extract parameter list for wrapper call (best-effort)
let paramsMatch = s.match(/__validateExtract_impl\s*\(([\s\S]*?)\)\s*=>|__validateExtract_impl\s*\(([\s\S]*?)\)\s*{/);
let paramList = null;
if (paramsMatch) {
  paramList = (paramsMatch[1] || paramsMatch[2] || '').trim();
} else {
  // Fallback: guess common signature names
  paramList = 'input, options';
}

// 4) Append exported wrapper
const wrapper = `
export async function validateExtract(${paramList}) {
  const __wrapped_marker = true;
  const __MAPDBG = process.env.MAP_DEBUG;
  const result = await __validateExtract_impl(${paramList});
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
console.log('wrapped validateExtract and added field-map dump in', file);
