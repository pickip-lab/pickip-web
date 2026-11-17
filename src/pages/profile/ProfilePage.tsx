import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { queryClient } from '../../app/queryClient'
import { authSession } from '../../shared/api/authSession'
import { apiRequest } from '../../shared/api/client'

type CurrentUser = { id: number; email: string | null; displayName: string | null; profileImageUrl: string | null }

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useQuery({ queryKey: ['auth', 'me'], queryFn: () => apiRequest<CurrentUser>('/auth/me') })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    setError('')
    try {
      await authSession.logout()
      queryClient.clear()
      navigate('/', { replace: true })
    } catch {
      setError('로그아웃을 완료하지 못했습니다. 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  return <>
    <div className="page-head"><div className="copy"><p className="eyebrow">ACCOUNT</p><h1 className="title">내 정보</h1><p className="subtitle">PICKIP 계정과 로그인 상태를 확인하세요.</p></div></div>
    <section className="card profile-card">
      {user.isPending && <p role="status">계정 정보를 불러오는 중입니다.</p>}
      {user.isError && <p role="alert">계정 정보를 불러오지 못했습니다. <button className="text-button" type="button" onClick={() => user.refetch()}>다시 시도</button></p>}
      {user.data && <dl className="facts"><dt>이름</dt><dd>{user.data.displayName || '이름 없음'}</dd><dt>이메일</dt><dd>{user.data.email || '이메일 정보 없음'}</dd></dl>}
      <button className="secondary" type="button" onClick={logout} disabled={busy}>로그아웃</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  </>
}
