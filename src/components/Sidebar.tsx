import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

const adminNav = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { label: 'Direktori', icon: 'school', path: '/admin/direktori' },
  { label: 'Penugasan', icon: 'assignment', path: '/admin/penugasan' },
  { label: 'Presensi', icon: 'location_on', path: '/admin/presensi' },
]

const mahasiswaNav = [
  { label: 'Beranda', icon: 'grid_view', path: '/' },
  { label: 'Presensi', icon: 'photo_camera', path: '/presensi' },
  { label: 'Tugas', icon: 'newspaper', path: '/tugas' },
  { label: 'Logbook', icon: 'menu_book', path: '/logbook' },
]

interface SidebarProps {
  role: 'admin' | 'mahasiswa'
}

export function Sidebar({ role }: SidebarProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const navItems = role === 'admin' ? adminNav : mahasiswaNav

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <span className="material-symbols-outlined">account_balance</span>
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">SIMAGANG</div>
          <div className="sidebar-brand-sub">Humas Pendis</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">
          {role === 'admin' ? 'Admin Humas' : 'Mahasiswa'}
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && item.path !== '/admin' && pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${isActive ? ' active' : ''}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {role === 'admin' ? 'FR' : user?.initials || 'AF'}
          </div>
          <div className="user-info">
            <div className="user-name">{role === 'admin' ? 'H. Fachrul Rozie' : user?.name || 'Ahmad Fauzi'}</div>
            <div className="user-role">{role === 'admin' ? 'Pembimbing' : 'Mahasiswa'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
