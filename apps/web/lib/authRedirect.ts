export function redirectCallback({ url, baseUrl }: { url: string; baseUrl: string }) {
  try {
    const base = new URL(baseUrl)
    const target = new URL(url, base)
    if (target.origin === base.origin) {
      if (url.startsWith('/')) return url
      return target.toString()
    }
    return '/dashboard'
  } catch {
    return '/dashboard'
  }
}
