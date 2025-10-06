import fs from 'node:fs';

const file = 'packages/ocr/src/validate/validate.extract.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('/* EMIT_VALIDATOR_INPUT */')) {
  console.log('already patched');
  process.exit(0);
}

// Insert just after: const ocr = readJSON(inputPath);
s = s.replace(
  /const\s+ocr\s*=\s*readJSON\(inputPath\);\s*/m,
  `const ocr = readJSON(inputPath);
/* EMIT_VALIDATOR_INPUT */
try {
  // write the first seen OCR input as a debug map
  const __base = path.join(artifactsDir);
  fs.mkdirSync(__base, { recursive: true });
  const __map = path.join(__base, 'field_map.debug.json');
  if (!fs.existsSync(__map)) {
    fs.writeFileSync(__map, JSON.stringify(ocr, null, 2));
  }
  // also expose for other steps if needed
  // @ts-ignore
  (globalThis as any).__lastValidateResult = { fieldMap: ocr };
} catch {}
`
);

fs.writeFileSync(file, s);
console.log('patched emit -> packages/ocr/artifacts/field_map.debug.json');
