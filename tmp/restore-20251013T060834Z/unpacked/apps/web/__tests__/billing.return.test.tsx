import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'

jest.mock('next-auth', () => ({ __esModule: true, getServerSession: jest.fn(async () => null) }))
jest.mock('next-auth/react', () => {
  const actual = jest.requireActual('next-auth/react')
  return { __esModule: true, ...actual, useSession: () => ({ data: null, status: 'unauthenticated' }) }
})

import BillingPage from '../app/billing/page'

describe('BillingPage return banners (current UI)', () => {
  it('renders billing page for stripe=success', async () => {
    const ui = await BillingPage({ searchParams: { stripe: 'success', session_id: 'sess_123' } } as any)
    render(ui as any)
    expect(screen.getByText(/Billing/i)).toBeInTheDocument()
    expect(screen.getByText(/Plan:/i)).toBeInTheDocument()
  })
  it('renders billing page for stripe=cancelled', async () => {
    const ui = await BillingPage({ searchParams: { stripe: 'cancelled', reason: 'user_canceled' } } as any)
    render(ui as any)
    expect(screen.getByText(/Billing/i)).toBeInTheDocument()
    expect(screen.getByText(/Plan:/i)).toBeInTheDocument()
  })
})
