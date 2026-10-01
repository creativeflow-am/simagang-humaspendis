## 🚀 Teknologi Utama
- **Frontend Framework:** Next.js (App Router) + React.js
- **Styling:** Tailwind CSS (Modern, responsif, dan kaya animasi)
- **Database Backend:** Firebase Cloud Firestore (NoSQL)
- **File Storage System:** Google Drive via Google Apps Script (Custom API)
- **Document Generation:** jsPDF + jspdf-autotable (Client-side)
- **Deployment:** Vercel

## 💡 Solusi Arsitektur & Tantangan yang Diselesaikan

### 1. *Zero-Cost Storage Strategy* (Bypass Kuota Penyimpanan)
Mengandalkan penyimpanan Firebase untuk unggahan berkas (PDF/Gambar) sangat berisiko membengkakkan biaya karena batas gratis yang sangat kecil (1GB). Sebagai solusinya, aplikasi ini **mem-bypass Firebase Storage sepenuhnya** dan mengarahkan seluruh unggahan berkas (bukti kegiatan) langsung ke **Google Drive** menggunakan *custom bridge* API dari Google Apps Script. 
**Hasil:** Aplikasi mendapatkan kuota gratis yang masif (15GB/akun) dengan perlindungan sistem secara penuh, menjaga pengeluaran server di titik $0.

### 2. *Extreme Read-Optimization* (Optimasi Kuota Database)
Firebase Firestore memiliki batas baca gratis 50.000 dokumen per hari. Mengingat pengguna dapat menginput ribuan kegiatan, me-refresh tabel terus-menerus akan menghabiskan kuota dengan sangat cepat.
**Solusi:** Mengkombinasikan **Global State Management (React Context)** dengan **Optimistic UI Updates**.
- **Global State:** Aplikasi hanya membaca *database* 1 kali saat pertama kali dibuka. Navigasi antar-menu (WFA, WFO, Overview) menggunakan teknik penyaringan memori lokal (0 kuota *Read*).
- **Optimistic UI:** Setiap operasi *Create*, *Update*, atau *Delete* tidak lagi memicu aplikasi untuk mengunduh ulang seluruh data dari *server*. Setelah Firebase mengonfirmasi perubahan, UI akan menyuntikkan data tersebut ke tabel di layar secara instan.
**Hasil:** Penurunan konsumsi *Read* Database hingga 99%, membuat aplikasi kebal terhadap kelebihan beban meskipun menampung ribuan input harian.

### 3. *Client-Side PDF Generation* (Laporan Dokumen Instan)
Alih-alih membebani *server* untuk melakukan *render* laporan PDF, generasi PDF dilakukan secara *real-time* menggunakan perangkat pengguna (melalui `jsPDF`). PDF dioptimalkan dengan dukungan *preview* tab baru, perhitungan ukuran kolom yang anti-terpotong (*auto-width mapping*), penyesuaian gaya tabel standar instansi (font *sans-serif*, ukuran 10pt-11pt), serta *header* dinamis yang tidak mengulang pada lembar berikutnya.

### 4. *Frictionless PWA Experience*
Aplikasi diubah menjadi PWA penuh yang memungkinkan instalasi di perangkat *mobile* (berfungsi layaknya aplikasi *native*). Untuk menghindari masalah data tersangkut (*stale data*) yang sering terjadi pada konfigurasi *caching Service Worker*, strategi *Network Only* disematkan pada panggilan API vital. Ini menjamin pengguna selalu melihat data paling mutakhir tanpa perlu diajari konsep *clear cache* atau memuat ulang halaman (*hard refresh*).
