import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { toast } from 'sonner'
import { useAuth } from '../../store/useAuth'
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function PresensiMahasiswa() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'checking' | 'error' | 'ready' | 'submitting'>('checking')
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [address, setAddress] = useState('Sedang mengidentifikasi alamat...')
  const [errorMsg, setErrorMsg] = useState('')

  // State to track if user has checked in or checked out
  const [attendance, setAttendance] = useState<'none' | 'masuk' | 'pulang'>('none')
  const [recordId, setRecordId] = useState<string | null>(null)
  
  // Real-time clock
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMsg('Geolokasi tidak didukung browser Anda')
      return
    }

    let mounted = true

    const getPos = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted) return
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng })
          setStatus('ready')

          // Reverse geocoding for professional address text
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (mounted) {
                if (data.display_name) {
                  setAddress(data.display_name)
                } else {
                  setAddress('Alamat tidak spesifik')
                }
              }
            })
            .catch(() => {
              if (mounted) setAddress('Tidak dapat memuat nama jalan')
            })
        },
        (error) => {
          if (!mounted) return
          // If timeout, retry silently to keep it "loading"
          if (error.code === error.TIMEOUT) {
            getPos()
          } else {
            setStatus(prev => prev === 'ready' ? 'ready' : 'error')
            if (error.code === error.PERMISSION_DENIED) {
              setErrorMsg('Akses lokasi diblokir oleh perangkat/browser.')
            } else {
              setErrorMsg('Sinyal GPS tidak tersedia saat ini.')
            }
          }
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      )
    }

    getPos()

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!user) return
    
    const todayStr = new Date().toISOString().split('T')[0]
    const q = query(
      collection(db, 'presensi'),
      where('uid_mahasiswa', '==', user.id || '1'),
      where('tanggal_str', '==', todayStr)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0]
        setRecordId(docData.id)
        if (docData.data().waktu_pulang) {
          setAttendance('pulang')
        } else {
          setAttendance('masuk')
        }
      } else {
        setRecordId(null)
        setAttendance('none')
      }
    }, (err) => {
      console.error("Error fetching attendance:", err)
    })
    
    return () => unsubscribe()
  }, [user])

  const handleAbsen = async () => {
    if (!user || !location) return
    setStatus('submitting')
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const submitData = async () => {
        if (attendance === 'none') {
          // Absen Masuk
          const docRef = await addDoc(collection(db, 'presensi'), {
            uid_mahasiswa: user.id || '1',
            nama_mahasiswa: user.name || 'Mahasiswa',
            tanggal_str: todayStr,
            tanggal: serverTimestamp(),
            waktu_datang: serverTimestamp(),
            waktu_pulang: null,
            lokasi_datang: { lat: location.lat, lng: location.lng },
            status: 'Hadir'
          })
          setRecordId(docRef.id)
          setAttendance('masuk')
          return 'Berhasil absen masuk!'
        } else if (attendance === 'masuk' && recordId) {
          // Absen Pulang
          await updateDoc(doc(db, 'presensi', recordId), {
            waktu_pulang: serverTimestamp(),
            lokasi_pulang: { lat: location.lat, lng: location.lng }
          })
          setAttendance('pulang')
          return 'Berhasil absen pulang! Hati-hati di jalan.'
        }
        return ''
      }

      // Timeout 8 detik agar tidak nyangkut selamanya jika koneksi terputus
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000))
      const msg = await Promise.race([submitData(), timeoutPromise])
      
      if (msg) toast.success(msg as string)
    } catch (err: any) {
      console.error(err)
      if (err.message === 'TIMEOUT') {
        toast.error('Koneksi terputus (Timeout). Silakan refresh halaman dan coba lagi.')
      } else {
        toast.error('Terjadi kesalahan jaringan')
      }
    }
    setStatus('ready')
  }

  const dateStr = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <Layout role="mahasiswa" title="Presensi" subtitle="Rekam kehadiran harian">
      <div style={{ maxWidth: 560 }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <div className="page-title">Presensi</div>
            <div className="page-sub">{dateStr}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
            {timeStr}
          </div>
        </div>

        {/* Status Dashboard (Minimalist) */}
        <div className="card" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--text-light)', fontSize: 18, flexShrink: 0 }}>location_on</span>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
              {status === 'checking' ? 'Mendeteksi lokasi...' : address}
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ color: attendance !== 'none' ? 'var(--primary)' : 'var(--text-light)', fontSize: 18 }}>task_alt</span>
            <div style={{ fontSize: 13, fontWeight: 500, color: attendance !== 'none' ? 'var(--primary)' : 'var(--text)' }}>
              {attendance === 'none' && 'Status: Belum Absen Masuk'}
              {attendance === 'masuk' && 'Status: Sudah Absen Masuk'}
              {attendance === 'pulang' && 'Status: Selesai (Hadir Penuh)'}
            </div>
          </div>
        </div>

        {/* Location Action */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">Perekaman GPS</div>
            <span className="badge badge-gray">GPS Aktif</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 20, textAlign: 'center', padding: '16px', background: 'var(--bg)', borderRadius: 12, border: '1px dashed var(--border)' }}>
              
              {status === 'checking' && (
                <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 16, background: 'var(--surface)', padding: 16, opacity: 0.7, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--text-light)' }}>location_searching</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '60%', marginBottom: 8 }}></div>
                      <div style={{ height: 10, background: 'var(--border)', borderRadius: 4, width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #fca5a5', marginBottom: 16, background: '#fef2f2', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>location_disabled</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', lineHeight: 1.4 }}>Akses Lokasi Diblokir</div>
                      <div style={{ fontSize: 12, color: '#991b1b', opacity: 0.8 }}>Mohon izinkan akses GPS di pengaturan browser Anda.</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 12, fontSize: 12, background: 'white' }} onClick={() => window.location.reload()}>Coba Deteksi Ulang</button>
                </div>
              )}

              {(status === 'ready' || status === 'submitting') && location && (
                <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--primary-light)', marginBottom: 16, background: 'var(--primary-light)', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 4px 10px rgba(21,134,132,0.3)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>location_on</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {address}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {status === 'ready' && attendance === 'none' && (
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }} onClick={handleAbsen}>
                <span className="material-symbols-outlined">login</span>
                Absen Masuk
              </button>
            )}

            {status === 'ready' && attendance === 'masuk' && (
              <button className="btn" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, background: 'var(--secondary)', color: 'var(--text)', boxShadow: '0 4px 6px rgba(254, 192, 19, 0.3)' }} onClick={handleAbsen}>
                <span className="material-symbols-outlined">logout</span>
                Absen Pulang
              </button>
            )}

            {status === 'ready' && attendance === 'pulang' && (
              <div className="badge badge-green" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}>
                <span className="material-symbols-outlined">task_alt</span>
                Presensi Hari Ini Selesai
              </div>
            )}
            
            {status === 'submitting' && (
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled>
                Memproses Absensi...
              </button>
            )}
            
          </div>
        </div>
      </div>
    </Layout>
  )
}
