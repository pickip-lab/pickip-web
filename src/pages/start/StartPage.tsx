import { useState } from 'react'
import { Navigate } from 'react-router'
import { beginKakaoLogin } from '../../features/auth/model/pkce'
import { useSession } from '../../features/auth/model/useSession'
import kakaoLogin from '../../shared/assets/kakao-login.svg'
import pickipIcon from '../../shared/assets/pickip-icon.png'
import { Brand } from '../../shared/ui/Brand'

export function StartPage() {
  const { status } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (status === 'authenticated') return <Navigate to="/inbox" replace />

  async function login() {
    setBusy(true)
    setError('')
    try {
      await beginKakaoLogin()
    } catch {
      setError('로그인을 시작할 수 없습니다. 브라우저 설정을 확인하고 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <Brand />
        <div className="auth-orbit" aria-hidden="true" />
        <div className="auth-preview-card" aria-hidden="true">
          <strong># product</strong><div className="line" /><div className="line short" />
          <span className="tag">결정 · 저장됨</span>
        </div>
        <h1>흩어진 메시지,<br /><em>한곳에.</em></h1>
        <p>메신저에서 이모지로 골라 담고<br />필요할 때 바로 꺼내보세요.</p>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form">
          <img className="mini-logo" src={pickipIcon} alt="" />
          <p className="eyebrow">WELCOME TO PICKIP</p>
          <h2>중요한 대화를<br />다시 찾기 쉽게.</h2>
          <p>카카오 계정으로 간편하게 시작해 보세요.</p>
          <div className="auth-divider" />
          <button className="kakao-button" type="button" onClick={login} disabled={busy} aria-label="카카오 로그인">
            <img src={kakaoLogin} alt="카카오 로그인" />
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <p className="auth-note">처음 이용하면 카카오 로그인 후 계정이 자동으로 만들어집니다.</p>
        </div>
      </section>
    </main>
  )
}
