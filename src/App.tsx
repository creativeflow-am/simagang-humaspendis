import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Direktori from './pages/Direktori'
import Penugasan from './pages/Penugasan'
import PresensiGPS from './pages/PresensiGPS'
import Login from './pages/Login'
import BerandaMahasiswa from './pages/mahasiswa/Beranda'
import PresensiMahasiswa from './pages/mahasiswa/Presensi'
import AktivitasMahasiswa from './pages/mahasiswa/Aktivitas'
import AktivitasFormMahasiswa from './pages/mahasiswa/AktivitasForm'
import ProfilMahasiswa from './pages/mahasiswa/Profil'
import { AuthProvider } from './store/useAuth'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Mahasiswa routes */}
          <Route path="/" element={<BerandaMahasiswa />} />
          <Route path="/presensi" element={<PresensiMahasiswa />} />
          <Route path="/aktivitas" element={<AktivitasMahasiswa />} />
          <Route path="/aktivitas/tambah" element={<AktivitasFormMahasiswa />} />
          <Route path="/profil" element={<ProfilMahasiswa />} />

          {/* Admin routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/direktori" element={<Direktori />} />
          <Route path="/admin/penugasan" element={<Penugasan />} />
          <Route path="/admin/presensi" element={<PresensiGPS />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
