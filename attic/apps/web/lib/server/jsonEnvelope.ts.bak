export type ErrorShape = { code: string; message?: string; hint?: string };
export type Envelope<T> = { data?: T; error?: ErrorShape };

function body<T>(data?: T, error?: ErrorShape): string {
  return JSON.stringify(error ? { error } : { data });
}

export function ok<T>(data: T, init?: ResponseInit): Response {
  return new Response(body(data, undefined), { status: 200, headers: { "content-type": "application/json" }, ...init });
}

export function unauthorized(message?: string, hint?: string, init?: ResponseInit): Response {
  return new Response(body(undefined, { code: "UNAUTHORIZED", message, hint }), { status: 401, headers: { "content-type": "application/json" }, ...init });
}

export function badRequest(code = "BAD_REQUEST", message?: string, hint?: string, init?: ResponseInit): Response {
  return new Response(body(undefined, { code, message, hint }), { status: 400, headers: { "content-type": "application/json" }, ...init });
}

export function envelope<T>(init: { status: number; data?: T; error?: ErrorShape; headers?: HeadersInit }): Response {
  return new Response(body(init.data, init.error), { status: init.status, headers: { "content-type": "application/json", ...(init.headers || {}) } });
}
