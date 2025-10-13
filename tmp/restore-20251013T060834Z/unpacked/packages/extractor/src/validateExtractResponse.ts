import type { FromSchema } from "json-schema-to-ts";
import AjvCtor from "ajv";
import addFormats from "ajv-formats";
import * as ajvModule from "./ajv";
import { ExtractResponseSchema } from "./schemas/extract.schema";
import { formatAjvErrors } from "./validationError";

export type ExtractResponse = FromSchema<typeof ExtractResponseSchema>;

// Resolve a robust Ajv instance that tolerates ESM/CJS + mocks
function resolveAjv(): any {
  const mod: any = ajvModule as any;
  if (mod?.ajv?.compile && typeof mod.ajv.compile === "function") return mod.ajv;
  if (mod?.default?.compile && typeof mod.default.compile === "function") return mod.default;
  if (mod && typeof mod.compile === "function") return mod;
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

let _compiled: any | null = null;
function getValidator(): any {
  if (_compiled) return _compiled;
  const ajv = resolveAjv();
  _compiled = (ajv as any).compile(ExtractResponseSchema);
  return _compiled;
}

/**
 * validateExtractResponse: a callable that forwards to the lazily compiled validator
 * and proxies the `.errors` property for compatibility with existing tests.
 */
type ValidateFn = ((data: unknown) => boolean) & { errors?: any };
export const validateExtractResponse: ValidateFn = ((data: unknown) => {
  const v = getValidator();
  const ok = v(data);
  // Mirror the underlying validator's errors for tests that read it
  (validateExtractResponse as any).errors = v.errors;
  return ok;
}) as ValidateFn;
(validateExtractResponse as any).errors = null;

/**
 * Asserts that payload conforms to ExtractResponse.
 * Throws a human-readable message when invalid.
 */
export function assertValidExtractResponse(payload: unknown): asserts payload is ExtractResponse {
  const valid = validateExtractResponse(payload);
  if (!valid) {
    throw new Error(formatAjvErrors((validateExtractResponse as any).errors));
  }
}
