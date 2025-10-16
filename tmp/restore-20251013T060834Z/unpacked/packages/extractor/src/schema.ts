import { z } from "zod";

/** Source file info */
export const ZSourceFile = z.object({
  filename: z.string().min(1, "sourceFiles[].filename is required"),
  mimeType: z.string().optional(),
  pages: z.number().int().min(1).optional(),
}).passthrough();

/** Confidence block */
export const ZConfidence = z.object({
  overall: z.number().min(0).max(1),
}).passthrough();

/** Modelo 100 payload — keep permissive to avoid breaking happy path */
export const ZModelo100 = z.object({}).passthrough();

/** Extractor payload (your current mock shape) */
export const ZExtractPayload = z.object({
  jobId: z.string().min(1, "jobId is required"),
  sourceFiles: z.array(ZSourceFile).min(1, "sourceFiles must have at least 1 item"),
  modelo100: ZModelo100.optional(),
  confidence: ZConfidence.optional(),
}).passthrough();

export type ExtractPayload = z.infer<typeof ZExtractPayload>;

/** Validate and map issues → string[] */
export function validateExtractResult(
  payload: unknown
): { ok: true; data: ExtractPayload } | { ok: false; errors: string[] } {
  const parsed = ZExtractPayload.safeParse(payload);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors = parsed.error.issues.map(i => {
    const path = i.path.length ? ` at ${i.path.join(".")}` : "";
    return `${i.message}${path}`;
  });
  return { ok: false, errors };
}
