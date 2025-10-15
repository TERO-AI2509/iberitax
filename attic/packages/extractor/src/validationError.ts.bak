import type { ErrorObject } from "ajv";

/**
 * Formats Ajv errors into a single human-readable string like:
 * "Invalid ExtractResponse: /data is invalid; /data/items/0/id must be string"
 */
export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return "Invalid ExtractResponse: /data is invalid";
  }

  const parts = errors.map(err => {
    const p = err.instancePath && err.instancePath.length > 0 ? err.instancePath : "";
    const jsonPointer = `/data${p}`;
    const message = err.message || "is invalid";
    // Avoid noisy "[keyword]" suffixes to keep messages stable for tests
    return `${jsonPointer} ${message}`;
  });

  return `Invalid ExtractResponse: ${parts.join("; ")}`;
}
