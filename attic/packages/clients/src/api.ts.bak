/* IberitaxClient — lightweight fetch client with Zod validation */
import { HealthResponseSchema, ExtractionRequestSchema, ExtractionResponseSchema } from '@iberitax/validators';
import { z } from 'zod';

// Derive runtime-validated types from Zod
export type HealthResponse = import('zod').infer<typeof HealthResponseSchema>;
export type ExtractionRequest = import('zod').infer<typeof ExtractionRequestSchema>;
export type ExtractionResponse = import('zod').infer<typeof ExtractionResponseSchema>;

// Keep fetch typing Node-safe (no DOM lib requirement)
type FetchLike = (url: string, init?: any) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
}>;

export type IberitaxClientOptions = {
  baseUrl?: string;              // default http://localhost:4000
  fetchFn?: FetchLike;           // override for tests
  timeoutMs?: number;            // soft timeout per request
};

export class ApiError extends Error {
  status: number;
  url: string;
  issues?: z.ZodIssue[];
  body?: unknown;
  constructor(message: string, opts: { status: number; url: string; issues?: z.ZodIssue[]; body?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.url = opts.url;
    this.issues = opts.issues;
    this.body = opts.body;
  }
}

export class IberitaxClient {
  private baseUrl: string;
  private fetchFn: FetchLike;
  private timeoutMs: number;

  constructor(opts: IberitaxClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? 'http://localhost:4000').replace(/\/$/, '');
    const gf = (globalThis as any).fetch as FetchLike | undefined;
    this.fetchFn = (opts.fetchFn ?? gf ?? (async () => { throw new Error('global fetch not available'); })) as FetchLike;
    this.timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 15000;
  }

  /** GET /health */
  async health(): Promise<HealthResponse> {
    const res = await this.request('GET', '/health');
    const parsed = HealthResponseSchema.safeParse(res);
    if (!parsed.success) {
      throw new ApiError('Health response failed validation', {
        status: 200,
        url: this.url('/health'),
        issues: parsed.error.issues,
        body: res,
      });
    }
    return parsed.data;
  }

  /** POST /extract */
  async extract(payload: ExtractionRequest): Promise<ExtractionResponse> {
    const reqParsed = ExtractionRequestSchema.safeParse(payload);
    if (!reqParsed.success) {
      throw new ApiError('Extraction request failed validation', {
        status: 0,
        url: this.url('/extract'),
        issues: reqParsed.error.issues,
        body: payload,
      });
    }
    const res = await this.request('POST', '/extract', reqParsed.data);
    const parsed = ExtractionResponseSchema.safeParse(res);
    if (!parsed.success) {
      throw new ApiError('Extraction response failed validation', {
        status: 200,
        url: this.url('/extract'),
        issues: parsed.error.issues,
        body: res,
      });
    }
    return parsed.data;
  }

  // internals
  private url(p: string) { return this.baseUrl + p; }

  private async request(method: 'GET'|'POST'|'PUT'|'DELETE', pathname: string, body?: unknown): Promise<unknown> {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res: any = await this.fetchFn(this.url(pathname), {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      const text = await res.text();
      const data = text ? tryJson(text) : null;
      if (!res.ok) {
        throw new ApiError('HTTP error ' + res.status, { status: res.status, url: this.url(pathname), body: (data as any) ?? text });
      }
      return data as unknown;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      if (err && err.name === 'AbortError') {
        throw new ApiError('Request timed out', { status: 0, url: this.url(pathname) });
      }
      throw new ApiError(err?.message || 'Network error', { status: 0, url: this.url(pathname) });
    } finally {
      clearTimeout(to);
    }
  }
}

function tryJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}
