// packages/validators/src/index.ts  (replace existing file)
import { z } from 'zod';

// Accept the stub's { ok: true } and optional extras
export const HealthResponseSchema = z.object({
  ok: z.boolean(),
  status: z.string().optional(),
  version: z.string().optional(),
  uptimeSeconds: z.number().optional(),
});

// Request must allow url-mode with optional hint
export const ExtractionRequestSchema = z.object({
  source: z.enum(['url','upload']),
  url: z.string().url().optional(),
  hint: z.string().optional(),
}).refine(v => (v.source === 'url' ? !!v.url : true), { message: 'url is required when source=url' });

// Generic extraction result shape for smoke tests
export const ExtractionResponseSchema = z.object({
  ok: z.boolean(),
  data: z.unknown().optional(),
  errors: z.array(z.string()).optional(),
});
