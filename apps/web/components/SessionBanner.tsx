'use client'
import React from 'react'

type BannerState = 'expired' | 'offline' | 'expiringSoon'

export default function SessionBanner({
  state,
  onRetry,
  onRefresh,
  onLogin,
}: {
  state: BannerState
  onRetry?: () => void
  onRefresh?: () => void
  onLogin?: () => void
}) {
  if (state === 'expired') {
    return (
      <div data-testid="session-banner" className="w-full bg-yellow-100 text-yellow-900 px-4 py-2 flex items-center justify-between">
        <span>Your session expired. Please log in again.</span>
        <div className="flex gap-2">
          {onLogin ? (
            <button data-testid="login-btn" className="border px-2 py-1 rounded-md" onClick={onLogin}>
              Log in
            </button>
          ) : null}
          {onRetry ? (
            <button data-testid="retry-btn" className="border px-2 py-1 rounded-md" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      </div>
    )
  }
  if (state === 'offline') {
    return (
      <div data-testid="session-banner" className="w-full bg-red-100 text-red-900 px-4 py-2 flex items-center justify-between">
        <span>You appear to be offline.</span>
        {onRetry ? (
          <button data-testid="retry-btn" className="border px-2 py-1 rounded-md" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    )
  }
  if (state === 'expiringSoon') {
    return (
      <div data-testid="session-banner" className="w-full bg-blue-100 text-blue-900 px-4 py-2 flex items-center justify-between">
        <span>Your session will expire soon.</span>
        <div className="flex gap-2">
          {onRefresh ? (
            <button data-testid="refresh-btn" className="border px-2 py-1 rounded-md" onClick={onRefresh}>
              Refresh
            </button>
          ) : null}
          {onRetry ? (
            <button data-testid="retry-btn" className="border px-2 py-1 rounded-md" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      </div>
    )
  }
  return null
}
