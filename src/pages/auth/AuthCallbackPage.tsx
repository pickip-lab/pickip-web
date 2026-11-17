import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { authSession } from '../../shared/api/authSession'
import { consumeVerifier } from '../../features/auth/model/pkce'
import { Brand } from '../../shared/ui/Brand'
import pickipIcon from '../../shared/assets/pickip-icon.png'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const started = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (started.current) return
    started.current = true
    const code = new URLSearchParams(window.location.search).get('code')
    window.history.replaceState(null, '', '/auth/callback')
    const verifier = consumeVerifier()
    if (!code || !verifier) {
      queueMicrotask(() => setError('로그인 요청을 확인하지 못했습니다. 처음부터 다시 시도해 주세요.'))
      return
    }
    authSession.exchange(code, verifier)
      .then(() => navigate('/inbox', { replace: true }))
      .catch(() => setError('로그인을 완료하지 못했습니다. 처음부터 다시 시도해 주세요.'))
  }, [navigate])

  return (
    <main className="welcome-layout">
      <header className="welcome-head"><Brand /></header>
      <div className="welcome-center auth-result">
        <img className="logo-large" src={pickipIcon} alt="" />
        <p className="eyebrow">ONE MOMENT</p>
        <h1>{error ? '로그인을 완료하지 못했어요' : '로그인을 확인하고 있어요'}</h1>
        <p role={error ? 'alert' : undefined}>{error || '잠시만 기다려 주세요.'}</p>
        {error && <button type="button" className="primary" onClick={() => navigate('/', { replace: true })}>로그인으로 돌아가기</button>}
      </div>
    </main>
  )
}
