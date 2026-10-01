import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 20,
      textAlign: 'center'
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(21, 134, 132, 0.1)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
          explore_off
        </span>
      </div>
      
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 700, 
        color: 'var(--text)',
        marginBottom: 8
      }}>
        Halaman Tidak Ditemukan
      </h1>
      
      <p style={{ 
        color: 'var(--text-light)', 
        fontSize: 15,
        maxWidth: 400,
        lineHeight: 1.6,
        marginBottom: 32
      }}>
        Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau Anda salah mengetikkan URL.
      </p>

      <Link 
        to="/" 
        className="btn btn-primary"
        style={{
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: 30,
          fontSize: 15,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 12px rgba(21, 134, 132, 0.2)'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>home</span>
        Kembali ke Beranda
      </Link>
    </div>
  )
}
