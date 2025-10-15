export type Ok<T> = { ok: true; data: T }
export type Err = { ok: false; error: { code: string; message: string; hint?: string } }
export type Envelope<T> = Ok<T> | Err

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data }
}

export function err(code: string, message: string, hint?: string): Err {
  return { ok: false, error: { code, message, hint } }
}

export function jsonEnvelope<T>(env: Envelope<T>, init?: ResponseInit) {
  return Response.json(env, init)
}
