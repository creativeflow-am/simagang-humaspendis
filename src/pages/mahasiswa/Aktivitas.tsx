import { Layout } from '../../components/Layout'
import { Link } from 'react-router-dom'

const activities = [
  { id: 1, title: 'Menyusun Rilis Berita Menteri', date: 'Senin, 24 Mar 2025', status: 'Disetujui', category: 'Penyusunan Rilis Berita' },
  { id: 2, title: 'Desain Infografis Beasiswa', date: 'Jumat, 21 Mar 2025', status: 'Direvisi', category: 'Desain Grafis / Infografis' },
  { id: 3, title: 'Liputan Rapat Koordinasi', date: 'Kamis, 20 Mar 2025', status: 'Menunggu', category: 'Peliputan & Dokumentasi' },
]

const statusIcon: Record<string, string> = { 'Disetujui': 'task_alt', 'Menunggu': 'hourglass_empty', 'Direvisi': 'error' }
const statusColor: Record<string, string> = { 'Disetujui': '#10b981', 'Menunggu': '#9ca3af', 'Direvisi': '#f59e0b' }

export default function AktivitasMahasiswa() {
  return (
    <Layout role="mahasiswa" title="Aktivitas" subtitle="Logbook & Laporan Tugas">
      <div className="page-header">
        <div>
          <div className="page-title">Aktivitas & Laporan</div>
          <div className="page-sub">3 kegiatan dilaporkan</div>
        </div>
        <Link to="/aktivitas/tambah" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">add</span>
          Lapor Aktivitas
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activities.map(act => (
          <div key={act.id} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{act.category}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{act.title}</div>
              </div>
              <span className="material-symbols-outlined" style={{ color: statusColor[act.status], fontSize: 20 }}>
                {statusIcon[act.status]}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                  {act.date}
                </span>
              </div>
              {act.status !== 'Disetujui' && (
                <Link to="/aktivitas/tambah" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none', color: 'var(--primary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  {act.status === 'Direvisi' ? 'Perbaiki' : 'Edit'}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
