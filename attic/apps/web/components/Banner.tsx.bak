'use client'
import { useSearchParams } from 'next/navigation'
export default function Banner() {
  const sp = useSearchParams()
  const reason = sp.get('reason')
  if (reason !== 'expired') return null
  return (
    <div style={{ background: '#fff3cd', color: '#664d03', padding: '8px 12px', border: '1px solid #ffecb5', borderRadius: 8, margin: '8px 12px' }}>
      Session expired, please log in again.
    </div>
  )
}
