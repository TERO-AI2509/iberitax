import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import SessionBanner from '@/components/SessionBanner'
import HeaderUserBadge from '@/components/HeaderUserBadge'

describe('expiringSoon UI actions', () => {
  it('SessionBanner exposes Refresh and Retry actions', () => {
    const calls: string[] = []
    const onRefresh = () => calls.push('refresh')
    const onRetry = () => calls.push('retry')

    render(<SessionBanner state="expiringSoon" onRefresh={onRefresh} onRetry={onRetry} />)

    fireEvent.click(screen.getByTestId('refresh-btn'))
    fireEvent.click(screen.getByTestId('retry-btn'))

    expect(calls).toEqual(['refresh', 'retry'])
  })

  it('HeaderUserBadge shows "Refresh session" and triggers refresh()', () => {
    const refreshSpy = jest.fn()
    jest.doMock('@/lib/client/authState', () => ({
      useAuthState: () => ({
        email: 'demo@example.com',
        status: 'expiringSoon',
        refresh: refreshSpy,
        setGoTo: () => {},
      }),
    }))
    // Re-require after mock
    const Badge = require('@/components/HeaderUserBadge').default
    render(<Badge />)

    fireEvent.click(screen.getByText('Refresh session'))
    expect(refreshSpy).toHaveBeenCalledTimes(1)
  })
})
