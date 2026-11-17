import { Navigate, Outlet } from 'react-router'
import { authSession } from '../shared/api/authSession'
import { useSession } from '../features/auth/model/useSession'

export function RequireAuth() {
  const { status } = useSession()
  if (status === 'loading') return <div className="route-status" role="status">로그인 상태를 확인하고 있어요.</div>
  if (status === 'error') return (
    <div className="route-status" role="alert">
      <p>서버에 연결할 수 없습니다.</p>
      <button className="secondary" type="button" onClick={() => authSession.restore()}>다시 시도</button>
    </div>
  )
  if (status === 'anonymous') return <Navigate to="/" replace />
  return <Outlet />
}
