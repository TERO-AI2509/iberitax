// packages/clients/src/create-extractor-client.ts
import type { ApiResult } from "./contracts.js";

export type ExtractRequest = { key: string };

/**
 * Minimal fetch client for the /extract endpoint.
 * - Returns ApiResult<TData> with a typed data payload.
 * - Pass your schema-derived type as the generic argument TData.
 */
export function createExtractorClient(opts?: { baseURL?: string; fetchImpl?: typeof fetch }) {
  const baseURL = opts?.baseURL ?? "http://localhost:4000";
  const $fetch: typeof fetch = opts?.fetchImpl ?? (globalThis as any).fetch;

  if (!$fetch) throw new Error("No fetch available. Use Node >=18 or pass fetchImpl.");

  async function extract<TData = unknown>(req: ExtractRequest): Promise<ApiResult<TData>> {
    const res = await $fetch(`${baseURL}/extract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });

    let json: any = null;
    try { json = await res.json(); } catch {}

    // If server uses our ApiResult envelope, prefer it; otherwise normalize.
    if (json && typeof json.ok === "boolean") {
      return json as ApiResult<TData>;
    }

    if (!res.ok) {
      return {
        ok: false,
        errors: [{ code: String(res.status), message: res.statusText }],
      };
    }

    // Fallback: success HTTP without ApiResult envelope
    return { ok: true, data: (json ?? {}) as TData };
  }

  return { extract };
}
