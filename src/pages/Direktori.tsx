import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { students as staticStudents } from '../store/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Direktori() {
  const [search, setSearch] = useState('')
  const [aktivitas, setAktivitas] = useState<any[]>([])
  const [presensi, setPresensi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubAkt = onSnapshot(collection(db, 'aktivitas'), snap => {
      setAktivitas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubPres = onSnapshot(collection(db, 'presensi'), snap => {
      setPresensi(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    setLoading(false)
    return () => { unsubAkt(); unsubPres() }
  }, [])

  const students = staticStudents.map(s => {
    // Calculate total ACC tasks
    const studentTasks = aktivitas.filter(a => a.uid_mahasiswa === s.id && (a.status === 'Disetujui' || a.status === 'ACC'))
    
    // Calculate total attendance
    const studentPresensi = presensi.filter(p => p.uid_mahasiswa === s.id && (p.status === 'Hadir' || p.status === 'WFO' || p.status === 'WFA'))
    
    return {
      ...s,
      university: s.university || 'UIN Sayyid Ali Rahmatullah Tulungagung',
      major: s.major || 'Komunikasi dan Penyiaran Islam',
      nim: s.nim || '12040300' + s.id.padStart(2, '0'),
      period: '1 Okt – 12 Des 2026',
      attendance: studentPresensi.length, // Total count instead of percentage
      totalKerja: studentTasks.length
    }
  })

  const filtered = students.filter(s => {
    return s.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <Layout role="admin" title="Direktori" subtitle="Peserta magang aktif">
      <div className="page-header">
        <div>
          <div className="page-title">Direktori Mahasiswa</div>
          <div className="page-sub">TA 2024/2025 · Gelombang I · {students.length} peserta</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
          <button className="btn btn-primary">
            <span className="material-symbols-outlined">person_add</span>
            Tambah
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total Aktif</div>
          <div className="stat-value">{students.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rata-rata Kehadiran</div>
          <div className="stat-value">
            {students.length > 0 ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / students.length) : 0}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Hasil Kerja ACC</div>
          <div className="stat-value">{aktivitas.filter(a => a.status === 'Disetujui' || a.status === 'ACC').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sedang Direviu</div>
          <div className="stat-value">{aktivitas.filter(a => a.status === 'Menunggu').length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="input-wrap" style={{ width: 280 }}>
          <span className="material-symbols-outlined">search</span>
          <input
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="card desktop-only" style={{ marginBottom: 16 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mahasiswa</th>
                <th>Perguruan Tinggi</th>
                <th>Kehadiran</th>
                <th>Hasil Kerja (ACC)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 24 }}>Memuat data mahasiswa...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 24 }}>Tidak ada data mahasiswa.</td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">{s.initials}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      <div>{s.university}</div>
                      <div style={{ color: 'var(--text-light)' }}>{s.major}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: s.attendance > 0 ? 'var(--primary)' : 'var(--secondary)' }}>{s.attendance} Hari</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.totalKerja} Laporan</td>
                    <td>
                      <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate('/admin/direktori/' + s.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                        Lihat Profil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive Card Grid (Mobile) */}
      <div className="mobile-only" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Memuat data mahasiswa...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Tidak ada data mahasiswa.</div>
        ) : (
          filtered.map(s => (
            <div key={s.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ... (rest of card content is identical, but wrapped in ternary) ... */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{s.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-light)' }}>school</span> 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.university}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-light)' }}>menu_book</span> 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.major}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 2 }}>Kehadiran</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: s.attendance > 0 ? 'var(--primary)' : 'var(--secondary)' }}>{s.attendance} Hari</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 2 }}>Hasil Kerja</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{s.totalKerja} Laporan</div>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => navigate('/admin/direktori/' + s.id)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span> Lihat Profil
              </button>
            </div>
          ))
        )}
      </div>

    </Layout>
  )
}
