import { clientFetch, setGoTo } from '@/lib/fetcher'

let goToMock: jest.Mock
let restore: () => void

beforeEach(() => {
  goToMock = jest.fn()
  const prev = goToMock
  setGoTo(goToMock)
  restore = () => setGoTo((url) => {
    if (typeof window !== 'undefined') window.location.assign(url)
  })
})

afterEach(() => {
  restore()
})

function mkRes(status: number, body: any) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

test('clientFetch redirects to login on 401', async () => {
  ;(global.fetch as any) = jest.fn().mockResolvedValue(mkRes(401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'x' } }))
  try {
    await clientFetch('/api/private/demo')
  } catch {}
  expect(goToMock).toHaveBeenCalled()
  const arg = goToMock.mock.calls[0][0] as string
  expect(arg.includes('/login?reason=expired')).toBe(true)
})

test('clientFetch passes non-401 through', async () => {
  ;(global.fetch as any) = jest.fn().mockResolvedValue(mkRes(500, { ok: false, error: { code: 'X', message: 'y' } }))
  try {
    await clientFetch('/api/private/demo')
  } catch {}
  expect(goToMock).not.toHaveBeenCalled()
})
