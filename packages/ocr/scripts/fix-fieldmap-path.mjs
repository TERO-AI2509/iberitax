import fs from 'node:fs';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

// ensure imports exactly once
if (!/from 'node:fs'/.test(s))   s = "import fs from 'node:fs'\n" + s;
if (!/from 'node:path'/.test(s)) s = "import path from 'node:path'\n" + s;
if (!/from 'node:url'/.test(s))  s = "import { fileURLToPath } from 'node:url'\n" + s;

// ensure __dirname is available
if (!/__dirname\s*=/.test(s)) {
  s = s.replace(/^(import.*\n)+/, (m) => m + "const __dirname = path.dirname(fileURLToPath(import.meta.url))\n");
}

// rewrite the DEBUG write block to use __dirname/../../artifacts
s = s.replace(
  /\/\* FIELD_MAP_DEBUG:WRITE \*\/[\s\S]*?return result;/,
  `
  /* FIELD_MAP_DEBUG:WRITE */
  try {
    if (__MAPDBG) {
      const base = path.resolve(__dirname, '..', '..', 'artifacts');
      fs.mkdirSync(base, { recursive: true });
      const rawPath = path.join(base, 'field_map.raw.json');
      const mapPath = path.join(base, 'field_map.debug.json');
      const fm = (result && (result as any).fieldMap) ? (result as any).fieldMap : {};
      fs.writeFileSync(rawPath, JSON.stringify({ keys: Object.keys(result||{}).slice(0,80) }, null, 2));
      fs.writeFileSync(mapPath, JSON.stringify(fm, null, 2));
    }
  } catch {}
  return result;`
);

fs.writeFileSync(file, s);
console.log('fixed FIELD_MAP_DEBUG write paths -> packages/ocr/artifacts');
