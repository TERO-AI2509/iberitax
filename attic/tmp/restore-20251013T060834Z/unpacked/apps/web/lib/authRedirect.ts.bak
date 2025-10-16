const SAFE_DEFAULT = '/dashboard'

export function redirectCallback(next?: string | null, base?: string): string {
  try {
    if (!next || typeof next !== 'string') return SAFE_DEFAULT
    if (/^(data|javascript|vbscript):/i.test(next)) return SAFE_DEFAULT
    if (/^\/\//.test(next)) return SAFE_DEFAULT

    const baseUrl = new URL(base || process.env.NEXTAUTH_URL || 'http://localhost:3000')

    if (next.startsWith('/')) {
      return next
    }

    const url = new URL(next, baseUrl)
    if (url.origin !== baseUrl.origin) return SAFE_DEFAULT

    return url.pathname + url.search
  } catch {
    return SAFE_DEFAULT
  }
}
