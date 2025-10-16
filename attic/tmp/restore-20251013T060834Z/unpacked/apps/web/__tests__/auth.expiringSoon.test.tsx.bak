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

describe('AuthState expiringSoon -> refresh -> ok (no fake timers)', () => {
  const origFetch = global.fetch

  afterEach(() => {
    global.fetch = origFetch as any
    cleanup()
    jest.resetAllMocks()
  })

  it('starts expiringSoon from whoami, then refresh() returns to ok', async () => {
    global.fetch = jest.fn(async () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { email: 't@e.st', now, exp: now + 60, thresholdSeconds: 300, expiringSoon: true }
      return new Response(JSON.stringify({ ok: true, data: payload }), { status: 200 })
    }) as any

    render(<AuthStateProvider><Probe /></AuthStateProvider>)

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('expiringSoon')
    })

    ;(global.fetch as jest.Mock).mockImplementation(async () => {
      const now = Math.floor(Date.now() / 1000)
      const payload = { email: 't@e.st', now, exp: now + 3600, thresholdSeconds: 300, expiringSoon: false }
      return new Response(JSON.stringify({ ok: true, data: payload }), { status: 200 })
    })

    fireEvent.click(screen.getByText('refresh'))

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ok')
    })
  })
})
