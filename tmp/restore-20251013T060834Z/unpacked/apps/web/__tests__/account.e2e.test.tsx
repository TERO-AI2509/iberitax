/** @jest-environment jsdom */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { email: 'demo@example.com' },
  }),
}))

jest.mock('@/lib/auth', () => ({ authOptions: {} }), { virtual: true })
jest.mock('@/lib/server/auth', () => ({ authOptions: {} }), { virtual: true })

jest.mock('next/navigation', () => {
  const url = require('url')
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }),
    useSearchParams: () => new url.URL('http://localhost').searchParams,
    redirect: jest.fn(),
    notFound: jest.fn(),
  }
})

function mockFetchOnce(json: any, status = 200) {
  const res = new Response(JSON.stringify(json), {
    status,
    headers: { 'content-type': 'application/json' },
  })
  ;(global as any).fetch = jest.fn().mockResolvedValue(res)
  return res
}

const AccountPage = require('@/app/account/page').default

describe('Account page e2e', () => {
  beforeEach(() => {
    mockFetchOnce({
      ok: true,
      data: {
        email: 'demo@example.com',
        now: Date.now(),
        exp: Date.now() + 3600_000,
        expiringSoon: false,
      },
    })
  })

  afterEach(() => {
    ;(global as any).fetch = undefined
    jest.clearAllMocks()
  })

  it('renders Account page when logged in', async () => {
    const ui = await AccountPage({} as any)
    render(ui as any)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /account/i })).toBeInTheDocument()
    })
  })
})
