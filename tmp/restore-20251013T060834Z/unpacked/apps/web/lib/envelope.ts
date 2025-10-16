export type Ok<T> = { ok: true; data: T }
export type Err = { ok: false; error: { code: string; message: string; hint?: string } }
export type Envelope<T> = Ok<T> | Err

export function jsonEnvelope<T>(
  input: T | Error | { code: string; message: string; hint?: string },
  init?: ResponseInit
) {
  if (input instanceof Error) {
    const body: Err = { ok: false, error: { code: 'INTERNAL_ERROR', message: input.message } }
    return Response.json(body, { status: 500, ...init })
  }
  if (typeof input === 'object' && input !== null && 'code' in input && 'message' in input) {
    const err = input as { code: string; message: string; hint?: string }
    const body: Err = { ok: false, error: { code: err.code, message: err.message, hint: err.hint } }
    const status = (init && init.status) || 400
    return Response.json(body, { status, ...init })
  }
  const body: Ok<T> = { ok: true, data: input as T }
  return Response.json(body, { status: 200, ...init })
}

export function appError(code: string, message: string, hint?: string, status: number = 400) {
  return { code, message, hint, status }
}

export async function parseEnvelope<T>(res: Response) {
  const json = (await res.json()) as Envelope<T>
  if (!json.ok) throw Object.assign(new Error(json.error.message), { code: json.error.code, hint: json.error.hint })
  return json.data
}
