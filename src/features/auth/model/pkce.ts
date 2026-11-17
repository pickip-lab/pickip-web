const VERIFIER_KEY = 'pickip.oauth.codeVerifier'

function base64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function beginKakaoLogin() {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64Url(new Uint8Array(digest))
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const redirect = new URL('/auth/callback', window.location.origin).toString()
  const authorize = new URL('/api/v1/auth/oauth/kakao/authorize', window.location.origin)
  authorize.searchParams.set('appRedirectUri', redirect)
  authorize.searchParams.set('codeChallenge', challenge)
  window.location.assign(authorize)
}

export function consumeVerifier(): string | null {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)
  return verifier
}
