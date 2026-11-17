import { afterEach, expect, it, vi } from 'vitest'
import { AuthSession } from './authSession'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('shares one refresh request between simultaneous callers', async () => {
  const session = new AuthSession()
  let release!: (response: Response) => void
  const response = new Promise<Response>((resolve) => { release = resolve })
  const fetchMock = vi.fn(() => response)
  vi.stubGlobal('fetch', fetchMock)

  const first = session.refresh()
  const second = session.refresh()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  release({ ok: true, status: 200, json: async () => ({ accessToken: 'new-token' }) } as Response)
  expect(await Promise.all([first, second])).toEqual(['new-token', 'new-token'])
  expect(session.getSnapshot().status).toBe('authenticated')
})

it('treats a rejected refresh cookie as an anonymous session', async () => {
  const session = new AuthSession()
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401 } as Response)))
  expect(await session.refresh()).toBeNull()
  expect(session.getSnapshot().status).toBe('anonymous')
})
