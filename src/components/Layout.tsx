import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuth } from '../store/useAuth'

interface LayoutProps {
  role: 'admin' | 'mahasiswa'
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
  showBack?: boolean
}

export function Layout({ role, title, subtitle, children, actions, showBack }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Role protection
    if (role === 'admin' && user.role !== 'admin') {
      navigate('/') // Mahasiswa trying to access admin
    } else if (role === 'mahasiswa' && user.role === 'admin') {
      navigate('/admin') // Admin trying to access mahasiswa
    }
  }, [user, navigate, role])

  if (!user) return null

  const mahasiswaNav = [
    { label: 'Beranda', icon: 'grid_view', path: '/' },
    { label: 'Presensi', icon: 'location_on', path: '/presensi' },
    { label: 'Aktivitas', icon: 'assignment', path: '/aktivitas' },
    { label: 'Profil', icon: 'person', path: '/profil' },
  ]

  const adminNav = [
    { label: 'Dasbor', icon: 'dashboard', path: '/admin' },
    { label: 'Mahasiswa', icon: 'school', path: '/admin/direktori' },
    { label: 'Approval', icon: 'assignment_turned_in', path: '/admin/penugasan' },
    { label: 'Presensi', icon: 'location_on', path: '/admin/presensi' },
  ]

  const navItems = role === 'admin' ? adminNav : mahasiswaNav

  return (
    <div className="layout is-mahasiswa">
      <Sidebar role={role} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showBack && (
              <button className="btn btn-ghost" style={{ padding: 8, minHeight: 'auto', borderRadius: '50%', background: 'var(--bg)' }} onClick={() => navigate(-1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
              </button>
            )}
            <div>
              <div className="topbar-title">{title}</div>
              {subtitle && <div className="topbar-sub">{subtitle}</div>}
            </div>
          </div>
          <div className="topbar-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {actions}
            {role === 'admin' && (
              <button 
                className="btn btn-ghost" 
                onClick={logout}
                style={{ padding: 8, minHeight: 'auto', borderRadius: '50%', background: '#fee2e2', color: '#dc2626' }}
                title="Keluar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
              </button>
            )}
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>

        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && item.path !== '/admin' && pathname.startsWith(item.path))
              return (
                <Link key={item.path} to={item.path} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
