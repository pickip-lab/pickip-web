import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { authSession } from '../shared/api/authSession'
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage'
import { StartPage } from '../pages/start/StartPage'
import { WelcomePage } from '../pages/welcome/WelcomePage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { AppShell } from './AppShell'
import { RequireAuth } from './RequireAuth'

function FeaturePlaceholder({ title }: { title: string }) {
  return <><div className="page-head"><div className="copy"><p className="eyebrow">PICKIP</p><h1 className="title">{title}</h1></div></div><div className="card empty-card"><p>화면을 준비하고 있습니다.</p></div></>
}

export function App() {
  const location = useLocation()
  useEffect(() => {
    if (location.pathname !== '/auth/callback') void authSession.restore()
  }, [location.pathname])

  return <Routes>
    <Route path="/" element={<StartPage />} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />
    <Route element={<RequireAuth />}>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route element={<AppShell />}>
        <Route path="/inbox" element={<FeaturePlaceholder title="보관함" />} />
        <Route path="/connections" element={<FeaturePlaceholder title="플랫폼 연결" />} />
        <Route path="/rules" element={<FeaturePlaceholder title="수집 규칙" />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/inbox" replace />} />
  </Routes>
}
