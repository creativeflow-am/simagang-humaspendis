import { Layout } from '../components/Layout'

const cols = [
  {
    label: 'Belum Dikerjakan', count: 3, color: 'var(--text-light)',
    tasks: [
      { title: 'Liputan Rakor Ditjen Pendis', assignee: 'Muhammad Rizky P.', due: '25 Mar', priority: 'Tinggi' },
      { title: 'Desain Infografis Ramadan', assignee: 'Nabila Salsa R.', due: '26 Mar', priority: 'Sedang' },
      { title: 'Notulensi Rapat Pimpinan', assignee: 'Ahmad Nur Fauzi', due: '27 Mar', priority: 'Rendah' },
    ],
  },
  {
    label: 'Sedang Dikerjakan', count: 4, color: 'var(--secondary)',
    tasks: [
      { title: 'Siaran Pers Beasiswa Pesantren', assignee: 'Ahmad Nur Fauzi', due: '24 Mar', priority: 'Tinggi' },
      { title: 'Video Dokumentasi BIMTEK', assignee: 'Muhammad Rizky P.', due: '25 Mar', priority: 'Tinggi' },
      { title: 'Konten IG Pendidikan Islam', assignee: 'Nabila Salsa R.', due: '24 Mar', priority: 'Sedang' },
      { title: 'Peliputan Wisuda PTKIN', assignee: 'Dimas Ilham W.', due: '28 Mar', priority: 'Sedang' },
    ],
  },
  {
    label: 'Selesai', count: 5, color: 'var(--primary)',
    tasks: [
      { title: 'Rilis Berita Anggaran Pendis', assignee: 'Fitri Ananda S.', due: '23 Mar', priority: 'Tinggi' },
      { title: 'Rekap Logbook Minggu III', assignee: 'Siti Rahma A.', due: '22 Mar', priority: 'Rendah' },
      { title: 'Foto Press Conference Menag', assignee: 'Muhammad Rizky P.', due: '21 Mar', priority: 'Tinggi' },
    ],
  },
]

const priorityBadge: Record<string, string> = {
  'Tinggi': 'badge-orange',
  'Sedang': 'badge-blue',
  'Rendah': 'badge-gray',
}

export default function Penugasan() {
  return (
    <Layout role="admin" title="Penugasan" subtitle="Manajemen tugas humas">
      <div className="page-header">
        <div>
          <div className="page-title">Pengelolaan Tugas</div>
          <div className="page-sub">Kelola disposisi tugas humas</div>
        </div>
        <button className="btn btn-primary">
          <span className="material-symbols-outlined">add</span>
          Buat Tugas
        </button>
      </div>

      <div className="kanban-board">
        {cols.map(col => (
          <div key={col.label} className="kanban-col">
            <div className="kanban-col-header">
              <span>{col.label}</span>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>{col.count}</span>
            </div>
            {col.tasks.map(task => (
              <div key={task.title} className="kanban-card">
                <div className="kanban-card-title">{task.title}</div>
                <div className="kanban-card-meta">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person</span>
                  <span>{task.assignee}</span>
                  <span>·</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
                  <span>{task.due}</span>
                  <span className={`badge ${priorityBadge[task.priority]}`} style={{ marginLeft: 'auto' }}>{task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  )
}
