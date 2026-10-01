import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../store/useAuth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [])

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }, [user, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(username, password)
    if (!success) {
      setError(true)
    }
  }



  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Pemasangan aplikasi dimulai...');
      }
      setDeferredPrompt(null);
    } else {
      toast.info('Gunakan Chrome/Safari di HP, lalu ketuk menu pengaturan dan pilih "Add to Home Screen" atau "Install App".');
    }
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
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Humas Ditjen Pendis Kemenag RI</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div className="badge badge-red" style={{ padding: 10, justifyContent: 'center', fontSize: 13 }}>
                  Username atau password salah
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>Username</label>
                <div className="input-wrap">
                  <span className="material-symbols-outlined">person</span>
                  <input 
                    type="text" 
                    placeholder="Masukkan username Anda" 
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(false) }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>Password</label>
                <div className="input-wrap" style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(false) }}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 8, fontSize: 14 }}>
                Masuk
              </button>
            </form>

          </div>
        </div>

        {/* Download App Prompt for PWA */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
            Belum punya aplikasinya?
          </p>
          <button 
            type="button"
            onClick={handleInstallClick}
            className="btn"
            style={{
              background: 'rgba(21, 134, 132, 0.1)',
              color: 'var(--primary)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            Unduh Aplikasi
          </button>
        </div>
      </div>
    </div>
  )
}
