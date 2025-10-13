/**
 * Minimal fetch client for the /extract endpoint.
 * - Returns ApiResult<TData> with a typed data payload.
 * - Pass your schema-derived type as the generic argument TData.
 */
export function createExtractorClient(opts) {
    const baseURL = opts?.baseURL ?? "http://localhost:4000";
    const $fetch = opts?.fetchImpl ?? globalThis.fetch;
    if (!$fetch)
        throw new Error("No fetch available. Use Node >=18 or pass fetchImpl.");
    async function extract(req) {
        const res = await $fetch(`${baseURL}/extract`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(req),
        });
        let json = null;
        try {
            json = await res.json();
        }
        catch { }
        // If server uses our ApiResult envelope, prefer it; otherwise normalize.
        if (json && typeof json.ok === "boolean") {
            return json;
        }
        if (!res.ok) {
            return {
                ok: false,
                errors: [{ code: String(res.status), message: res.statusText }],
            };
        }
        // Fallback: success HTTP without ApiResult envelope
        return { ok: true, data: (json ?? {}) };
    }
    return { extract };
}
