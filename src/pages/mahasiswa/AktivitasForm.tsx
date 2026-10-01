import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../store/useAuth'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const categories = [
  'Analisis data informasi media & masyarakat',
  'Rancangan konferensi pers/seminar/rapat humas',
  'Pengumpulan isu publik',
  'Pengolahan konten media',
  'Penyusunan berita media daring',
  'Penyusunan naskah pidato',
  'Penulisan latar fakta (Factsheet)',
  'Pelaksanaan peliputan lembaga',
  'Siaran melalui media internal',
  'Peningkatan Kapasitas Kehumasan'
]

export default function AktivitasFormMahasiswa() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState(categories[0])
  const [desc, setDesc] = useState('')
  const [proofType, setProofType] = useState<'link' | 'file'>('link')
  const [proofLink, setProofLink] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!id)

  useEffect(() => {
    if (!id) return
    const fetchDoc = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'aktivitas', id))
        if (docSnap.exists()) {
          const d = docSnap.data()
          if (d.tanggal) setDate(d.tanggal)
          if (d.kategori) setCategory(d.kategori)
          if (d.deskripsi) setDesc(d.deskripsi)
          if (d.nama_mahasiswa) setStudentName(d.nama_mahasiswa)
          if (d.bukti_url && d.bukti_url.startsWith('http')) {
            setProofType('link')
            setProofLink(d.bukti_url)
          } else {
            setProofType('file')
          }
        }
      } catch (err) {
        console.error(err)
        toast.error('Gagal mengambil data laporan')
      }
      setFetching(false)
    }
    fetchDoc()
  }, [id])

  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL
    if (!scriptUrl) throw new Error('Google Script URL tidak dikonfigurasi')

    setUploadProgress('Membaca file...')
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(',')[1]
          setUploadProgress('Mengunggah ke Google Drive...')
          const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify({
              fileName: `${user?.name || 'mahasiswa'}_${Date.now()}_${file.name}`,
              fileData: base64,
              mimeType: file.type
            })
          })
          const result = await response.json()
          if (result.success) {
            setUploadProgress('')
            resolve(result.url)
          } else {
            throw new Error(result.error || 'Upload gagal')
          }
        } catch (err) {
          setUploadProgress('')
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Gagal membaca file'))
      reader.readAsDataURL(file)
    })
  }

  const handleSimpan = async () => {
    if (!user) {
      toast.error('Anda harus login terlebih dahulu')
      return
    }
    if (!desc.trim()) {
      toast.error('Deskripsi tidak boleh kosong')
      return
    }

    setLoading(true)
    try {
      let buktiUrl = proofType === 'link' ? proofLink : ''

      // Upload file to Google Drive if file mode
      if (proofType === 'file' && selectedFile) {
        try {
          buktiUrl = await uploadToGoogleDrive(selectedFile)
        } catch (uploadErr) {
          toast.error('Gagal mengunggah file. Coba lagi atau gunakan mode Tautan (URL).')
          setLoading(false)
          return
        }
      }

      if (id) {
        await updateDoc(doc(db, 'aktivitas', id), {
          tanggal: date,
          kategori: category,
          deskripsi: desc,
          ...(buktiUrl && { bukti_url: buktiUrl }),
          status: user.role === 'admin' ? undefined : 'Menunggu',
        })
        toast.success('Aktivitas berhasil diperbarui!')
      } else {
        await addDoc(collection(db, 'aktivitas'), {
          uid_mahasiswa: user.id || '1',
          nama_mahasiswa: user.name || 'Mahasiswa',
          tanggal: date,
          kategori: category,
          deskripsi: desc,
          bukti_url: buktiUrl,
          status: 'Menunggu',
          catatan_admin: ''
        })
        toast.success('Aktivitas berhasil dilaporkan!')
      }
      
      if (user.role === 'admin') navigate('/admin/penugasan')
      else navigate('/aktivitas')
    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan aktivitas')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Layout role={user?.role === 'admin' ? 'admin' : 'mahasiswa'} title={id ? "Edit Laporan" : "Lapor Aktivitas"} showBack={true}>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Memuat data...</div>
      </Layout>
    )
  }

  return (
    <Layout role={user?.role === 'admin' ? 'admin' : 'mahasiswa'} title={id ? "Edit Laporan" : "Lapor Aktivitas"} showBack={true}>
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Mahasiswa</label>
            <input className="form-input" value={id ? studentName : (user?.name || '')} disabled style={{ background: 'var(--bg)', color: 'var(--text-light)' }} />
          </div>

          <div>
            <label className="form-label">Tanggal Kegiatan</label>
            <div className="input-wrap">
              <span className="material-symbols-outlined">calendar_today</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={loading} />
            </div>
          </div>

          <div>
            <label className="form-label">SKP (Kategori Pekerjaan)</label>
            <div className="input-wrap">
              <span className="material-symbols-outlined">category</span>
              <select value={category} onChange={e => setCategory(e.target.value)} disabled={loading}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Deskripsi Detail</label>
            <textarea
              className="form-textarea"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Ceritakan kegiatan yang dilakukan..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Bukti Kegiatan (Laporan/Dokumentasi)</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="proof" checked={proofType === 'link'} onChange={() => setProofType('link')} disabled={loading} />
                Tautan (URL)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="proof" checked={proofType === 'file'} onChange={() => setProofType('file')} disabled={loading} />
                Unggah File
              </label>
            </div>

            {proofType === 'link' ? (
              <div className="input-wrap">
                <span className="material-symbols-outlined">link</span>
                <input type="url" placeholder="https://..." value={proofLink} onChange={e => setProofLink(e.target.value)} disabled={loading} />
              </div>
            ) : (
              <div style={{ border: '2px dashed var(--border)', padding: 20, borderRadius: 8, textAlign: 'center', background: 'var(--bg)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: selectedFile ? 'var(--primary)' : 'var(--text-light)', display: 'block', marginBottom: 8 }}>cloud_upload</span>
                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Pilih file</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>PDF, JPG, PNG (Max 5MB)</div>
                  </div>
                )}
                {uploadProgress && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 8 }}>{uploadProgress}</div>}
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={loading}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && f.size > 5 * 1024 * 1024) {
                      toast.error('Ukuran file melebihi 5MB')
                      return
                    }
                    setSelectedFile(f || null)
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="btn btn-secondary" style={{ marginTop: 12, fontSize: 12 }}>Pilih File</label>
              </div>
            )}
          </div>

        </div>
        
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleSimpan} disabled={loading}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
            {loading ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
