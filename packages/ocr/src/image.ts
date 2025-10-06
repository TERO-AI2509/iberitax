import { preprocessImageBuffer, type PreprocessOpts } from "./preprocess.js";
import { createWorker } from "tesseract.js";

export type OcrOptions = {
  lang?: string;
  pre?: PreprocessOpts;
};

export async function ocrImageBuffer(input: Buffer, opts: OcrOptions = {}) {
  const lang = opts.lang || "spa";
  const pre = await preprocessImageBuffer(input, {
    deskew: true,
    binarize: true,
    blurRadius: 1,
    ...(opts.pre || {}),
  });
  const worker = await createWorker(lang);
  try {
    const { data } = await worker.recognize(pre);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
