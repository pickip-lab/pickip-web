import { authSession, requireAuthenticated } from './authSession'
import { errorFromResponse } from './ApiError'

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const request = (token: string) => {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    headers.set('Authorization', `Bearer ${token}`)
    return fetch(`/api/v1${path}`, { ...init, credentials: 'same-origin', headers })
  }

  let token = requireAuthenticated(await authSession.ensureToken())
  let response = await request(token)
  if (response.status === 401) {
    token = requireAuthenticated(await authSession.refresh())
    response = await request(token)
  }
  if (!response.ok) {
    if (response.status === 401) authSession.clearAfterUnauthorized()
    throw await errorFromResponse(response)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function jsonBody(value: unknown): Pick<RequestInit, 'body' | 'headers'> {
  return { body: JSON.stringify(value), headers: { 'Content-Type': 'application/json' } }
}
