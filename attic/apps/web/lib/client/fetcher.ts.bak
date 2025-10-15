import { Envelope } from '@/lib/shared/envelope'
import { toast } from '@/lib/client/toast'
import { navigate } from '@/lib/client/navigation'

export async function clientFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(input, init)
  const env = await res.json().catch(() => null) as Envelope<T> | null

  if (!env || typeof (env as any).ok !== 'boolean') {
    return { ok: false, error: { code: 'BAD_PAYLOAD', message: 'Malformed response' } }
  }

  if (env.ok) return env

  if (res.status === 401) {
    const url = new URL(typeof input === 'string' ? input : input.toString(), window.location.href)
    const next = encodeURIComponent(window.location.pathname + window.location.search)
    navigate(`/login?reason=expired&next=${next}`)
    return env
  }

  if (env.error?.hint) toast(env.error.hint)
  return env
}
