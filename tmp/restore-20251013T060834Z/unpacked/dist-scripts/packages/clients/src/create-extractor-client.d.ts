import type { ApiResult } from "./contracts.js";
export type ExtractRequest = {
    key: string;
};
/**
 * Minimal fetch client for the /extract endpoint.
 * - Returns ApiResult<TData> with a typed data payload.
 * - Pass your schema-derived type as the generic argument TData.
 */
export declare function createExtractorClient(opts?: {
    baseURL?: string;
    fetchImpl?: typeof fetch;
}): {
    extract: <TData = unknown>(req: ExtractRequest) => Promise<ApiResult<TData>>;
};
