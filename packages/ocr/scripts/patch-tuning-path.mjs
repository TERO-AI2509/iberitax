import fs from 'node:fs';
import path from 'node:path';

const file = 'packages/ocr/scripts/drift.run.mjs';
let s = fs.readFileSync(file, 'utf8');
let lines = s.split(/\r?\n/);

// Remove any existing banner lines
lines = lines.filter(l => !l.includes('[TUNING BANNER]'));

// Ensure imports are present once
if (!lines.some(l => /^import\s+fs\s+from\s+['"]node:fs['"]/.test(l))) {
  lines.unshift("import fs from 'node:fs'");
}
if (!lines.some(l => /^import\s+path\s+from\s+['"]node:path['"]/.test(l))) {
  lines.unshift("import path from 'node:path'");
}

// Insert after last import
let lastImport = -1;
for (let i = 0; i < lines.length; i++) if (/^import\s.+from\s+/.test(lines[i])) lastImport = i;

const banner = `
(() => {
  const candidates = [
    path.resolve(process.cwd(), 'config/tuning.step29.json'),
    path.resolve(process.cwd(), 'packages/ocr/config/tuning.step29.json'),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'config', 'tuning.step29.json')
  ];
  let t = null, hit = null;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) { t = JSON.parse(fs.readFileSync(c, 'utf8')); hit = c; break; }
    } catch {}
  }
  const PF = (t && t.perField) || {};
  const F8 = PF.field_8 || {};
  console.log('[TUNING BANNER]', JSON.stringify({
    hit, flags: Object.keys(F8),
    hasBias: !!F8.biasRightTotals
  }));
})();
`.trim();

lines.splice(lastImport + 1, 0, banner);
fs.writeFileSync(file, lines.join('\n'));
console.log('patched', file);
