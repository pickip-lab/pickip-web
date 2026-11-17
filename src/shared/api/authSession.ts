import { ApiError, errorFromResponse } from './ApiError'

type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'
type SessionSnapshot = { status: SessionStatus }
type TokenResponse = { accessToken: string; tokenType: string; accessTokenExpiresAt: string }

class AuthSession {
  private accessToken: string | null = null
  private snapshot: SessionSnapshot = { status: 'loading' }
  private listeners = new Set<() => void>()
  private refreshPromise: Promise<string | null> | null = null
  private generation = 0

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  readonly getSnapshot = () => this.snapshot

  private setStatus(status: SessionStatus) {
    if (this.snapshot.status === status) return
    this.snapshot = { status }
    this.listeners.forEach((listener) => listener())
  }

  async restore() {
    if (this.snapshot.status !== 'loading' && this.snapshot.status !== 'error') return
    try {
      await this.refresh()
    } catch {
      this.setStatus('error')
    }
  }

  getToken() {
    return this.accessToken
  }

  async ensureToken() {
    return this.accessToken ?? this.refresh()
  }

  refresh(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise
    const generation = this.generation
    this.refreshPromise = (async () => {
      const response = await fetch('/api/v1/auth/web/refresh', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
      })
      if (generation !== this.generation) return null
      if (response.status === 401) {
        this.accessToken = null
        this.setStatus('anonymous')
        return null
      }
      if (!response.ok) throw await errorFromResponse(response)
      const body: TokenResponse = await response.json()
      this.accessToken = body.accessToken
      this.setStatus('authenticated')
      return body.accessToken
    })().finally(() => { this.refreshPromise = null })
    return this.refreshPromise
  }

  async exchange(code: string, codeVerifier: string) {
    const response = await fetch('/api/v1/auth/web/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify({ code, codeVerifier }),
    })
    if (!response.ok) throw await errorFromResponse(response)
    const body: TokenResponse = await response.json()
    this.generation += 1
    this.accessToken = body.accessToken
    this.setStatus('authenticated')
  }

  async logout() {
    const response = await fetch('/api/v1/auth/web/logout', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
    })
    if (!response.ok) throw await errorFromResponse(response)
    this.generation += 1
    this.accessToken = null
    this.setStatus('anonymous')
  }

  clearAfterUnauthorized() {
    this.accessToken = null
    this.setStatus('anonymous')
  }
}

export const authSession = new AuthSession()

export function requireAuthenticated(token: string | null): string {
  if (!token) throw new ApiError(401, 'UNAUTHENTICATED', '다시 로그인해 주세요.')
  return token
}
