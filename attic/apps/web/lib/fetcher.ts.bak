export type FetchOk<T> = { ok: true; data: T }
export type FetchErr = { ok: false; error: { code: string; message: string; hint?: string } }
export type FetchResult<T> = FetchOk<T> | FetchErr

let goToImpl: (url: string) => void = (url: string) => {
  if (typeof window !== 'undefined') window.location.assign(url)
}

export function setGoTo(fn: (url: string) => void) {
  goToImpl = fn
}

export function goTo(url: string) {
  goToImpl(url)
}

function toLogin(next: string) {
  const n = encodeURIComponent(next)
  return `/login?reason=expired&next=${n}`
}

export async function clientFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<FetchResult<T>> {
  const res = await fetch(input, init)
  if (res.status === 401) {
    const path = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
    goToImpl(toLogin(path))
    throw new Error('UNAUTHORIZED_REDIRECT')
  }
  const json = await res.json() as FetchResult<T>
  if (!json.ok) throw new Error(json.error.message)
  return json
}
