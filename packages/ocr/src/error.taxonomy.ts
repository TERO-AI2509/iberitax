export type ErrorType = "tokenization" | "ocr-skip" | "normalization" | "other";
const DECIMAL_COMMA = /\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b|\d+,\d+/;
const CURRENCY = /\bEUR\b|€/;
const DATE_DMY = /\b([0-3]?\d)[\/\-]([01]?\d)[\/\-]((?:19|20)?\d{2})\b/;
export function inferErrorTypesFromPhrases(phrases: string[]): Set<ErrorType> {
  const s = phrases.join(" ");
  const types = new Set<ErrorType>();
  if (DECIMAL_COMMA.test(s) || CURRENCY.test(s) || DATE_DMY.test(s)) types.add("normalization");
  const tokens = s.split(/\s+/);
  const shortRatio = tokens.filter(t => t.length <= 3).length / Math.max(tokens.length, 1);
  if (shortRatio > 0.35) types.add("tokenization");
  return types;
}
export function classifyByRecall(recallPct: number, phraseHints: Set<ErrorType>): ErrorType {
  if (recallPct < 15) return "ocr-skip";
  if (phraseHints.has("normalization")) return "normalization";
  if (phraseHints.has("tokenization")) return "tokenization";
  return "other";
}
