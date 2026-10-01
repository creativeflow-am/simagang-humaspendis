import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { students } from '../store/useAuth'

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const todayStrDate = new Date().toLocaleDateString('en-CA')

export default function Dashboard() {
  const navigate = useNavigate()
  
  const [aktivitas, setAktivitas] = useState<any[]>([])
  const [presensi, setPresensi] = useState<any[]>([])

  useEffect(() => {
    const unsubAkt = onSnapshot(collection(db, 'aktivitas'), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort by date descending
      arr.sort((a, b) => {
        const timeA = a.tanggal?.toDate ? a.tanggal.toDate().getTime() : new Date(a.tanggal || 0).getTime()
        const timeB = b.tanggal?.toDate ? b.tanggal.toDate().getTime() : new Date(b.tanggal || 0).getTime()
        return timeB - timeA
      })
      setAktivitas(arr)
    })
    const unsubPres = onSnapshot(collection(db, 'presensi'), snap => {
      setPresensi(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsubAkt(); unsubPres() }
  }, [])

  // Presensi stats for today
  const presensiToday = presensi.filter(p => p.tanggal_str === todayStrDate || (p.waktu_datang && new Date(p.waktu_datang.toDate ? p.waktu_datang.toDate() : p.waktu_datang).toLocaleDateString('en-CA') === todayStrDate))
  const masukCount = presensiToday.length
  const pulangCount = presensiToday.filter(p => p.waktu_pulang).length

  const waitingApproval = aktivitas.filter(a => a.status === 'Menunggu').length
  const totalLaporan = aktivitas.length
  
  const cat1 = aktivitas.filter(a => a.kategori === 'Penyusunan berita media daring').length
  const cat2 = aktivitas.filter(a => a.kategori === 'Pelaksanaan peliputan lembaga').length
  const cat3 = aktivitas.filter(a => a.kategori === 'Pengolahan konten media').length

  const recentActivity = aktivitas.slice(0, 5).map(a => {
    return {
      name: a.nama_mahasiswa || 'Mahasiswa',
      action: a.status === 'Menunggu' ? 'Submit Laporan' : a.status === 'Disetujui' ? 'Di-ACC' : 'Direvisi',
      category: a.kategori || 'Lainnya',
      time: a.tanggal?.toDate ? a.tanggal.toDate().toLocaleDateString('id-ID') : (a.tanggal || '-')
    }
  })
  return (
    <Layout role="admin" title="Dashboard" subtitle="Monitoring magang hari ini">
      {/* Date strip */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{today}</span>
          <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 12 }}>Jam Operasional: 07.30–16.00 WIB</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">
            <span className="material-symbols-outlined">download</span>
            Rekap Excel
          </button>
          <button className="btn btn-primary">
            <span className="material-symbols-outlined">print</span>
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/direktori')}>
          <div className="stat-label">Mahasiswa Aktif</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-sub">Personel terdaftar</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/presensi')}>
          <div className="stat-label">Total Absen Masuk</div>
          <div className="stat-value">{masukCount}</div>
          <div className="stat-sub">Hari ini</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/presensi')}>
          <div className="stat-label">Total Absen Pulang</div>
          <div className="stat-value">{pulangCount}</div>
          <div className="stat-sub">Hari ini</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/penugasan')}>
          <div className="stat-label">Menunggu Approval</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>{waitingApproval}</div>
          <div className="stat-sub">Laporan perlu direviu</div>
        </div>
      </div>

      {/* Chart Donat & Sasaran Kinerja (Keseluruhan) */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Distribusi Kinerja Mahasiswa (Total)</div>
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* CSS Donut Chart */}
          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            background: 'conic-gradient(var(--primary) 0% 45%, #3b82f6 45% 75%, #f59e0b 75% 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
            flexShrink: 0
          }}>
            <div style={{
              width: 95, height: 95, borderRadius: '50%', backgroundColor: 'var(--surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{totalLaporan}</span>
              <span style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 4 }}>Total Laporan</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Penyusunan berita media daring</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{cat1}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Pelaksanaan peliputan lembaga</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{cat2}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Pengolahan konten media</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{cat3}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions (App Menu) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Akses Cepat</div>
        <div className="card" style={{ padding: '8px 16px' }}>
          <div className="app-menu-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="app-menu-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/direktori')}>
              <div className="app-menu-icon">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div className="app-menu-text">Mahasiswa</div>
            </div>

            <div className="app-menu-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/penugasan')}>
              <div className="app-menu-icon">
                <span className="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <div className="app-menu-text">Approval</div>
            </div>

            <div className="app-menu-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/presensi')}>
              <div className="app-menu-icon">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="app-menu-text">Presensi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Aktivitas Terkini (Real-time)</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>Belum ada aktivitas hari ini.</div>
          ) : (
            recentActivity.map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{log.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{log.action} • {log.category}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{log.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
