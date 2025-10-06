import { getPreprocessOptsFromEnv } from "./preprocess.js";
import { getPreMode } from "./pre_mode.js";
import { otsuThreshold } from "./threshold.js";
import { promises as fs } from "fs";

async function loadImageAsGrayBytes(inputPath: string): Promise<Uint8Array> {
  const buf = await fs.readFile(inputPath);
  const bytes = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) bytes[i] = buf[i] & 0xff;
  return bytes.subarray(0, Math.min(bytes.length, 1_000_000));
}

export async function getRuntimePreprocessOpts(inputPath: string) {
  const base = getPreprocessOptsFromEnv();
  const mode = getPreMode();
  if (mode === "minimal") {
    return { ...base, deskew: true, binarize: false, invert: false, blurRadius: 0 };
  }
  if (mode === "adaptive") {
    const gray = await loadImageAsGrayBytes(inputPath);
    const t = otsuThreshold(gray);
    return { ...base, binarize: true, binThreshold: t, invert: false };
  }
  return base;
}
