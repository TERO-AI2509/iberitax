
/**
 * scripts/fixtures.export.mjs
 * Aggregates fixtures and prepares an export CSV compatible with post-history + drift:gen.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const samplesDir = path.join(repoRoot, 'packages/ocr/tests/contracts/samples');

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const rows = [];
for (const p of walk(samplesDir)) {
  if (p.endsWith('golden.normalized.json')) {
    const slug = path.basename(path.dirname(p));
    const golden = loadJSON(p);
    rows.push({
      id: slug,
      documentType: golden.documentType,
      issuer: golden.issuer ?? '',
      issuedOn: golden.issuedOn ?? '',
      currency: golden.currency ?? '',
      gross: golden.amount?.gross ?? '',
      vatRate: golden.amount?.vatRate ?? '',
      net: golden.amount?.net ?? ''
    });
  }
}

if (!rows.length) {
  console.error('No fixtures found under', samplesDir);
  process.exit(2);
}

const outDir = path.join(repoRoot, 'packages/ocr/artifacts/export');
fs.mkdirSync(outDir, { recursive: true });
const csvPath = path.join(outDir, 'runC.csv');

// naive CSV writer
const headers = Object.keys(rows[0]);
const lines = [headers.join(',')];
for (const r of rows) {
  lines.push(headers.map(h => String(r[h]).replace(/"/g,'""')).map(v => `"${v}"`).join(','));
}
fs.writeFileSync(csvPath, lines.join('\n'), 'utf8');
console.log('Wrote', csvPath);
