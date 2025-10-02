/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

jest.mock('next/navigation', () => {
  const url = require('url')
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }),
    useSearchParams: () => new url.URL('http://localhost/login?next=%2Faccount').searchParams,
    redirect: jest.fn(),
    notFound: jest.fn(),
  }
})

const mockSignIn = jest.fn()
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}))

const LoginPage = require('@/app/login/page').default

describe('/login forwards ?next=… to both Email + Google', () => {
  it('forwards callbackUrl=/account', async () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText(/you@example\.com/i)
    const submit = screen.getByRole('button', { name: /send magic link/i })

    fireEvent.change(emailInput, { target: { value: 'demo@example.com' } })
    fireEvent.click(submit)

    const [provider, args] = mockSignIn.mock.calls[0]
    expect(provider).toBe('email')
    expect(args?.callbackUrl).toBe('/account')
  })
})
