import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { students } from '../store/useAuth'
import { ConfirmModal } from '../components/ConfirmModal'
import { downloadCSV, printHTML } from '../utils/exportUtils'

// Generate list bulan dari 6 bulan lalu sampai sekarang
function generateMonthOptions() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = d.toLocaleDateString('en-CA').substring(0, 7) // YYYY-MM
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }
  return months
}
const monthOptions = generateMonthOptions()
const currentMonth = new Date().toLocaleDateString('en-CA').substring(0, 7)

export default function Penugasan() {
  const [activeTab, setActiveTab] = useState('Approval')
  const [activeAction, setActiveAction] = useState<{ id: string, type: 'tolak' | 'revisi' } | null>(null)
  const [note, setNote] = useState('')
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('Semua')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  useEffect(() => {
    const q = query(collection(db, 'aktivitas'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data()
        // Format timestamp if it's a firebase timestamp
        let dateStr = 'Unknown Date'
        let rawDate = ''
        if (d.tanggal?.toDate) {
          dateStr = d.tanggal.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          rawDate = d.tanggal.toDate().toLocaleDateString('en-CA')
        } else if (typeof d.tanggal === 'string') {
          dateStr = new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          rawDate = d.tanggal
        }

        return {
          id: doc.id,
          uid_mahasiswa: d.uid_mahasiswa || '',
          name: d.nama_mahasiswa || 'Tanpa Nama',
          category: d.kategori || 'Lainnya',
          date: dateStr,
          rawDate: rawDate,
          desc: d.deskripsi || '',
          status: d.status || 'Menunggu',
          link: d.bukti_url || '#'
        }
      })
      setAllTasks(data)
      setLoading(false)
    }, (err) => {
      console.error("Firestore error:", err)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  const todayRaw = new Date().toLocaleDateString('en-CA')

  const displayedTasks = allTasks.filter(t => {
    if (activeTab === 'Approval') return t.status === 'Menunggu'
    if (activeTab === 'Tugas Hari Ini') return t.rawDate === todayRaw
    if (activeTab === 'Per Bulan' && !t.rawDate.startsWith(selectedMonth)) return false
    if (selectedStudent !== 'Semua' && t.uid_mahasiswa !== selectedStudent) return false
    return true
  })

  // Calculations for stats
  const countApproval = allTasks.filter(t => t.status === 'Menunggu').length
  const countHariIni = allTasks.filter(t => t.rawDate === todayRaw).length
  const countSemua = allTasks.length

  const handleExport = () => {
    const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth
    const label = activeTab === 'Per Bulan' ? selectedMonth : activeTab === 'Semua Tugas' ? 'Semua' : activeTab.replace(/ /g, '_')
    const studentLabel = selectedStudent === 'Semua' ? 'Semua_Mahasiswa' : (students.find(s => s.id === selectedStudent)?.name || selectedStudent).replace(/ /g, '_')
    const filename = `Rekapitulasi_Penugasan_${label}_${studentLabel}.csv`
    const headers = ['No', 'Nama Mahasiswa', 'Tanggal', 'Kategori', 'Deskripsi', 'Status']
    const rows = displayedTasks.map((t, i) => [
      [i + 1],
      [t.name],
      [t.date],
      [t.category],
      [t.desc],
      [t.status]
    ])
    downloadCSV(filename, headers, rows)
    toast.success('File CSV berhasil diunduh!')
  }

  const handlePrint = () => {
    const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth
    const periodLabel = activeTab === 'Per Bulan' ? monthLabel : activeTab === 'Semua Tugas' ? 'Semua Data' : activeTab
    const studentLabel = selectedStudent === 'Semua' ? 'Semua Mahasiswa' : (students.find(s => s.id === selectedStudent)?.name || '-')
    const rows = displayedTasks.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${t.name}</td>
        <td>${t.date}</td>
        <td>${t.category}</td>
        <td>${t.desc}</td>
        <td><span class="badge ${t.status === 'Disetujui' || t.status === 'ACC' ? 'badge-green' : t.status === 'Menunggu' ? 'badge-orange' : 'badge-red'}">${t.status}</span></td>
      </tr>`).join('')

    printHTML('Rekapitulasi Laporan Penugasan', `
      <div class="header">
        <h1>REKAPITULASI LAPORAN PENUGASAN MAGANG</h1>
        <p>Humas Ditjen Pendis Kementerian Agama RI</p>
      </div>
      <div class="meta">
        <div><strong>Filter Periode:</strong> ${periodLabel}</div>
        <div><strong>Mahasiswa:</strong> ${studentLabel}</div>
        <div><strong>Menunggu Approval:</strong> ${countApproval}</div>
        <div><strong>Tugas Hari Ini:</strong> ${countHariIni}</div>
        <div><strong>Total Semua:</strong> ${countSemua}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th><th>Nama Mahasiswa</th><th>Tanggal</th>
            <th>Kategori</th><th>Deskripsi</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center">Tidak ada data</td></tr>'}</tbody>
      </table>`)
  }

  const handleSubmitAction = async (id: string, type: string) => {
    try {
      const taskRef = doc(db, 'aktivitas', id)
      await updateDoc(taskRef, {
        status: type === 'tolak' ? 'Ditolak' : 'Direvisi',
        catatan_admin: note
      })
      toast.success(`Laporan berhasil di${type === 'tolak' ? 'tolak' : 'kembalikan untuk revisi'} dengan catatan!`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal memperbarui status laporan')
    }
    setActiveAction(null)
    setNote('')
  }

  const handleAcc = async (id: string) => {
    try {
      const taskRef = doc(db, 'aktivitas', id)
      await updateDoc(taskRef, { status: 'Disetujui' })
      toast.success('Laporan berhasil di-ACC!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal ACC laporan')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const idToDelete = deleteId
    setDeleteId(null)
    try {
      await deleteDoc(doc(db, 'aktivitas', idToDelete))
      toast.success('Laporan berhasil dihapus')
    } catch (err) {
      console.error(err)
      toast.error('Gagal menghapus laporan')
    }
  }

  return (
    <Layout role="admin" title="Approval Tugas" subtitle="Validasi Laporan Kegiatan">
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Hapus Laporan Admin"
        message="Yakin ingin menghapus laporan ini secara permanen? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Ya, Hapus Permanen"
      />
      <div className="page-header">
        <div>
          <div className="page-title">Approval Laporan</div>
          <div className="page-sub">Menunggu verifikasi Anda</div>
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

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
          <div className="stat-label">Menunggu Approval</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>{countApproval}</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
          <div className="stat-label">Tugas Hari Ini</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{countHariIni}</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
          <div className="stat-label">Semua Tugas</div>
          <div className="stat-value">{countSemua}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="filter-tabs" style={{ margin: 0 }}>
          {['Approval', 'Tugas Hari Ini', 'Per Bulan', 'Semua Tugas'].map(t => (
            <button key={t} className={`filter-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Dropdown Bulan — hanya tampil di tab Per Bulan */}
          {activeTab === 'Per Bulan' && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="select-filter"
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}
          {/* Dropdown Mahasiswa */}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Memuat data tugas...</div>
        ) : displayedTasks.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Tidak ada data tugas untuk ditampilkan.</div>
        ) : (
          displayedTasks.map(app => (
            <div key={app.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>{app.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{app.date} • {app.category}</div>
                </div>
                <span className={`badge ${app.status === 'Disetujui' || app.status === 'ACC' ? 'badge-green' : app.status === 'Menunggu' ? 'badge-orange' : 'badge-red'}`}>{app.status}</span>
              </div>
              
              <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>
                "{app.desc}"
              </p>

              <a href={app.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                Bukti
              </a>

              {app.status === 'Menunggu' && (
                activeAction?.id === app.id ? (
                  <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: activeAction?.type === 'tolak' ? '#ef4444' : '#d97706' }}>
                      Catatan {activeAction?.type === 'tolak' ? 'Penolakan' : 'Revisi'}:
                    </div>
                    <textarea 
                      className="form-textarea" 
                      rows={3} 
                      placeholder="Masukkan alasan atau instruksi revisi..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      style={{ marginBottom: 12 }}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }} onClick={() => setActiveAction(null)}>Batal</button>
                      <button className="btn btn-primary" style={{ fontSize: 13, padding: '6px 12px' }} onClick={() => handleSubmitAction(app.id, activeAction?.type || '')}>Kirim Catatan</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      className="btn" 
                      onClick={() => setActiveAction({ id: app.id, type: 'tolak' })} 
                      style={{ flex: 1, border: '1px solid #fecaca', color: '#ef4444', background: 'transparent', justifyContent: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                      Tolak
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => setActiveAction({ id: app.id, type: 'revisi' })} 
                      style={{ flex: 1, border: '1px solid #fde68a', color: '#d97706', background: 'transparent', justifyContent: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history_edu</span>
                      Revisi
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAcc(app.id)} 
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                      ACC
                    </button>
                  </div>
                )
              )}

              {/* Admin CRUD Actions (Always visible) */}
              <div style={{ display: 'flex', gap: 12, marginTop: app.status === 'Menunggu' ? 16 : 0, paddingTop: 16, borderTop: '1px dashed var(--border)', justifyContent: 'flex-end' }}>
                <Link to={`/admin/penugasan/edit/${app.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--primary)', textDecoration: 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  Edit Admin
                </Link>
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444' }} onClick={() => setDeleteId(app.id)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                  Hapus Admin
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
