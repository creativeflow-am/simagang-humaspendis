import { Layout } from '../components/Layout'

const records = [
  { initials: 'AN', name: 'Ahmad Nur Fauzi', subTeam: 'Redaksi Berita', time: '07.18 WIB', status: 'Hadir', gps: '12m', lat: -6.1754, lng: 106.8272 },
  { initials: 'NS', name: 'Nabila Salsa R.', subTeam: 'Medsos & Desain', time: '07.24 WIB', status: 'Hadir', gps: '18m', lat: -6.1756, lng: 106.8275 },
  { initials: 'MR', name: 'Muhammad Rizky P.', subTeam: 'Video & Dok.', time: '07.29 WIB', status: 'Hadir', gps: '9m', lat: -6.1752, lng: 106.8270 },
  { initials: 'DI', name: 'Dimas Ilham W.', subTeam: 'Peliputan', time: '06.50 WIB', status: 'Dinas Luar', gps: 'Kanwil DKI', lat: -6.1744, lng: 106.8299 },
  { initials: 'SR', name: 'Siti Rahma A.', subTeam: 'Redaksi Berita', time: '07.45 WIB', status: 'Hadir', gps: '31m', lat: -6.1760, lng: 106.8269 },
  { initials: 'FA', name: 'Fitri Ananda S.', subTeam: 'Redaksi Berita', time: '-', status: 'Belum', gps: '-', lat: 0, lng: 0 },
]

const statusBadge: Record<string, string> = {
  'Hadir': 'badge-green',
  'Dinas Luar': 'badge-blue',
  'Belum': 'badge-orange',
}

export default function PresensiGPS() {
  return (
    <Layout role="admin" title="Presensi" subtitle="Rekap kehadiran & GPS">
      <div className="page-header">
        <div>
          <div className="page-title">Rekapitulasi Presensi</div>
          <div className="page-sub">Senin, 24 Maret 2025 · Pencatatan waktu & geolokasi</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
          <button className="btn btn-primary">
            <span className="material-symbols-outlined">print</span>
            Cetak
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Hadir Tepat Waktu</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>22</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dinas Luar</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>1</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Izin</div>
          <div className="stat-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Belum Presensi</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>0</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Detail Presensi Hari Ini</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mahasiswa</th>
                <th>Sub-tim</th>
                <th>Jam Masuk</th>
                <th>Jarak GPS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{r.initials}</div>
                      <span style={{ fontWeight: 500 }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.subTeam}</td>
                  <td style={{ fontWeight: 600 }}>{r.time}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.gps}</td>
                  <td><span className={`badge ${statusBadge[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
