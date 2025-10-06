import fs from 'node:fs';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

// ensure single imports
if (!/from 'node:fs'/.test(s))  s = "import fs from 'node:fs'\n"   + s;
if (!/from 'node:path'/.test(s)) s = "import path from 'node:path'\n" + s;

// add env flag and console ping after function sig
if (!s.includes('/* FIELD_MAP_DEBUG:START */')) {
  s = s.replace(
    /export\s+async\s+function\s+validateExtract\s*\(([\s\S]*?)\)\s*{/,
    (m) => m + `
  /* FIELD_MAP_DEBUG:START */
  const __MAPDBG = process.env.MAP_DEBUG;
  if (__MAPDBG) {
    // lightweight ping so we know the hook executed
    console.log('[FIELD_MAP_DEBUG] enabled');
    try {
      const ping = path.resolve(process.cwd(), 'packages/ocr/artifacts/field_map.ping.txt');
      fs.mkdirSync(path.dirname(ping), { recursive: true });
      fs.writeFileSync(ping, String(Date.now()));
    } catch {}
  }
  /* FIELD_MAP_DEBUG:END */
`
  );
}

// before return, dump raw result + fieldMap keys if present
if (!s.includes('/* FIELD_MAP_DEBUG:WRITE */')) {
  s = s.replace(
    /return\s+result\s*;/,
    `
  /* FIELD_MAP_DEBUG:WRITE */
  try {
    if (__MAPDBG) {
      const base = path.resolve(process.cwd(), 'packages/ocr/artifacts');
      fs.mkdirSync(base, { recursive: true });
      const rawPath = path.join(base, 'field_map.raw.json');
      const mapPath = path.join(base, 'field_map.debug.json');
      const fm = (result && (result as any).fieldMap) ? (result as any).fieldMap : {};
      // write raw result (trimmed) and the extracted fieldMap
      fs.writeFileSync(rawPath, JSON.stringify({ keys: Object.keys(result||{}).slice(0,50) }, null, 2));
      fs.writeFileSync(mapPath, JSON.stringify(fm, null, 2));
    }
  } catch {}
  return result;
`
  );
}

fs.writeFileSync(file, s);
console.log('patched FIELD_MAP_DEBUG with imports + writes:', file);
