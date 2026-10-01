import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleLogin = () => {
    // Mock login as Mahasiswa
    login('mahasiswa', '')
  }

  const handleAdminLogin = () => {
    // Mock login as Admin
    login('admin', '')
  }

  return (
    <div className="login-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>account_balance</span>
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>SIMAGANG</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Subbagian Humas Ditjen Pendis</p>
        </div>

        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Selamat Datang</h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.5 }}>
              Gunakan akun Google Anda untuk mendaftar atau masuk ke sistem SIMAGANG.
            </p>

            <button onClick={handleGoogleLogin} className="btn" style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '12px',
              backgroundColor: 'white',
              color: '#3c4043',
              border: '1px solid #dadce0',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 18, height: 18 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Lanjutkan dengan Google
            </button>
            
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button onClick={handleAdminLogin} style={{ 
                background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' 
              }}>
                [Mockup] Login sebagai Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
