import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { AuthStateProvider, useAuthState } from '@/lib/client/authState'

function Probe() {
  const { status, refresh } = useAuthState()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <button onClick={refresh}>refresh</button>
    </div>
  )
}

describe('refresh() calls /api/private/refresh then whoami', () => {
  const origFetch = global.fetch

  afterEach(() => {
    global.fetch = origFetch as any
    cleanup()
    jest.resetAllMocks()
  })

  it('moves from expiringSoon to ok after refresh', async () => {
    let phase: 'boot' | 'refresh' | 'whoamiAfter' = 'boot'

    global.fetch = jest.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      const now = Math.floor(Date.now() / 1000)

      if (phase === 'boot' && url.includes('/api/private/whoami')) {
        return new Response(JSON.stringify({ ok: true, data: {
          email:'demo@example.com', now, exp: now + 60, thresholdSeconds: 300, expiringSoon: true
        }}), { status: 200 })
      }

      if (url.includes('/api/private/refresh')) {
        phase = 'whoamiAfter'
        return new Response(JSON.stringify({ ok: true, data: {
          email:'demo@example.com', now, exp: now + 3600, thresholdSeconds: 300, expiringSoon: false
        }}), { status: 200 })
      }

      if (phase === 'whoamiAfter' && url.includes('/api/private/whoami')) {
        return new Response(JSON.stringify({ ok: true, data: {
          email:'demo@example.com', now, exp: now + 3600, thresholdSeconds: 300, expiringSoon: false
        }}), { status: 200 })
      }

      return new Response(JSON.stringify({ ok: false, error: { code: 'X', message: 'x' } }), { status: 500 })
    }) as any

    render(<AuthStateProvider><Probe /></AuthStateProvider>)

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('expiringSoon'))

    fireEvent.click(screen.getByText('refresh'))

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ok'))
  })
})
