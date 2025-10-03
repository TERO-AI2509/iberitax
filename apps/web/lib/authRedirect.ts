export function redirectCallback(next: string | null | undefined) {
  try {
    if (!next) return '/dashboard'
    const url = new URL(next, 'http://localhost')
    const path = url.pathname + (url.search || '')
    return path.startsWith('/') ? path : '/dashboard'
  } catch {
    return '/dashboard'
  }
}
