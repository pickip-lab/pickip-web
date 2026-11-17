import { useQuery } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router'
import { apiRequest } from '../shared/api/client'
import { Brand } from '../shared/ui/Brand'

type CurrentUser = { id: number; email: string | null; displayName: string | null; profileImageUrl: string | null }

const navigation = [
  { to: '/inbox', icon: '▣', label: '보관함' },
  { to: '/connections', icon: '⌁', label: '플랫폼 연결' },
  { to: '/rules', icon: '☷', label: '수집 규칙' },
]

export function AppShell() {
  const user = useQuery({ queryKey: ['auth', 'me'], queryFn: () => apiRequest<CurrentUser>('/auth/me'), retry: false })
  const name = user.data?.displayName?.trim() || '내 정보'
  const initial = name.slice(0, 1)
  const nav = navigation.map(({ to, icon, label }) => (
    <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
      <span className="icon" aria-hidden="true">{icon}</span><span className="label">{label}</span>
    </NavLink>
  ))

  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand />
        <p className="side-kicker">WORKSPACE</p>
        <nav className="side-nav" aria-label="주 메뉴">{nav}</nav>
        <div className="side-spacer" />
        <p className="side-quote">Pick it, Keep it.<br />중요한 대화를 다시 찾기 쉽게.</p>
        <NavLink className="profile-trigger" to="/profile">
          <span className="avatar">{initial}</span><span><strong>{name}</strong><small>내 보관함</small></span>
        </NavLink>
      </aside>
      <div>
        <header className="mobile-header"><Brand /><NavLink to="/profile">내 정보</NavLink></header>
        <main className="main"><div className="content"><Outlet /></div></main>
        <nav className="bottom-nav" aria-label="주 메뉴">{nav}</nav>
      </div>
    </div>
  )
}
