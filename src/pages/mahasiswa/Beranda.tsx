import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { useAuth } from '../../store/useAuth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export default function BerandaMahasiswa() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'aktivitas'),
      where('uid_mahasiswa', '==', user.id || '1')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data()
        let dateStr = 'Unknown Date'
        if (d.tanggal?.toDate) {
          dateStr = d.tanggal.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        } else if (typeof d.tanggal === 'string') {
          dateStr = d.tanggal
        }
        return {
          id: doc.id,
          category: d.kategori || 'Lainnya',
          date: dateStr,
          status: d.status || 'Menunggu',
          note: d.catatan_admin || '',
          rawDate: d.tanggal
        }
      })
      // Sort in memory to avoid Firestore index requirement
      data.sort((a, b) => {
        const timeA = a.rawDate?.toDate ? a.rawDate.toDate().getTime() : new Date(a.rawDate || 0).getTime()
        const timeB = b.rawDate?.toDate ? b.rawDate.toDate().getTime() : new Date(b.rawDate || 0).getTime()
        return timeB - timeA
      })
      
      setLogs(data)
      setLoading(false)
    }, (err) => {
      console.error("Firestore error:", err)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [user])

  const accLogs = logs.filter(l => l.status === 'Disetujui' || l.status === 'ACC')
  const totalAcc = accLogs.length
  const cat1 = accLogs.filter(a => a.category === 'Penyusunan berita media daring').length
  const cat2 = accLogs.filter(a => a.category === 'Pelaksanaan peliputan lembaga').length
  const cat3 = accLogs.filter(a => a.category === 'Pengolahan konten media').length
  const getPct = (val: number) => totalAcc === 0 ? 0 : Math.round((val / totalAcc) * 100)

  // Chart calculation
  const dayCounts = [0, 0, 0, 0, 0] // Sen, Sel, Rab, Kam, Jum
  logs.forEach(l => {
    const date = l.rawDate?.toDate ? l.rawDate.toDate() : new Date(l.rawDate || 0)
    const day = date.getDay()
    if (day >= 1 && day <= 5) dayCounts[day - 1]++
  })
  const maxCount = Math.max(...dayCounts, 1)

  return (
    <Layout role="mahasiswa" title="Beranda" subtitle="Portal Mahasiswa Magang">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 4 }}>{today}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Halo, {user?.name?.split(' ')[0] || 'Mahasiswa'} 👋</div>
        </div>
      </div>

      {/* Revision Notification Alert */}
      {logs.filter(log => log.status === 'Direvisi' || log.status === 'Perlu Revisi').length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: 24 }}>warning</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
              Anda memiliki {logs.filter(log => log.status === 'Direvisi' || log.status === 'Perlu Revisi').length} laporan yang perlu direvisi
            </div>
            <div style={{ fontSize: 13, color: '#b45309', marginBottom: 8, lineHeight: 1.4 }}>
              <strong>Catatan Admin:</strong> "{logs.find(log => log.status === 'Direvisi' || log.status === 'Perlu Revisi')?.note || 'Silakan perbaiki sesuai instruksi admin.'}"
            </div>
            <Link to="/aktivitas" className="btn btn-secondary" style={{ background: 'white', color: '#b45309', border: '1px solid #fcd34d', fontSize: 12, padding: '4px 12px' }}>
              Perbaiki Laporan
            </Link>
          </div>
        </div>
      )}

      {/* Minimalist Chart */}
      <div className="card" style={{ marginBottom: 16, padding: '16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Tren Aktivitas Mingguan</div>
        <div className="chart-container" style={{ height: 60 }}>
          {[
            { label: 'Senin', pct: (dayCounts[0] / maxCount) * 100 },
            { label: 'Selasa', pct: (dayCounts[1] / maxCount) * 100 },
            { label: 'Rabu', pct: (dayCounts[2] / maxCount) * 100 },
            { label: 'Kamis', pct: (dayCounts[3] / maxCount) * 100 },
            { label: 'Jumat', pct: (dayCounts[4] / maxCount) * 100 }
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

      {/* Chart Donat & Sasaran Kinerja (SKP) */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Distribusi Sasaran Kinerja</div>
        
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
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{totalAcc}</span>
              <span style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 4 }}>Kegiatan</span>
            </div>
          </div>

          {/* Legend / SKP List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Penyusunan berita media daring</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{getPct(cat1)}%</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Pelaksanaan peliputan lembaga</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{getPct(cat2)}%</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>Pengolahan konten media</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{getPct(cat3)}%</div>
            </div>
          </div>
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
          {loading ? (
            <div style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-light)' }}>Memuat aktivitas...</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-light)' }}>Belum ada aktivitas.</div>
          ) : (
            logs.slice(0, 3).map(log => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{log.category}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{log.date}</div>
                </div>
                <span className={`badge ${log.status === 'Disetujui' || log.status === 'ACC' ? 'badge-green' : log.status === 'Menunggu' ? 'badge-orange' : 'badge-red'}`}>
                  {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
