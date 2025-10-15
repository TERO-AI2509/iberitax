import { describe, it, expect } from '@jest/globals'
import { redirectCallback } from '../lib/authRedirect'
const call = (url: string, baseUrl = 'http://localhost:3000') => redirectCallback({ url, baseUrl })
describe('redirectCallback hardening', () => {
  it('allows same-origin absolute URLs', () => {
    expect(call('http://localhost:3000/account')).toBe('http://localhost:3000/account')
  })
  it('allows relative paths like /account', () => {
    expect(call('/account')).toBe('/account')
  })
  it('rejects external origins and falls back to /dashboard', () => {
    expect(call('https://evil.example/phish')).toBe('/dashboard')
    expect(call('http://127.0.0.1.evil.tld/account')).toBe('/dashboard')
  })
  it('rejects protocol-relative and data schemes', () => {
    expect(call('//evil.example/hijack')).toBe('/dashboard')
    expect(call('data:text/html;base64,PHN2Zy8+')).toBe('/dashboard')
  })
})
