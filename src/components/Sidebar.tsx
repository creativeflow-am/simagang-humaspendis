import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

const adminNav = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { label: 'Direktori', icon: 'school', path: '/admin/direktori' },
  { label: 'Penugasan', icon: 'assignment', path: '/admin/penugasan' },
  { label: 'Presensi', icon: 'location_on', path: '/admin/presensi' },
]

const mahasiswaNav = [
  { label: 'Beranda', icon: 'grid_view', path: '/' },
  { label: 'Presensi', icon: 'location_on', path: '/presensi' },
  { label: 'Aktivitas', icon: 'assignment', path: '/aktivitas' },
  { label: 'Profil', icon: 'person', path: '/profil' },
]

interface SidebarProps {
  role: 'admin' | 'mahasiswa'
}

export function Sidebar({ role }: SidebarProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navItems = role === 'admin' ? adminNav : mahasiswaNav
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
            {user?.initials || 'AD'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-role">{role === 'admin' ? 'Admin Humas' : 'Mahasiswa'}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            marginTop: 12, 
            padding: '10px', 
            background: 'transparent', 
            border: '1px solid #fee2e2', 
            color: '#ef4444', 
            borderRadius: 8, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          Keluar
        </button>
      </div>
    </aside>
  )
}
