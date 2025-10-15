import { HealthResponseSchema, ExtractionRequestSchema, ExtractionResponseSchema } from '@iberitax/validators';
import { z } from 'zod';
export type HealthResponse = import('zod').infer<typeof HealthResponseSchema>;
export type ExtractionRequest = import('zod').infer<typeof ExtractionRequestSchema>;
export type ExtractionResponse = import('zod').infer<typeof ExtractionResponseSchema>;
type FetchLike = (url: string, init?: any) => Promise<{
    ok: boolean;
    status: number;
    text(): Promise<string>;
}>;
export type IberitaxClientOptions = {
    baseUrl?: string;
    fetchFn?: FetchLike;
    timeoutMs?: number;
};
export declare class ApiError extends Error {
    status: number;
    url: string;
    issues?: z.ZodIssue[];
    body?: unknown;
    constructor(message: string, opts: {
        status: number;
        url: string;
        issues?: z.ZodIssue[];
        body?: unknown;
    });
}
export declare class IberitaxClient {
    private baseUrl;
    private fetchFn;
    private timeoutMs;
    constructor(opts?: IberitaxClientOptions);
    /** GET /health */
    health(): Promise<HealthResponse>;
    /** POST /extract */
    extract(payload: ExtractionRequest): Promise<ExtractionResponse>;
    private url;
    private request;
}
export {};
