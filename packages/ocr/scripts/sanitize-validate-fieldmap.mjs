import fs from 'node:fs';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');
let lines = s.split(/\r?\n/);

// 1) Remove any previous FIELD_MAP_DEBUG blocks or lines
let out = [];
let skip = false;
for (const L of lines) {
  if (L.includes('/* FIELD_MAP_DEBUG:START */')) { skip = true; continue; }
  if (L.includes('/* FIELD_MAP_DEBUG:END */'))   { skip = false; continue; }
  if (L.includes('/* FIELD_MAP_DEBUG:WRITE */')) { continue; }
  if (L.includes('[FIELD_MAP_DEBUG]'))           { continue; }
  if (skip) continue;
  out.push(L);
}
lines = out;

// 2) Remove ALL fs/path imports (we'll add one clean pair)
lines = lines.filter(l => !/^import\s+fs\s+from\s+['"]node:fs['"];?\s*$/.test(l) &&
                          !/^import\s+path\s+from\s+['"]node:path['"];?\s*$/.test(l));

// 3) Add one clean fs/path import at the very top
lines.unshift("import path from 'node:path'");
lines.unshift("import fs from 'node:fs'");

// 4) Insert START hook after the validateExtract signature
const startHook = [
  "  /* FIELD_MAP_DEBUG:START */",
  "  const __MAPDBG = process.env.MAP_DEBUG;",
  "  if (__MAPDBG) {",
  "    console.log('[FIELD_MAP_DEBUG] enabled');",
  "    try {",
  "      const ping = path.resolve(process.cwd(), 'packages/ocr/artifacts/field_map.ping.txt');",
  "      fs.mkdirSync(path.dirname(ping), { recursive: true });",
  "      fs.writeFileSync(ping, String(Date.now()));",
  "    } catch {}",
  "  }",
  "  /* FIELD_MAP_DEBUG:END */"
].join('\n');

let idxSig = lines.findIndex(l => /export\s+async\s+function\s+validateExtract\s*\(/.test(l));
if (idxSig !== -1) {
  // insert after the signature line's opening brace
  let braceLine = idxSig;
  // find the first line after signature that contains just '{' or includes '{'
  while (braceLine < lines.length && !/{/.test(lines[braceLine])) braceLine++;
  lines.splice(braceLine + 1, 0, startHook);
} else {
  // fallback: put near top if signature not found (shouldn't happen)
  lines.splice(3, 0, startHook);
}

// 5) Insert WRITE hook right before the final "return result;"
const writeHook = [
  "  /* FIELD_MAP_DEBUG:WRITE */",
  "  try {",
  "    if (__MAPDBG) {",
  "      const base = path.resolve(process.cwd(), 'packages/ocr/artifacts');",
  "      fs.mkdirSync(base, { recursive: true });",
  "      const rawPath = path.join(base, 'field_map.raw.json');",
  "      const mapPath = path.join(base, 'field_map.debug.json');",
  "      const fm = (result && (result as any).fieldMap) ? (result as any).fieldMap : {};",
  "      fs.writeFileSync(rawPath, JSON.stringify({ keys: Object.keys(result||{}).slice(0,80) }, null, 2));",
  "      fs.writeFileSync(mapPath, JSON.stringify(fm, null, 2));",
  "    }",
  "  } catch {}"
].join('\n');

let lastReturn = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (/return\s+result\s*;/.test(lines[i])) { lastReturn = i; break; }
}
if (lastReturn !== -1) {
  lines.splice(lastReturn, 0, writeHook);
}

fs.writeFileSync(file, lines.join('\n'));
console.log('sanitized + hooked', file);
