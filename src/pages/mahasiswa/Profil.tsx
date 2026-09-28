import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { useAuth } from '../../store/useAuth'

export default function ProfilMahasiswa() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <Layout role="mahasiswa" title="Profil">
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 24 }}>
        
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, marginBottom: 16, boxShadow: '0 4px 12px rgba(21, 134, 132, 0.3)' }}>
            {(user?.name || 'M').charAt(0)}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{user?.name}</div>
          <div style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 4 }}>Mahasiswa Magang Humas Pendis</div>
          <div className="badge badge-green" style={{ marginTop: 12 }}>Angkatan 2026</div>
        </div>

        {/* Menu List */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Data Diri</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>NIM & Universitas</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--text-light)' }}>chevron_right</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={toggleTheme}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Tema Tampilan</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{theme === 'dark' ? 'Gelap' : 'Terang'}</div>
              </div>
            </div>
            <div style={{ width: 40, height: 24, borderRadius: 12, background: theme === 'dark' ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: theme === 'dark' ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined">help</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Pusat Bantuan</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Hubungi Admin</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--text-light)' }}>chevron_right</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer' }} onClick={() => { logout(); window.location.href = '/login' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>Keluar (Logout)</div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
