// Simple local OCR micro-benchmark: raw vs preprocessed
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { ocrAndNormalizeImage, preprocessImageBuffer } from "../packages/ocr/dist/index.js";

const FIXTURE = "/Users/eltjotimmerman/TERO-AI/dev/iberitax/tests/fixtures/ocr/hola.png";

function toText(v) {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    if (typeof v.text === "string") return v.text;
    if (typeof v.normalized === "string") return v.normalized;
    if (typeof v.ocr === "string") return v.ocr;
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v ?? "");
}
function tokensOf(v) {
  const s = toText(v);
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function ms(t0, t1) {
  return Math.round(t1 - t0);
}

async function main() {
  const buf = fs.readFileSync(FIXTURE);

  const t0 = performance.now();
  const raw = await ocrAndNormalizeImage(buf);
  const t1 = performance.now();

  const preBuf = await preprocessImageBuffer(buf, { deskew: true, binarize: true, blurRadius: Number(process.env.OCR_BLUR_RADIUS || 1) });
  const t2a = performance.now();
  const pre = await ocrAndNormalizeImage(preBuf);
  const t2 = performance.now();

  console.log("=== OCR Bench (raw vs preprocessed) ===");
  console.log(`raw_ms=${ms(t0, t1)} raw_tokens=${tokensOf(raw)}`);
  console.log(`pre_ms=${ms(t2a, t2)} pre_tokens=${tokensOf(pre)}`);

  const rawText = toText(raw).toLowerCase();
  const preText = toText(pre).toLowerCase();
  if (!rawText.includes("hola") && !preText.includes("hola")) process.exitCode = 1;
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
