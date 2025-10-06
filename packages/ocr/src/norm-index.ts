import { normalizeEuroAmount } from "./normalize.js";

function normAmount(v: unknown): string | null {
  const n = normalizeEuroAmount(v);
  return n ?? null;
}

/** Light text normalization for Spanish content (extend as needed). */
export function normalizeSpanishText(input: unknown): unknown {
  if (typeof input === "string") return input.normalize("NFKC").trim();
  return input;
}

/** Normalize a plain object of extracted fields. */
export function normalizeFields(input: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const src = input ?? {};
  const out: Record<string, unknown> = { ...src };
  // Targeted money fields for Step 25
  out.field_7 = normAmount((src as any).field_7);
  out.field_8 = normAmount((src as any).field_8);
  return out;
}

/** Stubbed OCR wrappers (keep public API stable). */
export async function ocrAndNormalizeImage(img: any): Promise<Record<string, unknown>> {
  return normalizeFields(img);
}
export async function ocrAndNormalizePdf(pdf: any): Promise<Record<string, unknown>> {
  return normalizeFields(pdf);
}
