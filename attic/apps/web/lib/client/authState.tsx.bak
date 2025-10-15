'use client'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type Status = 'ok' | 'expired' | 'offline' | 'expiringSoon'
type WhoAmI = { email: string; now: number; exp: number; thresholdSeconds: number; expiringSoon: boolean }
type Envelope<T> = { ok: true, data: T } | { ok: false, error: { code: string, message: string, hint?: string } }
type GoTo = (url: string) => void

type AuthCtx = { status: Status; email: string | null; refresh: () => Promise<void>; setGoTo: (fn: GoTo) => void }
const Ctx = createContext<AuthCtx | null>(null)

async function fetchWhoAmI(query?: string): Promise<Envelope<WhoAmI>> {
  const res = await fetch(`/api/private/whoami${query ? '?' + query : ''}`, { credentials: 'include' })
  return res.json()
}

async function postRefresh(): Promise<Envelope<WhoAmI>> {
  const res = await fetch('/api/private/refresh', { method: 'POST', credentials: 'include' })
  return res.json()
}

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('ok')
  const [email, setEmail] = useState<string | null>(null)
  const gotoRef = useRef<GoTo>(() => {})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastExpRef = useRef<number>(0)
  const [booted, setBooted] = useState(false)

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }

  const scheduleCheck = useCallback((now: number, exp: number, threshold: number) => {
    clearTimer()
    lastExpRef.current = exp
    const ms = Math.max(0, (exp - threshold - now) * 1000)
    timerRef.current = setTimeout(() => { setStatus(s => s === 'ok' ? 'expiringSoon' : s) }, ms)
  }, [])

  const boot = useCallback(async () => {
    try {
      const env = await fetchWhoAmI()
      if (!env.ok) { setStatus(env.error.code === 'UNAUTHORIZED' ? 'expired' : 'offline'); setEmail(null); setBooted(true); return }
      setEmail(env.data.email)
      setStatus(env.data.expiringSoon ? 'expiringSoon' : 'ok')
      scheduleCheck(env.data.now, env.data.exp, env.data.thresholdSeconds)
      setBooted(true)
    } catch { setStatus('offline'); setEmail(null); setBooted(true) }
  }, [scheduleCheck])

  useEffect(() => { boot(); return () => clearTimer() }, [boot])

  const refresh = useCallback(async () => {
    try {
      const refreshed = await postRefresh()
      if (!refreshed.ok) { setStatus(refreshed.error.code === 'UNAUTHORIZED' ? 'expired' : 'offline'); setEmail(null); return }
      setEmail(refreshed.data.email)
      setStatus(refreshed.data.expiringSoon ? 'expiringSoon' : 'ok')
      if (refreshed.data.exp !== lastExpRef.current) {
        scheduleCheck(refreshed.data.now, refreshed.data.exp, refreshed.data.thresholdSeconds)
      }
      const env = await fetchWhoAmI()
      if (env.ok) {
        setEmail(env.data.email)
        setStatus(env.data.expiringSoon ? 'expiringSoon' : 'ok')
        if (env.data.exp !== lastExpRef.current) scheduleCheck(env.data.now, env.data.exp, env.data.thresholdSeconds)
      }
    } catch { setStatus('offline') }
  }, [scheduleCheck])

  const value = useMemo<AuthCtx>(() => ({ status, email, refresh, setGoTo: (fn: GoTo) => { gotoRef.current = fn } }), [status, email, refresh])

  if (!booted) return null
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuthState() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuthState must be used within AuthStateProvider')
  return ctx
}
