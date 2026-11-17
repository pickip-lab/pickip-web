// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { authSession } from '../../shared/api/authSession'
import { CategoryEditorPage } from './CategoryEditorPage'

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('sends the complete chosen category set when saving', async () => {
  vi.spyOn(authSession, 'ensureToken').mockResolvedValue('test-token')
  const message = {
    id: 7, categoriesCustomized: false, categories: [{ category: 'DECISION', triggerEmoji: 'white_check_mark' }],
  }
  let savedBody = ''
  vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT') savedBody = String(init.body)
    return { ok: true, status: 200, json: async () => message } as Response
  }))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/messages/7/categories']}><Routes><Route path="/messages/:id/categories" element={<CategoryEditorPage />} /><Route path="/messages/:id" element={<div>저장 완료</div>} /></Routes></MemoryRouter></QueryClientProvider>)

  fireEvent.click(await screen.findByRole('checkbox', { name: '북마크' }))
  fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
  await waitFor(() => expect(JSON.parse(savedBody)).toEqual({ categories: ['DECISION', 'BOOKMARK'] }))
  expect(await screen.findByText('저장 완료')).toBeTruthy()
})
