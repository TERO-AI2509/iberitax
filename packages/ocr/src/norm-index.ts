import { normalizeSpanishText } from "./normalize.js";
import { ocrImageBuffer, type OcrOptions } from "./image.js";
import { ocrPdfBuffer } from "./pdf.js";

export async function ocrAndNormalizeImage(
  buf: Buffer,
  opts: OcrOptions = {}
): Promise<{ text: string; normalized: string }> {
  const text = await ocrImageBuffer(buf, opts);
  const normalized = normalizeSpanishText(text);
  return { text, normalized };
}

export async function ocrAndNormalizePdf(
  buf: Buffer,
  opts: OcrOptions = {}
): Promise<{ text: string; normalized: string }> {
  const text = await ocrPdfBuffer(buf, opts);
  const normalized = normalizeSpanishText(text);
  return { text, normalized };
}

export { normalizeSpanishText };
