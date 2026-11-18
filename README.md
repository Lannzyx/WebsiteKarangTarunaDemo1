# Website Karang Taruna (Backup - Node.js + SQLite)

Versi duplikat/backup dari project website Karang Taruna menggunakan **Node.js (Express) + SQLite** (`node:sqlite` bawaan Node.js). Dilengkapi halaman publik dinamis dan **panel admin**.

Project utama (untuk deploy cPanel): `../WebsiteKarangTarunaUtamaPHP` (PHP + MySQL/MariaDB).

## Fitur
- **Publik (tanpa login):** Beranda, Anggota/Pengurus (tab per seksi), Jadwal Kegiatan, Kas (rincian + filter periode/kategori & lampiran), Kontak, dan detail Berita.
- **Admin (login):** Dashboard, kelola Berita (judul, tanggal, kategori, ringkasan, isi lengkap, foto, status publik/draft, sorotan/highlight, penulis, urutan), Anggota/Pengurus & seksi/komponen (tambah/ubah/hapus seksi; nama, jabatan, foto, kontak, bio, urutan, status aktif/nonaktif), Jadwal, Kas (pemasukan/pengeluaran, kategori/event, bukti/lampiran; total otomatis; filter), Galeri, Pengaturan situs, serta Akun Admin (tambah/hapus admin, ganti password).
- **Setup awal:** akun admin pertama dibuat lewat halaman **/admin/setup** (hanya tersedia jika belum ada admin).
- **Seed data awal:** saat pertama dijalankan, database & data contoh (pengurus, berita, jadwal, kas, galeri, pengaturan) otomatis dibuat dari aset yang ada.

## Prasyarat
- **Node.js v22+** (disarankan v24+) karena menggunakan modul bawaan `node:sqlite`.
- npm

## Cara Menjalankan (Lokal)
1. Buka terminal di folder project:
   ```bash
   cd WebKarangTarunaBackupNdoejs
   ```
2. Instal dependensi (jika folder `node_modules` belum ada):
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm start
   # atau: node server.js
   ```
4. Buka website:
   - Publik: http://localhost:3000
   - Admin: http://localhost:3000/admin/login (jika belum ada admin, akan diarahkan ke **/admin/setup** untuk membuat akun admin pertama)

Port bisa diubah dengan environment variable `PORT`, contoh (PowerShell): `$env:PORT=3001; npm start`.

## Struktur
- `server.js` — entry point Express
- `db.js` — inisialisasi SQLite (`db/karangtaruna.sqlite`), skema, dan seed data awal
- `routes/` — route publik & admin
- `views/` — template EJS (`public/`, `admin/`, `partials/`)
- `public/` — aset statis (`assets/`, `css/`, `js/`, `uploads/`)
- `middleware/` — auth & upload
- `utils.js` — helper
- `_reference/` — salinan HTML statis awal (referensi)

## Catatan
- Database SQLite dibuat otomatis di `db/karangtaruna.sqlite` saat server pertama kali dijalankan.
- File unggahan disimpan di `public/uploads/`.
- **Form kontak publik** masih placeholder (action `#`). Hubungkan ke layanan form/email saat deploy bila diperlukan.
- **Maps:** sematkan kode `<iframe>` Google Maps lewat menu **Pengaturan > Lokasi/Maps** di admin.
- Keamanan dasar: password di-hash (bcrypt), proteksi sesi admin, validasi/pembatasan upload. Lakukan hardening tambahan untuk produksi (ganti `SESSION_SECRET`, gunakan HTTPS, backup DB).
- Untuk deploy produksi Node.js, gunakan reverse proxy (Nginx/dll.) dan process manager (PM2) sesuai lingkungan hosting.

## Akun Admin Awal
Tidak ada akun default. Gunakan halaman **/admin/setup** saat pertama dijalankan untuk membuat admin pertama. Admin lain dapat ditambah dari menu **Akun Admin**.
