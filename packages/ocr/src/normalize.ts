const NUM_CONF_FLOOR=0.75;
const GROUPING_TOL=0.16;
/**
 * Replace common OCR glyph confusions in numeric contexts.
 * Only keeps digits, separators, sign, and a few safe chars.
 */
export function cleanNumericGlyphs(input: unknown): string {
  const s = String(input ?? "");
  // map common OCR confusions (uppercase first, then lowercase)
  const mapped = s
    .replace(/[OÒÓÔÕÖØ]/g, "0")
    .replace(/[o]/g, "0")
    .replace(/[lIíÍ]/g, "1")
    .replace(/[S]/g, "5")
    .replace(/[B]/g, "8")
    .replace(/[Z]/g, "2")
    .replace(/[—–\--‒]/g, "-"); // normalize dashes to hyphen
  // keep only allowed chars for numeric parsing
  return mapped.replace(/[^0-9.,+\-\s€\u00A0\u202F]/g, "");
}

/**
 * Parse a European/Spanish-formatted number string into "1234.56".
 * Accepts "."/spaces as thousands, "," as decimal, strips currency and noise.
 */
export function normalizeEuroAmount(input: unknown): string | null {
  if (input == null) return null;

  let s = cleanNumericGlyphs(input)
    // strip currency sign explicitly
    .replace(/[€\u20AC]/g, "")
    // collapse thin/nbsp/regular spaces
    .replace(/[\u00A0\u202F ]+/g, " ")
    .trim();

  if (!s) return null;

  // sign tidy: "- 1 234,56" → "-1 234,56"
  s = s.replace(/^\s*([+-])\s*/, "$1").replace(/\s+$/g, "");

  // If there's a comma, treat it as decimal, so remove "." and spaces
  if (s.includes(",")) {
    s = s.replace(/[.\s]/g, "").replace(",", ".");
  } else {
    // US style, drop spaces only
    s = s.replace(/\s+/g, "");
  }

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2);
}
