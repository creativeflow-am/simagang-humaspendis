import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/useAuth'
import { toast } from 'sonner'
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { ConfirmModal } from '../../components/ConfirmModal'

const statusIcon: Record<string, string> = { 'Disetujui': 'task_alt', 'ACC': 'task_alt', 'Menunggu': 'hourglass_empty', 'Direvisi': 'error', 'Ditolak': 'cancel' }
const statusColor: Record<string, string> = { 'Disetujui': '#10b981', 'ACC': '#10b981', 'Menunggu': '#9ca3af', 'Direvisi': '#f59e0b', 'Ditolak': '#ef4444' }

export default function AktivitasMahasiswa() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const confirmDelete = (id: string) => {
    setDeleteId(id)
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
          dateStr = d.tanggal.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        } else if (typeof d.tanggal === 'string') {
          dateStr = d.tanggal
        }
        return {
          id: doc.id,
          title: d.deskripsi || 'Laporan Aktivitas',
          category: d.kategori || 'Lainnya',
          date: dateStr,
          status: d.status || 'Menunggu',
          note: d.catatan_admin || '',
          link: d.bukti_url || '',
          rawDate: d.tanggal
        }
      })
      
      // Sort in memory to avoid index errors
      data.sort((a, b) => {
        const timeA = a.rawDate?.toDate ? a.rawDate.toDate().getTime() : new Date(a.rawDate || 0).getTime()
        const timeB = b.rawDate?.toDate ? b.rawDate.toDate().getTime() : new Date(b.rawDate || 0).getTime()
        return timeB - timeA
      })

      setActivities(data)
      setLoading(false)
    }, (err) => {
      console.error("Firestore error:", err)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [user])
  return (
    <Layout role="mahasiswa" title="Aktivitas" subtitle="Logbook & Laporan Tugas">
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Hapus Laporan"
        message="Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Ya, Hapus"
      />
      <div className="page-header">
        <div>
          <div className="page-title">Aktivitas & Laporan</div>
          <div className="page-sub">{activities.length} kegiatan dilaporkan</div>
        </div>
        <Link to="/aktivitas/tambah" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">add</span>
          Lapor Aktivitas
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Memuat data aktivitas...</div>
        ) : activities.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-light)' }}>Belum ada laporan aktivitas yang di-submit.</div>
        ) : (
          activities.map(act => (
            <div key={act.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{act.category}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{act.title}</div>
                </div>
                <span className="material-symbols-outlined" style={{ color: statusColor[act.status] || '#9ca3af', fontSize: 20 }}>
                  {statusIcon[act.status] || 'hourglass_empty'}
                </span>
              </div>
              
              {act.note && act.status !== 'Disetujui' && act.status !== 'ACC' && (
                <div style={{ fontSize: 12, padding: '8px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 6, marginBottom: 12 }}>
                  <strong>Catatan Admin:</strong> {act.note}
                </div>
              )}

              {act.link && act.link.startsWith('http') && (
                <a href={act.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8, background: 'var(--bg)', padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                  Bukti
                </a>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                    {act.date}
                  </span>
                </div>
                {act.status !== 'Disetujui' && act.status !== 'ACC' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444' }} onClick={() => confirmDelete(act.id)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                      Hapus
                    </button>
                    <Link to={`/aktivitas/edit/${act.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none', color: 'var(--primary)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                      {act.status === 'Direvisi' ? 'Perbaiki' : 'Edit'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
