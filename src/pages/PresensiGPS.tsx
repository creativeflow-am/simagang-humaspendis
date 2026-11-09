import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { students } from '../store/useAuth'
import { ConfirmModal } from '../components/ConfirmModal'
import { toast } from 'sonner'
import { downloadCSV, printHTML } from '../utils/exportUtils'

const statusBadge: Record<string, string> = {
  'Hadir': 'badge-green',
  'Belum': 'badge-orange',
  'WFO': 'badge-green',
  'WFA': 'badge-blue',
  'Sakit': 'badge-red',
}

const todayFormatted = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const todayStrDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format

export default function PresensiGPS() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Hari Ini')
  const [selectedStudent, setSelectedStudent] = useState('Semua')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    const idToDelete = deleteId
    setDeleteId(null)
    try {
      await deleteDoc(doc(db, 'presensi', idToDelete))
      toast.success('Data presensi berhasil dihapus')
    } catch (err) {
      console.error(err)
      toast.error('Gagal menghapus presensi')
    }
  }

  useEffect(() => {
    const q = query(collection(db, 'presensi'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data()
        
        let timeIn = '-'
        let timeOut = '-'
        
        if (d.waktu_datang?.toDate) {
          timeIn = d.waktu_datang.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        } else if (typeof d.waktu_datang === 'string') timeIn = d.waktu_datang
        
        if (d.waktu_pulang?.toDate) {
          timeOut = d.waktu_pulang.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        } else if (typeof d.waktu_pulang === 'string') timeOut = d.waktu_pulang

        return {
          id: doc.id,
          uid_mahasiswa: d.uid_mahasiswa,
          rawDateStr: d.tanggal_str || (d.waktu_datang?.toDate ? d.waktu_datang.toDate().toLocaleDateString('en-CA') : ''),
          name: d.nama_mahasiswa || 'Tanpa Nama',
          initials: (d.nama_mahasiswa || 'M').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          timeIn,
          timeOut,
          status: d.status || 'Hadir',
          gps: d.lokasi_datang ? 'Sesuai' : 'Tidak diketahui',
          lat: d.lokasi_datang?.lat,
          lng: d.lokasi_datang?.lng
        }
      })
      
      // Sort desc
      data.sort((a, b) => b.rawDateStr.localeCompare(a.rawDateStr))
      
      setRecords(data)
      setLoading(false)
    }, (err) => {
      console.error("Firestore error:", err)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  const displayedRecords = records.filter(r => {
    if (activeTab === 'Hari Ini' && r.rawDateStr !== todayStrDate) return false
    if (selectedStudent !== 'Semua' && r.uid_mahasiswa !== selectedStudent) return false
    return true
  })

  // Calculate stats based on DISPLAYED records
  const totalMasuk = displayedRecords.filter(r => r.timeIn !== '-').length
  const totalPulang = displayedRecords.filter(r => r.timeOut !== '-').length
  const totalIzin = displayedRecords.filter(r => r.status === 'Sakit' || r.status === 'Izin').length

  const handleExport = () => {
    const label = activeTab === 'Hari Ini' ? todayStrDate : 'Semua'
    const filename = `Rekapitulasi_Presensi_${label}.csv`
    const headers = ['No', 'Nama Mahasiswa', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'GPS']
    const rows = displayedRecords.map((r, i) => [
      [i + 1],
      [r.name],
      [r.rawDateStr],
      [r.timeIn],
      [r.timeOut],
      [r.status],
      [r.gps]
    ])
    downloadCSV(filename, headers, rows)
    toast.success('File CSV berhasil diunduh!')
  }

  const handlePrint = () => {
    const label = activeTab === 'Hari Ini' ? `Hari Ini (${todayStrDate})` : 'Semua Data'
    const rows = displayedRecords.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.rawDateStr}</td>
        <td>${r.timeIn}</td>
        <td>${r.timeOut}</td>
        <td><span class="badge ${r.status === 'Hadir' || r.status === 'WFO' ? 'badge-green' : r.status === 'WFA' ? 'badge-blue' : r.status === 'Sakit' || r.status === 'Izin' ? 'badge-red' : 'badge-orange'}">${r.status}</span></td>
        <td>${r.gps}</td>
      </tr>`).join('')

    printHTML('Rekapitulasi Presensi', `
      <div class="header">
        <h1>REKAPITULASI PRESENSI MAHASISWA MAGANG</h1>
        <p>Diskominfo – Bidang Humaspendis</p>
      </div>
      <div class="meta">
        <div><strong>Filter:</strong> ${label}</div>
        <div><strong>Total Masuk:</strong> ${totalMasuk}</div>
        <div><strong>Total Pulang:</strong> ${totalPulang}</div>
        <div><strong>Izin/Sakit:</strong> ${totalIzin}</div>
        <div><strong>Total Record:</strong> ${displayedRecords.length}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th><th>Nama Mahasiswa</th><th>Tanggal</th>
            <th>Jam Masuk</th><th>Jam Pulang</th><th>Status</th><th>GPS</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center">Tidak ada data</td></tr>'}</tbody>
      </table>`)
  }

  return (
    <Layout role="admin" title="Presensi" subtitle="Rekap kehadiran & GPS">
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Hapus Presensi"
        message="Yakin ingin menghapus data presensi ini? Tindakan ini tidak dapat dibatalkan dan pengguna harus absen ulang."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Ya, Hapus Data"
      />
      <div className="page-header">
        <div>
          <div className="page-title">Rekapitulasi Presensi</div>
          <div className="page-sub">{todayFormatted} · Pencatatan waktu & geolokasi</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <span className="material-symbols-outlined">print</span>
            Cetak
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20, justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-tabs" style={{ margin: 0 }}>
          {['Hari Ini', 'Semua Presensi'].map(t => (
            <button key={t} className={`filter-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative' }}>
          <select 
            value={selectedStudent} 
            onChange={e => setSelectedStudent(e.target.value)}
            className="select-filter"
          >
            <option value="Semua">Semua Mahasiswa</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Absen Masuk</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{totalMasuk}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Absen Pulang</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{totalPulang}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Izin / Sakit</div>
          <div className="stat-value">{totalIzin}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Record</div>
          <div className="stat-value" style={{ color: '#64748b' }}>{displayedRecords.length}</div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="card desktop-only" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">Detail Presensi Hari Ini</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mahasiswa</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Jarak GPS</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 24 }}>Memuat data presensi...</td>
                </tr>
              ) : displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 24 }}>Tidak ada data presensi.</td>
                </tr>
              ) : (
                displayedRecords.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">{r.initials}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{r.rawDateStr}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.timeIn}</td>
                    <td style={{ fontWeight: 600 }}>{r.timeOut}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <div style={{ marginBottom: r.lat ? 6 : 0 }}>{r.gps}</div>
                      {r.lat && r.lng && (
                        <a 
                          href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>map</span> Cek Lokasi
                        </a>
                      )}
                    </td>
                    <td><span className={`badge ${statusBadge[r.status] || 'badge-gray'}`}>{r.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 8px', color: '#ef4444' }} 
                        onClick={() => setDeleteId(r.id)}
                        title="Hapus Presensi"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive List Presensi (Mobile) */}
      <div className="mobile-only" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Memuat data presensi...</div>
        ) : displayedRecords.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Tidak ada data presensi.</div>
        ) : (
          displayedRecords.map(r => (
            <div key={r.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{r.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{r.rawDateStr}</div>
                  </div>
                </div>
                <span className={`badge ${statusBadge[r.status] || 'badge-gray'}`}>{r.status}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4 }}>Jam Masuk</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{r.timeIn}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4 }}>Jam Pulang</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{r.timeOut}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
                Akurasi GPS: <strong style={{ color: 'var(--primary)' }}>{r.gps}</strong>
              </div>

              {r.lat && r.lng && (
                <a 
                  href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '8px', fontSize: 12, justifyContent: 'center', marginTop: 4 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>map</span> Cek Lokasi di Maps
                </a>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <button 
                  className="btn btn-ghost" 
                  style={{ fontSize: 13, padding: '6px 12px', color: '#ef4444' }} 
                  onClick={() => setDeleteId(r.id)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
