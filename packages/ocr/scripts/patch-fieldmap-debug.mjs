import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');
if (s.includes('FIELD_MAP_DEBUG')) {
  console.log('already patched');
  process.exit(0);
}

s = s.replace(
  /export\s+async\s+function\s+validateExtract\s*\(([\s\S]*?)\)\s*{/,
  (m) => m + '\n  const __MAPDBG = process.env.MAP_DEBUG;\n'
);

s = s.replace(
  /return\s+result\s*;/,
  `if (__MAPDBG) {
    const p = path.resolve(process.cwd(), 'packages/ocr/artifacts/field_map.debug.json');
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      const fm = (result && (result as any).fieldMap) ? (result as any).fieldMap : {};
      fs.writeFileSync(p, JSON.stringify(fm, null, 2));
    } catch {}
  }
  return result;`
);

fs.writeFileSync(file, s);
console.log('patched FIELD_MAP_DEBUG', file);
