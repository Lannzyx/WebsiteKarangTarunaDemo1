# PRD — Website Karang Taruna

## 1. Ringkasan Project
- **Nama project:** Website Karang Taruna
- **Jenis:** Website profil organisasi
- **Deskripsi singkat:** Website untuk perkenalan profil organisasi Karang Taruna yang menampilkan informasi pengurus, kegiatan, jadwal acara, serta informasi kas, dilengkapi berita, kontak, dan kanal pengaduan.
- **Status dokumen:** Draft v1 (berdasarkan kebutuhan awal)
- **Tanggal:** 18 November 2026

## 2. Latar Belakang & Tujuan
### 2.1 Tujuan Utama
Menyediakan media informasi resmi dan mudah diakses untuk mengenalkan Karang Taruna kepada masyarakat dan pemangku kepentingan, serta memudahkan publikasi kegiatan dan komunikasi.

### 2.2 Sasaran
- Menampilkan profil organisasi dan struktur/pengurus secara jelas.
- Menyediakan rekap kegiatan, jadwal acara, dan berita terkini lingkungan Karang Taruna.
- Menyajikan informasi total kas secara transparan (sesuai data yang disediakan).
- Memudahkan masyarakat menghubungi/pengaduan melalui WhatsApp, kontak, dan lokasi.
- Website dapat digunakan dengan mudah di perangkat mobile maupun desktop, termasuk oleh pengguna yang lebih tua.

## 3. Target Pengguna
- Warga/masyarakat sekitar
- Pemuda-pemudi dan calon anggota
- Perangkat desa/kelurahan
- Donatur dan mitra
- Pengunjung umum lainnya

**Implikasi desain:** Navigasi sederhana, teks mudah dibaca, kontras warna baik, tombol/tautan jelas, dan tata letak tidak terlalu padat agar ramah bagi pengguna yang lebih tua.

## 4. Ruang Lingkup

### 4.1 In Scope (MVP — Versi Pertama)
**Halaman utama:**
1. **Beranda** — Berita dan informasi kegiatan/acara yang terjadi di lingkungan Karang Taruna, termasuk sorotan/highlight jadwal acara.
2. **Anggota/Pengurus** (halaman terpisah) — Daftar pengurus/anggota beserta foto, ditampilkan dengan struktur/tab per komponen/bidang/seksi.
3. **Jadwal Kegiatan** (halaman terpisah) — Daftar jadwal kegiatan/acara.
4. **Kas** (halaman terpisah) — Informasi total kas (dan rincian ringkas bila data tersedia).
5. **Kontak** (halaman terpisah) — Kontak anggota, tombol/popup WhatsApp untuk pengaduan, tautan media sosial, dan peta/lokasi (maps).

**Fitur/konten lintas halaman:**
- Profil organisasi/perkenalan Karang Taruna (ditempatkan pada halaman yang sesuai, utamanya Beranda/Profil).
- Rekap kegiatan.
- Berita/publikasi informasi.
- Navigasi yang konsisten dan responsif.
- Form kontak (pengiriman ke email).

### 4.2 Out of Scope (Versi Pertama)
Belum ditentukan secara spesifik oleh pemilik project. Secara default, hal-hal berikut **di luar cakupan MVP** kecuali disepakati kemudian:
- Sistem login/admin/CMS untuk mengelola konten.
- Pendaftaran anggota online (form/database) di luar kontak dasar.
- Integrasi pembayaran/donasi online.
- Fitur pencarian, komentar, atau forum.
- Multi-bahasa selain Bahasa Indonesia.
- Integrasi lanjutan di luar yang disebutkan (mis. embed feed dinamis kompleks) bila membutuhkan layanan tambahan.

## 5. Struktur Situs & Kebutuhan Fungsional

| Halaman | Tujuan | Konten/Fungsi Utama | Status Data |
|---|---|---|---|
| **Beranda** | Pintu masuk & ringkasan informasi | Hero/profil singkat organisasi; berita terkini; highlight kegiatan/jadwal acara; akses cepat ke halaman lain | Teks profil & berita: **dummy/placeholder** (TBD) |
| **Anggota/Pengurus** | Transparansi & perkenalan pengurus | Foto pengurus/anggota; struktur/tab per komponen/bidang/seksi (mis. BPH, seksi-seksi); nama & jabatan | **Aset foto & struktur tersedia** (perlu pemetaan nama/jabatan final jika ada penyesuaian); data teks tambahan: placeholder bila perlu |
| **Jadwal Kegiatan** | Informasi agenda | Daftar jadwal (tanggal, waktu, kegiatan, lokasi/keterangan) | **Dummy/placeholder** (TBD) |
| **Kas** | Informasi keuangan ringkas | Tampilan total kas (dan rincian ringkas opsional bila disediakan) | **Dummy/placeholder** (TBD) |
| **Kontak** | Komunikasi & pengaduan | Kontak anggota, tombol/popup WhatsApp pengaduan (tautan ke WA), tautan media sosial, peta/lokasi (embed/link maps), form kontak kirim ke email | Nomor WA, kontak, medsos, alamat/maps, tujuan email: **dummy/placeholder** (TBD) |

### 5.1 Detail Fitur MVP
- **Tab/komponen pengurus:** Pengelompokan pengurus per bidang/seksi agar mudah ditelusuri.
- **WhatsApp pengaduan:** Tombol/popup yang jelas, membuka chat WhatsApp dengan nomor & pesan awal (template) yang ditentukan.
- **Peta/lokasi:** Menampilkan lokasi sekretariat/kegiatan (embed Google Maps atau tautan peta) — alamat/TBD.
- **Tautan media sosial:** Ikon/tautan ke akun resmi (Instagram/Facebook/YouTube/dll.) — TBD.
- **Form kontak email:** Pengunjung dapat mengirim pesan; implementasi teknis pada situs statis memerlukan layanan pihak ketiga atau mekanisme pengiriman (lihat Dependensi/Teknis).
- **Berita & rekap kegiatan:** Daftar/kartu berita dan ringkasan kegiatan (konten dummy awal, mudah diganti).

## 6. Kebutuhan Non-Fungsional
- **Responsif:** Tampilan optimal di mobile dan desktop.
- **Aksesibilitas & kemudahan pakai:** Mudah digunakan oleh pengguna awam dan orang yang lebih tua (navigasi jelas, ukuran teks/target sentuh memadai, kontras warna baik, struktur informasi sederhana).
- **Bahasa:** Bahasa Indonesia sebagai bahasa utama.
- **Gaya visual:** Minimalis, modern, tidak terlalu formal; warna mengacu pada file color palette yang disediakan.
- **Performa dasar:** Halaman ringan, gambar dioptimalkan seperlunya, tidak bergantung framework berat.
- **Konsistensi:** Komponen UI (header, footer, kartu, tombol, tab) konsisten di seluruh halaman.
- **Maintainability:** Struktur kode HTML/CSS/JS sederhana agar mudah diperbarui manual.

## 7. Konten & Aset

### 7.1 Aset yang Tersedia
- **Lokasi (Windows):** `D:\bahan bahan website`
- **Lokasi (WSL):** `/mnt/d/bahan bahan website`

| Folder | Isi |
|---|---|
| `Color Pallet/` | `color pallet.png` (acuan warna) |
| `FOTO KEGIATAN/` | 10 foto kegiatan (JPG) |
| `FOTO PENGURUS/Upload Foto Pengurus/` | Subfolder `BPH/` dan `SEKSI - SEKSI/` (berisi foto per seksi/jabatan) |
| `LOGO/` | `LOGO.jpg`, `LOGO(1).jpg` |
| `STRUKTUR/` | `Struktur Katar.jpg` |

**Catatan:** Aset akan disalin/dirapikan ke struktur folder project saat tahap implementasi.

### 7.2 Konten Belum Lengkap (Menggunakan Dummy/Placeholder)
Data berikut belum disediakan dan akan menggunakan **placeholder/dummy** pada versi awal, lalu diganti data asli:
- Teks profil & deskripsi organisasi
- Daftar & isi berita
- Jadwal kegiatan (detail tanggal/waktu/lokasi)
- Nominal & rincian total kas
- Nomor WhatsApp pengaduan & template pesan
- Daftar kontak anggota (nama/nomor/jabatan untuk ditampilkan)
- Tautan akun media sosial
- Alamat & titik lokasi untuk maps
- Alamat email tujuan form kontak

**Definisi:**
- *Placeholder*: penanda/slot sementara yang menunjukkan jenis & posisi konten (contoh: “(alamat menyusul)”, “08xx-xxxx-xxxx”).
- *Dummy data*: isi contoh yang menyerupai data asli agar tampilan/fungsi dapat ditinjau (contoh: berita contoh, jadwal contoh, nominal contoh) dan mudah diganti.

## 8. Referensi & Arah Desain
- **Referensi struktur/nuansa:** https://www.itb.ac.id/, https://www.ui.ac.id/, https://www.uii.ac.id/ (sebagai inspirasi keteraturan informasi & navigasi institusi; bukan meniru visual secara langsung)
- **Arah gaya:** Minimalis, modern, tidak terlalu formal, informatif, dan ramah pengguna (termasuk pengguna usia lebih tua).
- **Warna:** Mengacu pada `Color Pallet/color pallet.png` (nilai hex/detail warna akan diekstrak/diterapkan saat implementasi).

## 9. Kebutuhan Teknis

| Aspek | Keputusan |
|---|---|
| **Teknologi** | HTML, CSS, JavaScript (tanpa framework React/Next.js) |
| **Responsif** | Ya (mobile & desktop) |
| **Bahasa** | Indonesia |
| **Integrasi** | Tombol/link WhatsApp, tautan media sosial, peta/lokasi (embed/link), form kontak ke email |
| **Domain & hosting** | Belum ada (akan ditentukan kemudian) |

**Catatan teknis (form kontak email):** Pada situs statis HTML/CSS/JS, pengiriman email biasanya memerlukan layanan pihak ketiga (mis. Formspree, EmailJS, atau fitur form dari penyedia hosting) atau fallback `mailto:`. Pilihan mekanisme akan disesuaikan saat deployment/tersedianya email tujuan.

## 10. Timeline & Prioritas
- **Deadline:** 1 minggu
- **Urutan prioritas pengerjaan (sesuai arahan):**
  1. Beranda
  2. Anggota/Pengurus
  3. Jadwal Kegiatan
  4. Kas
  5. Kontak

*Catatan:* Seluruh halaman MVP ditargetkan selesai dalam 1 minggu; urutan di atas menjadi panduan fokus implementasi.

## 11. Asumsi & Dependensi
- **Asumsi:** Konten teks/data yang belum tersedia akan diisi dummy/placeholder terlebih dahulu; aset visual yang ada di folder bahan dapat digunakan.
- **Dependensi/input yang dibutuhkan untuk finalisasi konten:**
  - Data profil organisasi, berita, jadwal, kas (final)
  - Nomor WhatsApp, daftar kontak, tautan media sosial, alamat/lokasi, email tujuan form
  - Konfirmasi pemilihan logo (`LOGO.jpg` atau `LOGO(1).jpg`) bila diperlukan
- **Dependensi teknis:** Mekanisme pengiriman form kontak email dan platform hosting/domain (belum ditentukan).

## 12. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data/teks belum lengkap | Konten final tertunda | Gunakan dummy/placeholder terstruktur yang mudah diganti |
| Deadline 1 minggu | Ruang iterasi desain terbatas | Fokus MVP, UI sederhana & konsisten, prioritaskan halaman utama |
| Form email butuh layanan eksternal | Fungsi kirim pesan belum aktif penuh | Sediakan UI form + rencana integrasi (service) atau fallback `mailto:` |
| Aset foto beragam ukuran/format | Tampilan kurang rapi | Normalisasi tampilan via CSS (crop/ratio) & optimasi seperlunya |

## 13. Kriteria Keberhasilan (MVP)
- Semua 5 halaman (Beranda, Anggota/Pengurus, Jadwal Kegiatan, Kas, Kontak) dapat diakses melalui navigasi.
- Fitur utama MVP tersedia: tampilan pengurus bertab/terstruktur, berita, jadwal, info kas, kontak/WA/maps/media sosial, dan form kontak.
- Tampilan responsif dan mudah digunakan di mobile & desktop dengan gaya minimalis-modern.
- Aset yang tersedia (logo, foto pengurus, foto kegiatan, struktur, acuan warna) terintegrasi ke dalam website.
- Konten yang belum tersedia terisi placeholder/dummy yang jelas.

## 14. Open Questions (Perlu Dikonfirmasi/Dilengkapi)
- [ ] Teks final profil/deskripsi organisasi Karang Taruna
- [ ] Konten berita & rekap kegiatan (final)
- [ ] Data jadwal kegiatan (final)
- [ ] Nominal/rincian total kas (final)
- [ ] Nomor WhatsApp & template pesan pengaduan
- [ ] Daftar kontak anggota yang ditampilkan
- [ ] Tautan akun media sosial
- [ ] Alamat/lokasi untuk maps
- [ ] Email tujuan untuk form kontak & mekanisme pengiriman (Formspree/EmailJS/hosting form/`mailto:`)
- [ ] Domain & hosting yang akan digunakan
- [ ] Logo mana yang dipakai sebagai utama (`LOGO.jpg` / `LOGO(1).jpg`)
- [ ] Hal/fitur yang secara eksplisit ingin dikecualikan dari v1 (jika ada)
