/* IberitaxClient — lightweight fetch client with Zod validation */
import { HealthResponseSchema, ExtractionRequestSchema, ExtractionResponseSchema } from '@iberitax/validators';
export class ApiError extends Error {
    constructor(message, opts) {
        super(message);
        this.name = 'ApiError';
        this.status = opts.status;
        this.url = opts.url;
        this.issues = opts.issues;
        this.body = opts.body;
    }
}
export class IberitaxClient {
    constructor(opts = {}) {
        this.baseUrl = (opts.baseUrl ?? 'http://localhost:4000').replace(/\/$/, '');
        const gf = globalThis.fetch;
        this.fetchFn = (opts.fetchFn ?? gf ?? (async () => { throw new Error('global fetch not available'); }));
        this.timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 15000;
    }
    /** GET /health */
    async health() {
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
    async extract(payload) {
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
    url(p) { return this.baseUrl + p; }
    async request(method, pathname, body) {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), this.timeoutMs);
        try {
            const res = await this.fetchFn(this.url(pathname), {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined,
                signal: ctrl.signal,
            });
            const text = await res.text();
            const data = text ? tryJson(text) : null;
            if (!res.ok) {
                throw new ApiError('HTTP error ' + res.status, { status: res.status, url: this.url(pathname), body: data ?? text });
            }
            return data;
        }
        catch (err) {
            if (err instanceof ApiError)
                throw err;
            if (err && err.name === 'AbortError') {
                throw new ApiError('Request timed out', { status: 0, url: this.url(pathname) });
            }
            throw new ApiError(err?.message || 'Network error', { status: 0, url: this.url(pathname) });
        }
        finally {
            clearTimeout(to);
        }
    }
}
function tryJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
