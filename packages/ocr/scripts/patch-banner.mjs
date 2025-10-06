import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/scripts/drift.run.mjs';
let s = fs.readFileSync(file, 'utf8');
if (s.includes('[TUNING BANNER]')) {
  console.log('already patched');
  process.exit(0);
}

const lines = s.split(/\r?\n/);

// detect existing imports to avoid duplicates
const hasFs   = lines.some(l => /^import\s+fs\s+from\s+['"]node:fs['"]/.test(l));
const hasPath = lines.some(l => /^import\s+path\s+from\s+['"]node:path['"]/.test(l));

// remove any old CommonJS path require lines if present
const cleaned = [];
for (const L of lines) {
  if (/^const\s+path\s*=\s*require\(['"]path['"]\)/.test(L)) continue;
  cleaned.push(L);
}
let out = cleaned;

// ensure imports exist (only add if missing)
if (!hasPath) out.unshift("import path from 'node:path'");
if (!hasFs)   out.unshift("import fs from 'node:fs'");

// find last import to inject banner after it
let lastImport = -1;
for (let i = 0; i < out.length; i++) if (/^import\s.+from\s+/.test(out[i])) lastImport = i;

// banner prints active tuning flags for field_8, but stays harmless if file missing
const banner = "try{const p=path.resolve(process.cwd(),'packages/ocr/config/tuning.step29.json');const t=JSON.parse(fs.readFileSync(p,'utf8'));console.log('[TUNING BANNER]',JSON.stringify({flags:Object.keys((t.perField||{}).field_8||{}),hasBias:!!(t.perField&&t.perField.field_8&&t.perField.field_8.biasRightTotals)}));}catch(e){console.log('[TUNING BANNER]',JSON.stringify({flags:[],hasBias:false,err:'no-tuning'}));}";

out.splice(lastImport + 1, 0, banner);

fs.writeFileSync(file, out.join('\n'));
console.log('patched', file);
