import { useState, useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface StudentProfile {
  id: string
  name: string
  username: string
  initials: string
}

export const students: StudentProfile[] = [
  { id: '1', name: 'Devita Nurwati', username: 'devita', initials: 'DN' },
  { id: '2', name: 'Muhammad Yusuf Zulkarnain', username: 'yusuf', initials: 'MY' },
  { id: '3', name: 'Mochammad Abiyyu Dwi Nugroho', username: 'abiyyu', initials: 'MA' },
  { id: '4', name: 'Helfni Fahera', username: 'helfni', initials: 'HF' },
  { id: '5', name: 'Genaksa Dwiky Nugraha', username: 'genaksa', initials: 'GD' },
]

interface AuthContextType {
  user: StudentProfile | null
  login: (username: string, pass: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('simagang_user_id')
    if (saved) {
      const found = students.find(s => s.id === saved)
      if (found) setUser(found)
    }
    setLoading(false)
  }, [])

  const login = (username: string, pass: string) => {
    // Password dummy: 123456 untuk semua
    if (pass !== '123456') return false
    
    const found = students.find(s => s.username === username.toLowerCase())
    if (found) {
      setUser(found)
      localStorage.setItem('simagang_user_id', found.id)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('simagang_user_id')
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
