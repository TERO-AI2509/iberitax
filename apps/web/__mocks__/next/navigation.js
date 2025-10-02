const url = require('url')

function useRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }
}

function useSearchParams() {
  const u = new url.URL('http://localhost')
  return u.searchParams
}

function redirect() {
}

function notFound() {
}

module.exports = { useRouter, useSearchParams, redirect, notFound }
