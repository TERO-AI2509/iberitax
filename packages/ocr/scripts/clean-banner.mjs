import fs from 'node:fs';

const file = 'packages/ocr/scripts/drift.run.mjs';
let s = fs.readFileSync(file, 'utf8');
let lines = s.split(/\r?\n/);

// drop any CJS path require lines
lines = lines.filter(l => !/^const\s+path\s*=\s*require\(['"]path['"]\)/.test(l));

// keep only first fs/path ESM import
let seenFs = false, seenPath = false;
const kept = [];
for (const L of lines) {
  if (/^import\s+fs\s+from\s+['"]node:fs['"]/.test(L)) { if (seenFs) continue; seenFs = true; }
  if (/^import\s+path\s+from\s+['"]node:path['"]/.test(L)) { if (seenPath) continue; seenPath = true; }
  kept.push(L);
}
lines = kept;

// ensure both imports exist
if (!lines.some(l => /^import\s+fs\s+from\s+['"]node:fs['"]/.test(l))) lines.unshift("import fs from 'node:fs'");
if (!lines.some(l => /^import\s+path\s+from\s+['"]node:path['"]/.test(l))) lines.unshift("import path from 'node:path'");

// remove any existing banner line
lines = lines.filter(l => !l.includes('[TUNING BANNER]'));

// insert banner after last import
let lastImport = -1;
for (let i = 0; i < lines.length; i++) if (/^import\s.+from\s+/.test(lines[i])) lastImport = i;
const banner = "try{const p=path.resolve(process.cwd(),'packages/ocr/config/tuning.step29.json');const t=JSON.parse(fs.readFileSync(p,'utf8'));console.log('[TUNING BANNER]',JSON.stringify({flags:Object.keys((t.perField||{}).field_8||{}),hasBias:!!(t.perField&&t.perField.field_8&&t.perField.field_8.biasRightTotals)}));}catch(e){console.log('[TUNING BANNER]',JSON.stringify({flags:[],hasBias:false,err:'no-tuning'}));}";
lines.splice(lastImport + 1, 0, banner);

fs.writeFileSync(file, lines.join('\n'));
console.log('sanitized and patched', file);
