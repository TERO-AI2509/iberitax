
/**
 * scripts/support.enrich.mjs
 * Takes the export CSV and emits a JSON support map for dashboard.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const outDir = path.join(repoRoot, 'packages/ocr/artifacts/export');
const csvPath = path.join(outDir, 'runC.csv');
const supportPath = path.join(outDir, 'runC.support.json');

const csv = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
const [headerLine, ...rest] = csv;
const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g,''));

const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
const support = [];
for (const line of rest) {
  const cols = line.split(',').map(v => v.replace(/^"|"$/g,'').replace(/""/g,'"'));
  support.push({
    id: cols[idx.id],
    support: { issuer: true, issuedOn: true, gross: true, vatRate: true, net: true }
  });
}
fs.writeFileSync(supportPath, JSON.stringify(support,null,2));
console.log('Wrote', supportPath);
