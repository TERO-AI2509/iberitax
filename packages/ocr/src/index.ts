export {
  ocrAndNormalizeImage,
  ocrAndNormalizePdf,
  normalizeSpanishText,
  normalizeFields
} from "./norm-index.js";

export { normalizeEuroAmount } from "./normalize.js";

/**
 * Some parts of the package import getPreprocessOptsFromEnv from "./index.js".
 * Provide a minimal, typed implementation here to satisfy those imports.
 */
export type PreprocessOpts = {
  deskew?: boolean;
  denoise?: boolean;
  binarize?: boolean;
};

export function getPreprocessOptsFromEnv(env: NodeJS.ProcessEnv = process.env): PreprocessOpts {
  const flag = (k: string) => /^(1|true|yes|on)$/i.test(String(env[k] ?? ""));
  return {
    deskew: flag("OCR_DESKEW"),
    denoise: flag("OCR_DENOISE"),
    binarize: flag("OCR_BINARIZE"),
  };
}
