import { Layout } from '../components/Layout'

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const attendance = [
  { id: 1, initials: 'AN', name: 'Ahmad Nur Fauzi', subTeam: 'Redaksi Berita', university: 'UIN Jakarta', time: '07.18 WIB', gps: '12m', status: 'valid' },
  { id: 2, initials: 'NS', name: 'Nabila Salsa R.', subTeam: 'Medsos & Desain', university: 'Universitas Indonesia', time: '07.24 WIB', gps: '18m', status: 'valid' },
  { id: 3, initials: 'MR', name: 'Muhammad Rizky P.', subTeam: 'Video & Dokumentasi', university: 'UIN Sunan Kalijaga', time: '07.29 WIB', gps: '9m', status: 'valid' },
  { id: 4, initials: 'FA', name: 'Fitri Ananda S.', subTeam: 'Redaksi Berita', university: 'Universitas Padjadjaran', time: '07.31 WIB', gps: '23m', status: 'valid' },
  { id: 5, initials: 'DI', name: 'Dimas Ilham W.', subTeam: 'Peliputan Lapangan', university: 'UIN Sunan Gunung Djati', time: '06.50 WIB', gps: 'Kanwil DKI', status: 'dinas' },
  { id: 6, initials: 'SR', name: 'Siti Rahma A.', subTeam: 'Redaksi Berita', university: 'IAIN Palangkaraya', time: '07.45 WIB', gps: '31m', status: 'valid' },
]

export default function Dashboard() {
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
        <div className="stat-card">
          <div className="stat-label">Mahasiswa Aktif</div>
          <div className="stat-value">24</div>
          <div className="stat-sub">Personel terdaftar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hadir Hari Ini</div>
          <div className="stat-value">22</div>
          <div className="stat-sub">Tepat waktu</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Publikasi Berjalan</div>
          <div className="stat-value">27</div>
          <div className="stat-sub">Dalam peninjauan</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Logbook Pending</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>6</div>
          <div className="stat-sub">Perlu validasi</div>
        </div>
      </div>

      {/* Attendance table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              Live Monitoring Presensi
            </div>
            <div className="card-sub">Pencatatan waktu & geofencing</div>
          </div>
          <span className="badge badge-green">Sinkronisasi Otomatis</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mahasiswa</th>
                <th>Perguruan Tinggi</th>
                <th>Jam Masuk</th>
                <th>GPS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{s.initials}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{s.subTeam}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.university}</td>
                  <td style={{ fontWeight: 600, color: s.status === 'dinas' ? 'var(--secondary)' : 'var(--primary)' }}>{s.time}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.gps}</td>
                  <td>
                    <span className={`badge ${s.status === 'valid' ? 'badge-green' : 'badge-blue'}`}>
                      {s.status === 'valid' ? 'Hadir' : 'Dinas Luar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
