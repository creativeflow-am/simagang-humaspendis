import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { students as staticStudents } from '../store/useAuth'

export default function DirektoriDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [aktivitas, setAktivitas] = useState<any[]>([])
  const [presensi, setPresensi] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'laporan' | 'presensi'>('laporan')

  useEffect(() => {
    if (!id) return
    const unsubAkt = onSnapshot(query(collection(db, 'aktivitas'), where('uid_mahasiswa', '==', id)), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      arr.sort((a, b) => {
        const tA = a.tanggal?.toDate ? a.tanggal.toDate().getTime() : new Date(a.tanggal || 0).getTime()
        const tB = b.tanggal?.toDate ? b.tanggal.toDate().getTime() : new Date(b.tanggal || 0).getTime()
        return tB - tA
      })
      setAktivitas(arr)
    })
    
    const unsubPres = onSnapshot(query(collection(db, 'presensi'), where('uid_mahasiswa', '==', id)), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      arr.sort((a, b) => {
        const tA = a.waktu_datang?.toDate ? a.waktu_datang.toDate().getTime() : new Date(a.waktu_datang || 0).getTime()
        const tB = b.waktu_datang?.toDate ? b.waktu_datang.toDate().getTime() : new Date(b.waktu_datang || 0).getTime()
        return tB - tA
      })
      setPresensi(arr)
    })
    
    return () => { unsubAkt(); unsubPres() }
  }, [id])

  const student = staticStudents.find(s => s.id === id)

  if (!student) {
    return (
      <Layout role="admin" title="Detail Mahasiswa" showBack>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Mahasiswa tidak ditemukan.</div>
      </Layout>
    )
  }

  const attendanceCount = presensi.filter(p => p.status === 'Hadir' || p.status === 'WFO' || p.status === 'WFA').length
  const accCount = aktivitas.filter(a => a.status === 'Disetujui' || a.status === 'ACC').length

  const initials = (student.name || 'M').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <Layout role="admin" title="Profil Mahasiswa" subtitle="Rincian hasil magang" showBack>
      <div className="card" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{student.name}</div>
            <div style={{ color: 'var(--text-light)', fontSize: 13, marginTop: 4 }}>UIN Sayyid Ali Rahmatullah Tulungagung • Komunikasi dan Penyiaran Islam</div>
          </div>
          <span className="badge badge-green" style={{ alignSelf: 'flex-start' }}>Aktif</span>
        </div>

        <div className="stats-grid" style={{ marginBottom: 0 }}>
          <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
            <div className="stat-label">Total Kehadiran</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{attendanceCount} <span style={{fontSize: 14, fontWeight: 500, color: 'var(--text-light)'}}>Hari</span></div>
          </div>
          <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
            <div className="stat-label">Total Tugas Selesai</div>
            <div className="stat-value">{accCount} <span style={{fontSize: 14, fontWeight: 500, color: 'var(--text-light)'}}>Laporan</span></div>
          </div>
          <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
            <div className="stat-label">Sedang Direviu</div>
            <div className="stat-value" style={{ color: 'var(--secondary)' }}>{aktivitas.filter(a => a.status === 'Menunggu').length}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', overflowX: 'auto', paddingBottom: 8 }}>
        <button 
          className={`btn ${activeTab === 'laporan' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('laporan')}
          style={{ whiteSpace: 'nowrap' }}
        >
          Riwayat Laporan ({aktivitas.length})
        </button>
        <button 
          className={`btn ${activeTab === 'presensi' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('presensi')}
          style={{ whiteSpace: 'nowrap' }}
        >
          Riwayat Presensi ({presensi.length})
        </button>
      </div>

      {activeTab === 'laporan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {aktivitas.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Belum ada laporan yang dikirim.</div>
          ) : (
            aktivitas.map(act => (
              <div key={act.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{act.kategori}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{act.tanggal?.toDate ? act.tanggal.toDate().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) : act.tanggal}</div>
                  </div>
                  <span className={`badge ${act.status === 'Disetujui' || act.status === 'ACC' ? 'badge-green' : act.status === 'Menunggu' ? 'badge-orange' : 'badge-red'}`}>{act.status}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', background: 'var(--background)', padding: 12, borderRadius: 8 }}>
                  {act.deskripsi}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {act.bukti_url && act.bukti_url.startsWith('http') ? (
                    <a href={act.bukti_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span> Lihat Bukti
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Tidak ada link bukti</span>
                  )}
                  {act.catatan_admin && (
                    <div style={{ fontSize: 12, color: '#b45309', background: '#fffbeb', padding: '4px 8px', borderRadius: 4 }}>
                      Catatan: {act.catatan_admin}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'presensi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {presensi.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Belum ada riwayat kehadiran.</div>
          ) : (
            presensi.map(p => (
              <div key={p.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                    {p.waktu_datang?.toDate ? p.waktu_datang.toDate().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : p.tanggal_str}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>login</span>
                      Masuk: {p.waktu_datang?.toDate ? p.waktu_datang.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : (p.timeIn || '-')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                      Pulang: {p.waktu_pulang?.toDate ? p.waktu_pulang.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : (p.timeOut || '-')}
                    </div>
                  </div>
                </div>
                <span className={`badge ${p.status === 'Hadir' || p.status === 'WFO' ? 'badge-green' : p.status === 'WFA' ? 'badge-blue' : 'badge-red'}`}>{p.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  )
}
