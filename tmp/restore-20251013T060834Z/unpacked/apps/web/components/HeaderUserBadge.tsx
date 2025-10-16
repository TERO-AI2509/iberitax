'use client'
import React from 'react'
import { useAuthState } from '@/lib/client/authState'

export default function HeaderUserBadge() {
  const { email, status, refresh } = useAuthState()
  if (!email) return null
  const isExpSoon = status === 'expiringSoon'
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{email}</span>
      {isExpSoon ? (
        <button onClick={refresh} className="rounded-md px-2 py-1 border">
          Refresh session
        </button>
      ) : null}
    </div>
  )
}
