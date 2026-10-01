# Arsitektur Backend: SIMAGANG Humas Pendis

Berdasarkan *Project Statement*, berikut adalah cetak biru (*blueprint*) arsitektur hibrida Firebase dan Google Drive API yang sangat teroptimasi.

## 1. Skema Database Firestore (Optimasi Read 99%)

Karena kita akan menggunakan strategi **Global State Management + Optimistic UI**, kita meminimalkan *nested subcollections* yang rumit dan memaksimalkan struktur *flat* agar mudah difilter secara luring (*offline*) di *client*.

### Koleksi: `users`
Menyimpan profil mahasiswa dan admin. Hanya dibaca sekali saat *login*.
```json
{
  "uid": "string (Firebase Auth UID)",
  "nama": "string",
  "email": "string",
  "role": "string ('mahasiswa' | 'admin')",
  "universitas": "string",
  "jurusan": "string",
  "foto_profil": "string (Drive URL / kosong)"
}
```

### Koleksi: `aktivitas`
Tabel utama untuk memantau tugas harian.
```json
{
  "id_aktivitas": "string (Auto ID)",
  "uid_mahasiswa": "string",
  "tanggal": "timestamp",
  "kategori": "string ('Berita', 'Video', 'Desain', dll)",
  "deskripsi": "string",
  "bukti_url": "string (Google Drive URL)",
  "status": "string ('Menunggu' | 'Disetujui' | 'Direvisi')",
  "catatan_admin": "string (opsional)"
}
```

### Koleksi: `presensi`
Tabel kehadiran berbasis GPS.
```json
{
  "id_presensi": "string (Auto ID)",
  "uid_mahasiswa": "string",
  "tanggal": "timestamp",
  "waktu_datang": "timestamp",
  "waktu_pulang": "timestamp (null jika belum pulang)",
  "lokasi_datang": "geopoint",
  "lokasi_pulang": "geopoint",
  "status": "string ('WFO' | 'WFA' | 'Sakit')"
}
```

---

## 2. Google Apps Script (Custom Storage Bridge)

Script ini harus Anda salin dan *deploy* di **Google Apps Script** (script.google.com) dengan akses *Execute as: Me* dan *Who has access: Anyone*. Ini adalah mesin pem-Bypass Firebase Storage Anda.

**File: `Code.gs`**
```javascript
// Ganti dengan ID Folder Google Drive tempat Anda ingin menyimpan bukti magang
const FOLDER_ID = 'MASUKKAN_ID_FOLDER_GOOGLE_DRIVE_DI_SINI';

function doPost(e) {
  try {
    // 1. Parsing payload dari Frontend
    const data = JSON.parse(e.postData.contents);
    const base64Data = data.fileBase64;
    const fileName = data.fileName;
    const mimeType = data.mimeType;

    // 2. Decode Base64 menjadi file biner
    const decodedFile = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedFile, mimeType, fileName);

    // 3. Simpan ke Google Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);

    // 4. Ubah izin file menjadi publik (agar bisa dibaca/preview di aplikasi)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 5. Kembalikan URL untuk disimpan ke Firestore
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      fileUrl: file.getUrl(), // Link UI Drive
      downloadUrl: file.getDownloadUrl(), // Link langsung
      fileId: file.getId()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Integrasi Frontend (React + Vite)
Untuk memanggil skrip di atas secara *asynchronous* dengan `fetch` API standar, tanpa memblokir UI (menggunakan *loading state*):

```typescript
async function uploadToDrive(file: File) {
  // Convert file to Base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  // Fetch to Google Apps Script Web App URL
  const response = await fetch('URL_WEB_APP_APPS_SCRIPT_ANDA', {
    method: 'POST',
    body: JSON.stringify({
      fileBase64: base64,
      fileName: file.name,
      mimeType: file.type
    })
  });
  
  const result = await response.json();
  if(result.status === 'success') {
    return result.fileUrl; // Simpan URL ini ke Firestore
  }
  throw new Error("Gagal mengunggah file");
}
```
