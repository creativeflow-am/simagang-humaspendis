import { useState } from 'react'
import { Layout } from '../../components/Layout'
import { useNavigate } from 'react-router-dom'

const categories = [
  'Penyusunan Rilis Berita',
  'Pengumpulan Isu Publik',
  'Desain Grafis / Infografis',
  'Pengolahan Konten Sosial Media',
  'Penyusunan Naskah Pidato',
  'Peliputan & Dokumentasi',
  'Administrasi Kehumasan',
  'Riset Media',
  'Pengelolaan Website',
  'Penulisan Opini / Artikel'
]

export default function AktivitasFormMahasiswa() {
  const navigate = useNavigate()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState(categories[0])
  const [desc, setDesc] = useState('')
  const [proofType, setProofType] = useState<'link' | 'file'>('link')
  const [proofLink, setProofLink] = useState('')

  const handleSimpan = () => {
    alert('Aktivitas berhasil dilaporkan!')
    navigate('/aktivitas')
  }

  return (
    <Layout role="mahasiswa" title="Lapor Aktivitas" showBack={true}>
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div>
            <label className="form-label">Tanggal Kegiatan</label>
            <div className="input-wrap">
              <span className="material-symbols-outlined">calendar_today</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">SKP (Kategori Pekerjaan)</label>
            <div className="input-wrap">
              <span className="material-symbols-outlined">category</span>
              <select value={category} onChange={e => setCategory(e.target.value)}>
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
            />
          </div>

          <div>
            <label className="form-label">Bukti Kegiatan (Laporan/Dokumentasi)</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="proof" checked={proofType === 'link'} onChange={() => setProofType('link')} />
                Tautan (URL)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="proof" checked={proofType === 'file'} onChange={() => setProofType('file')} />
                Unggah File
              </label>
            </div>

            {proofType === 'link' ? (
              <div className="input-wrap">
                <span className="material-symbols-outlined">link</span>
                <input type="url" placeholder="https://..." value={proofLink} onChange={e => setProofLink(e.target.value)} />
              </div>
            ) : (
              <div style={{ border: '2px dashed var(--border)', padding: 24, borderRadius: 8, textAlign: 'center', background: 'var(--bg)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--text-light)', marginBottom: 8 }}>cloud_upload</span>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Pilih file atau tarik ke sini</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>PDF, JPG, atau PNG (Max 5MB)</div>
                <input type="file" style={{ display: 'none' }} id="file-upload" />
                <label htmlFor="file-upload" className="btn btn-secondary" style={{ marginTop: 12, fontSize: 12 }}>Jelajahi File</label>
              </div>
            )}
          </div>

        </div>
        
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleSimpan}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
            Simpan Laporan
          </button>
        </div>
      </div>
    </Layout>
  )
}
