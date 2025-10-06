
#!/usr/bin/env node
/**
 * scripts/make-fixture.mjs
 * Scaffolds a new OCR fixture with input + golden normalized skeleton.
 * Usage:
 *   node packages/ocr/scripts/make-fixture.mjs salary_slip_q2_2025 salary_slip "Acme B.V." 2025-06-30 EUR 4500 0 4500
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
  console.log('wrote', p);
}

function main() {
  const [slug, docType, issuer, issuedOn, currency, grossStr, vatRateStr, netStr] = process.argv.slice(2);
  if (!slug || !docType || !issuer || !issuedOn || !currency || !grossStr || !vatRateStr || !netStr) {
    console.error('Missing args. See header for usage.');
    process.exit(1);
  }
  const gross = Number(grossStr);
  const vatRate = Number(vatRateStr);
  const net = Number(netStr);

  const base = path.join(repoRoot, 'packages/ocr/tests/contracts/samples', slug);
  ensureDir(base);

  const raw = {
    source: "ocr-engine-v3",
    doc_type_hint: docType,
    pages: 1,
    language: "nl",
    blocks: [
      { type: "text", value: issuer },
      { type: "text", value: docType },
      { type: "text", value: `Date: ${issuedOn}` },
      { type: "text", value: `Gross: ${currency} ${gross.toFixed(2)}` },
      { type: "text", value: `VAT ${vatRate}%` },
      { type: "text", value: `Net: ${currency} ${net.toFixed(2)}` },
    ]
  };

  const golden = {
    documentType: docType,
    issuer,
    issuedOn,
    currency,
    amount: { gross: gross, vatRate, net: net },
    support: {
      issuer: true,
      issuedOn: true,
      "amount.gross": true,
      "amount.vatRate": true,
      "amount.net": true
    }
  };

  writeJSON(path.join(base, 'input.ocr.json'), raw);
  writeJSON(path.join(base, 'golden.normalized.json'), golden);
}

main();
