import Jimp from "jimp";

/**
 * Preprocess options (env-driven defaults available via getPreprocessOptsFromEnv).
 * - deskew: enable deskew pass (controlled by maxSkewDeg)
 * - binarize: enable binarization (OCR_BIN_THR or Otsu when null/undefined)
 * - blurRadius: integer radius >=1 applies blur, 0 disables
 * - invert: optional invert pass
 * - binThreshold: optional fixed threshold [0..255]; when absent/null uses Otsu
 * - maxSkewDeg: controls deskew search window [-maxSkewDeg..+maxSkewDeg]
 */
export type PreprocessOpts = {
  deskew?: boolean;
  binarize?: boolean;
  blurRadius?: number;
  invert?: boolean;
  binThreshold?: number | null;
  maxSkewDeg?: number;
};

/** Parse integer env helper with fallback and bounds */
function parseIntBounded(v: string | undefined, dflt: number, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/** Parse optional threshold [0..255]; returns null when unset/invalid */
function parseBinThreshold(v: string | undefined): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.max(0, Math.min(255, Math.round(n)));
  return clamped;
}

/**
 * Read preprocess knobs from env and produce defaults:
 * OCR_MAX_SKEW_DEG (default 5)
 * OCR_BLUR_RADIUS  (default 1)
 * OCR_BIN_THR      (optional number; when unset -> Otsu/mean)
 */
export function getPreprocessOptsFromEnv(): PreprocessOpts {
  const maxSkewDeg = parseIntBounded(process.env.OCR_MAX_SKEW_DEG, 5, 0, 45);
  const blurRadius = parseIntBounded(process.env.OCR_BLUR_RADIUS, 1, 0, 10);
  const binThreshold = parseBinThreshold(process.env.OCR_BIN_THR);

  return {
    deskew: maxSkewDeg > 0,
    binarize: true,
    blurRadius,
    invert: false,
    binThreshold,
    maxSkewDeg,
  };
}

function toGray(img: Jimp) {
  img.grayscale();
}

function blur(img: Jimp, r: number) {
  if (r && r > 0) img.blur(Math.max(1, Math.min(10, Math.floor(r))));
}

function otsuThreshold(hist: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, varMax = 0, thr = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const v = wB * wF * (mB - mF) * (mB - mF);
    if (v > varMax) {
      varMax = v;
      thr = t;
    }
  }
  return thr;
}

/** Binarize with optional fixed threshold; falls back to Otsu when not provided */
async function binarize(img: Jimp, threshold?: number | null) {
  const { data, width, height } = img.bitmap as any;
  let thr: number;
  if (threshold == null) {
    const hist = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i];
      hist[v]++;
    }
    thr = otsuThreshold(hist, width * height);
  } else {
    thr = Math.max(0, Math.min(255, Math.round(threshold)));
  }
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] >= thr ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
  }
}

function scoreVerticalProjection(img: Jimp) {
  const { data, width, height } = img.bitmap as any;
  const colSum = new Array(width).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      colSum[x] += 255 - data[idx];
    }
  }
  let varSum = 0, mean = 0;
  for (const c of colSum) mean += c;
  mean /= width;
  for (const c of colSum) {
    const d = c - mean;
    varSum += d * d;
  }
  return varSum / width;
}

/** Deskew search within [-maxDeg..+maxDeg] */
async function deskew(img: Jimp, maxDeg: number) {
  const base = img.clone();
  let bestScore = -1, bestAngle = 0;
  const step = 0.5;
  const start = -Math.abs(maxDeg);
  const end = Math.abs(maxDeg);
  for (let a = start; a <= end; a += step) {
    const rotated = base.clone().rotate(a, false);
    const s = scoreVerticalProjection(rotated);
    if (s > bestScore) {
      bestScore = s;
      bestAngle = a;
    }
  }
  if (bestAngle !== 0) {
    img.rotate(bestAngle, false);
  }
}

/** Main entry: preprocess a PNG buffer according to opts or env defaults */
export async function preprocessImageBuffer(buf: Buffer, opts: PreprocessOpts = {}): Promise<Buffer> {
  const defaults = getPreprocessOptsFromEnv();
  const effective: PreprocessOpts = {
    ...defaults,
    ...opts,
  };

  const img = await Jimp.read(buf);

  toGray(img);

  if (effective.blurRadius && effective.blurRadius > 0) {
    blur(img, effective.blurRadius);
  }

  if (effective.deskew) {
    await deskew(img, Math.max(0, effective.maxSkewDeg ?? 0));
  }

  if (effective.binarize) {
    await binarize(img, effective.binThreshold ?? null);
  }

  if (effective.invert) {
    img.invert();
  }

  return await img.getBufferAsync(Jimp.MIME_PNG);
}
