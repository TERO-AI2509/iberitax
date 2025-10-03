import fs from "node:fs";
import { ocrAndNormalizePdf } from "../packages/ocr/dist/index.js";
const pdf = fs.readFileSync("tests/fixtures/ocr/scanned.pdf");
const { text, normalized } = await ocrAndNormalizePdf(pdf, { lang: process.env.OCR_LANG || "eng" });
console.log("raw:", text.slice(0, 120));
console.log("norm:", normalized.slice(0, 120));
const ok = normalized.length > 0 && text.length > 0;
if (!ok) process.exitCode = 1;
