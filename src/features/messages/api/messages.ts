import { apiRequest, jsonBody } from '../../../shared/api/client'
import type { Provider } from '../../connections/api/connections'
import type { Category } from '../../rules/api/rules'

export type MessageCategory = { category: Category; triggerEmoji: string | null }
export type CapturedMessage = {
  id: number
  connectionId: number
  provider: Provider
  workspaceId: string
  workspaceName: string | null
  channelId: string
  channelName: string | null
  messageId: string
  messageText: string
  authorId: string | null
  authorName: string | null
  permalink: string | null
  messageCreatedAt: string
  capturedAt: string
  categoriesCustomized: boolean
  categories: MessageCategory[]
  captureTriggers: MessageCategory[]
}
export type MessagePage = { items: CapturedMessage[]; nextCursor: string | null }
export type MessageFilters = { category?: Category; provider?: Provider }

export function listMessages(filters: MessageFilters, cursor?: string) {
  const query = new URLSearchParams({ size: '20' })
  if (filters.category) query.set('category', filters.category)
  if (filters.provider) query.set('provider', filters.provider)
  if (cursor) query.set('cursor', cursor)
  return apiRequest<MessagePage>(`/messages?${query}`)
}
export const getMessage = (id: number) => apiRequest<CapturedMessage>(`/messages/${id}`)
export const updateCategories = (id: number, categories: Category[]) => apiRequest<CapturedMessage>(`/messages/${id}/categories`, { method: 'PUT', ...jsonBody({ categories }) })
export const resetCategories = (id: number) => apiRequest<CapturedMessage>(`/messages/${id}/categories`, { method: 'DELETE' })
export const deleteMessage = (id: number) => apiRequest<void>(`/messages/${id}`, { method: 'DELETE' })

export function safeExternalUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch { return null }
}
