import { Link } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { useAuth } from '../../store/useAuth'

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const logs = [
  { date: 'Senin, 24 Mar', category: 'Penyusunan Rilis Berita', status: 'Disetujui' },
  { date: 'Jumat, 21 Mar', category: 'Peliputan Lapangan', status: 'Disetujui' },
  { date: 'Kamis, 20 Mar', category: 'Notulensi Rapat', status: 'Perlu Revisi' },
]

export default function BerandaMahasiswa() {
  const { user } = useAuth()

  return (
    <Layout role="mahasiswa" title="Beranda" subtitle="Portal Mahasiswa Magang">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 4 }}>{today}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Halo, {user?.name.split(' ')[0] || 'Mahasiswa'} 👋</div>
        </div>
      </div>

      {/* Minimalist Chart */}
      <div className="card" style={{ marginBottom: 16, padding: '16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Tren Aktivitas Mingguan</div>
        <div className="chart-container" style={{ height: 60 }}>
          {[
            { label: 'Senin', pct: 40 },
            { label: 'Selasa', pct: 70 },
            { label: 'Rabu', pct: 100 },
            { label: 'Kamis', pct: 50 },
            { label: 'Jumat', pct: 85 }
          ].map((day, i) => (
            <div key={i} className="chart-bar-wrap">
              <div className="chart-bar" style={{ height: '100%', borderRadius: 6 }}>
                <div className="chart-bar-fill" style={{ height: `${day.pct}%`, borderRadius: 6 }}></div>
              </div>
              <div className="chart-label" style={{ fontSize: 10, marginTop: 2 }}>{day.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sasaran Kinerja (SKP) */}
      <div className="card" style={{ marginBottom: 24, padding: '16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Sasaran Kinerja (SKP) Aktif</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Penyusunan Rilis Berita', val: '12 Berita' },
            { name: 'Desain Grafis / Infografis', val: '5 Desain' },
            { name: 'Peliputan & Dokumentasi', val: '8 Liputan' },
          ].map(skp => (
            <div key={skp.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{skp.name}</div>
              <div className="badge badge-gray">{skp.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions (App Menu) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Menu Utama</div>
        <div className="card" style={{ padding: '8px 16px' }}>
          <div className="app-menu-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <Link to="/presensi" className="app-menu-item">
              <div className="app-menu-icon">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="app-menu-text">Presensi</div>
            </Link>

            <Link to="/aktivitas" className="app-menu-item">
              <div className="app-menu-icon">
                <span className="material-symbols-outlined">assignment</span>
              </div>
              <div className="app-menu-text">Aktivitas</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Aktivitas Terakhir</div>
          <Link to="/aktivitas" className="btn btn-ghost" style={{ fontSize: 12 }}>Lihat Semua</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {logs.map(log => (
            <div key={log.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{log.category}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{log.date}</div>
              </div>
              <span className={`badge ${log.status === 'Disetujui' ? 'badge-green' : 'badge-orange'}`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
