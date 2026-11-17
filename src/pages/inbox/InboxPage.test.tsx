// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { authSession } from '../../shared/api/authSession'
import { InboxPage } from './InboxPage'

const first = {
  id: 1, connectionId: 10, provider: 'SLACK', workspaceId: 'T1', workspaceName: 'Team',
  channelId: 'C1', channelName: 'product', messageId: '123', messageText: '첫 번째 메시지',
  authorId: 'U1', authorName: '작성자', permalink: null,
  messageCreatedAt: '2026-11-18T00:00:00Z', capturedAt: '2026-11-18T00:01:00Z',
  categoriesCustomized: false, categories: [{ category: 'DECISION', triggerEmoji: 'white_check_mark' }],
  captureTriggers: [{ category: 'DECISION', triggerEmoji: 'white_check_mark' }],
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('loads more messages and sends category filters with the access token', async () => {
  vi.spyOn(authSession, 'ensureToken').mockResolvedValue('test-access-token')
  const requests: string[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    requests.push(url)
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer test-access-token')
    const items = url.includes('cursor=next') ? [{ ...first, id: 2, messageText: '두 번째 메시지' }] : [first]
    return { ok: true, status: 200, json: async () => ({ items, nextCursor: url.includes('cursor=') || url.includes('category=') ? null : 'next' }) } as Response
  })
  vi.stubGlobal('fetch', fetchMock)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter><InboxPage /></MemoryRouter></QueryClientProvider>)

  expect(await screen.findByRole('button', { name: 'Slack, 첫 번째 메시지' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '더 보기' }))
  expect(await screen.findByRole('button', { name: 'Slack, 두 번째 메시지' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '결정' }))
  await waitFor(() => expect(requests.some((url) => url.includes('category=DECISION'))).toBe(true))
})
