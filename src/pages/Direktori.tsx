import { useState } from 'react'
import { Layout } from '../components/Layout'

const students = [
  { id: 1, initials: 'DN', name: 'Devita Nurwati', nim: '11210810000045', university: 'UIN Syarif Hidayatullah Jakarta', major: 'Komunikasi Penyiaran Islam', subTeam: 'Redaksi Berita', mentor: 'H. Fachrul Rozie, M.Si', period: '13 Jan – 13 Apr 2025', attendance: 98, logbook: 34, articles: 12 },
  { id: 2, initials: 'MY', name: 'Muhammad Yusuf Zulkarnain', nim: '11210820000087', university: 'Universitas Indonesia', major: 'Ilmu Komunikasi', subTeam: 'Medsos & Desain', mentor: 'Rizki Amanda, S.Kom', period: '13 Jan – 13 Apr 2025', attendance: 100, logbook: 35, articles: 8 },
  { id: 3, initials: 'MA', name: 'Mochammad Abiyyu Dwi Nugroho', nim: '20200610000012', university: 'UIN Sunan Kalijaga Yogyakarta', major: 'Jurnalistik Islam', subTeam: 'Video & Dokumentasi', mentor: 'M. Arfi Haikal, S.I.Kom', period: '13 Jan – 13 Apr 2025', attendance: 95, logbook: 33, articles: 6 },
  { id: 4, initials: 'HF', name: 'Helfni Fahera', nim: '21020030000066', university: 'Universitas Padjadjaran', major: 'Hubungan Masyarakat', subTeam: 'Redaksi Berita', mentor: 'H. Fachrul Rozie, M.Si', period: '13 Jan – 13 Apr 2025', attendance: 97, logbook: 34, articles: 10 },
  { id: 5, initials: 'GD', name: 'Genaksa Dwiky Nugraha', nim: '20200840000091', university: 'UIN Sunan Gunung Djati', major: 'Komunikasi Massa', subTeam: 'Peliputan Lapangan', mentor: 'M. Arfi Haikal, S.I.Kom', period: '13 Jan – 13 Apr 2025', attendance: 100, logbook: 35, articles: 15 },
]

const teams = ['Semua', 'Redaksi Berita', 'Medsos & Desain', 'Video & Dokumentasi', 'Peliputan Lapangan']

export default function Direktori() {
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState('Semua')
  const [selected, setSelected] = useState<typeof students[0] | null>(null)

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nim.includes(search)
    const matchTeam = team === 'Semua' || s.subTeam === team
    return matchSearch && matchTeam
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
          <div className="stat-value">24</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rata-rata Kehadiran</div>
          <div className="stat-value">97%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Logbook Terverif</div>
          <div className="stat-value">208</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Publikasi</div>
          <div className="stat-value">74</div>
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
        <div className="filter-tabs">
          {teams.map(t => (
            <button key={t} className={`filter-tab${team === t ? ' active' : ''}`} onClick={() => setTeam(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mahasiswa</th>
                <th>Perguruan Tinggi</th>
                <th>Sub-tim</th>
                <th>Pembimbing</th>
                <th>Kehadiran</th>
                <th>Logbook</th>
                <th>Rilis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{s.initials}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{s.nim}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    <div>{s.university}</div>
                    <div style={{ color: 'var(--text-light)' }}>{s.major}</div>
                  </td>
                  <td><span className="badge badge-gray">{s.subTeam}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.mentor}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: s.attendance >= 95 ? 'var(--primary)' : 'var(--secondary)' }}>{s.attendance}%</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{s.logbook}</td>
                  <td style={{ fontWeight: 500 }}>{s.articles}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => setSelected(s)}>
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Detail Mahasiswa</div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{selected.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{selected.nim}</div>
                  <span className="badge badge-green" style={{ marginTop: 4 }}>Aktif</span>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                {[
                  ['Perguruan Tinggi', selected.university],
                  ['Program Studi', selected.major],
                  ['Sub-tim', selected.subTeam],
                  ['Pembimbing', selected.mentor],
                  ['Periode', selected.period],
                ].map(([l, v]) => (
                  <div className="info-row" key={l}>
                    <div className="info-label">{l}</div>
                    <div className="info-value">{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  ['Kehadiran', `${selected.attendance}%`],
                  ['Logbook', String(selected.logbook)],
                  ['Publikasi', String(selected.articles)],
                ].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Tutup</button>
              <button className="btn btn-primary">Beri Penugasan</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
