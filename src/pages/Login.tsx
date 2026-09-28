import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(username, password)
    if (!success) {
      setError(true)
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
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Subbagian Humas Ditjen Pendis</p>
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
                    placeholder="Masukkan username" 
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(false) }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>Password</label>
                <div className="input-wrap">
                  <span className="material-symbols-outlined">lock</span>
                  <input 
                    type="password" 
                    placeholder="••••••" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(false) }}
                    required
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6, textAlign: 'right' }}>
                  *Default password: 123456
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 8, fontSize: 14 }}>
                Masuk
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
