const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'db');
const uploadDirs = ['berita','anggota','kas','galeri','umum'].map(d => path.join(__dirname, 'public', 'uploads', d));
for (const d of [dataDir, ...uploadDirs]) fs.mkdirSync(d, { recursive: true });

const dbPath = path.join(dataDir, 'karangtaruna.sqlite');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function init() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    jabatan TEXT DEFAULT '',
    photo TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(section_id) REFERENCES sections(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    date TEXT,
    category TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    content TEXT DEFAULT '',
    image TEXT DEFAULT '',
    is_published INTEGER DEFAULT 1,
    is_highlight INTEGER DEFAULT 0,
    author TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time_text TEXT DEFAULT '',
    title TEXT NOT NULL,
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    is_visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS kas_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('pemasukan','pengeluaran')),
    amount REAL NOT NULL DEFAULT 0,
    category TEXT DEFAULT '',
    attachment TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image TEXT NOT NULL,
    caption TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
  );
  `);
}

function all(sql, ...params) { return db.prepare(sql).all(...params); }
function get(sql, ...params) { return db.prepare(sql).get(...params); }
function run(sql, ...params) { return db.prepare(sql).run(...params); }

const defaults = {
  site_name: 'Karang Taruna',
  tagline: 'Website Resmi Organisasi',
  hero_title: 'Karang Taruna — Bersama Membangun Lingkungan',
  hero_lead: 'Selamat datang di website Karang Taruna. Kami adalah wadah pengembangan generasi muda yang aktif berkontribusi melalui kegiatan sosial, budaya, dan pemberdayaan masyarakat.',
  hero_image: 'assets/img/kegiatan/img-1094.jpg',
  profil_text: 'Karang Taruna merupakan organisasi kepemudaan yang bertujuan menumbuhkan kepedulian sosial, kreativitas, dan kebersamaan warga. Silakan ganti teks ini dengan profil, visi, dan misi resmi organisasi.',
  stat1_value: 'Aktif', stat1_label: 'Kegiatan Sosial & Lingkungan',
  stat2_value: 'Solid', stat2_label: 'Kepengurusan & Relawan',
  stat3_value: 'Terbuka', stat3_label: 'Kolaborasi Warga & Mitra',
  footer_about: 'Organisasi kepemudaan yang bergerak untuk kemajuan dan kebersamaan lingkungan.',
  address: 'Jl. Contoh Alamat No. 00, Kelurahan/Desa, Kecamatan, Kota/Kabupaten',
  phone: '08xx-xxxx-xxxx',
  email: 'info@example.com',
  hours: 'Senin–Sabtu, 16.00–20.00 WIB',
  wa_number: '6280000000000',
  wa_template: 'Halo Karang Taruna, saya ingin menyampaikan pengaduan: ',
  social_instagram: '#', social_facebook: '#', social_youtube: '#', social_tiktok: '#',
  maps_embed: '', maps_link: 'https://www.google.com/maps',
  logo: 'assets/img/logo/logo.jpg',
  struktur_image: 'assets/img/struktur-katar.jpg',
  contact_note: ''
};

function seedIfNeeded() {
  const insSet = db.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)');
  for (const [k,v] of Object.entries(defaults)) insSet.run(k, v);

  const secCount = get('SELECT COUNT(*) as c FROM sections').c;
  if (secCount === 0) {
    const sections = [
      ['Badan Pengurus Harian (BPH)','bph',1,[
        ['Anwar Fauzi','Ketua','assets/img/pengurus/bph/anwar-fauzi.png'],
        ['Bagus Ardhiawan','Sekretaris Umum','assets/img/pengurus/bph/bagus-ardhiawan.jpg'],
        ['Maria Roida Tambunan','Wakil Sekretaris 2','assets/img/pengurus/bph/maria-roida-tambunan.png'],
        ['Nur Dian Utami','Bendahara Umum','assets/img/pengurus/bph/nur-dian-utami.jpeg'],
        ['Putri Kusumaningtiyas','Wakil Bendahara 1','assets/img/pengurus/bph/putri-kusumaningtiyas.jpg'],
        ['Nabillah Ayu Andini','Wakil Bendahara 2','assets/img/pengurus/bph/nabillah-ayu-andini.webp'],
      ]],
      ['Seksi Hubungan Masyarakat (Humas)','humas',2,[
        ['Ardian Ramadhani','Anggota Humas','assets/img/pengurus/humas/ardian-ramadhani.jpeg'],
        ['Dimas Algifari','Anggota Humas','assets/img/pengurus/humas/dimas-algifari.png'],
        ['Farhan Wibowo','Anggota Humas','assets/img/pengurus/humas/farhan-wibowo.jpg'],
        ['Hafizam Swary Alfachrizy','Anggota Humas','assets/img/pengurus/humas/hafizam-swary-alfachrizy.png'],
        ['Muhamd Reivaldy','Anggota Humas','assets/img/pengurus/humas/muhamd-reivaldy.heif'],
        ['Shafira Syabania','Anggota Humas','assets/img/pengurus/humas/shafira-syabania.jpg'],
      ]],
      ['Seksi Kerohanian & Bimbingan Mental','kerohanian',3,[
        ['M. Miftahul Chair','Anggota Seksi','assets/img/pengurus/kerohanian/m-miftahul-chair.jpg'],
        ['Muhammad Faishal Rahman','Anggota Seksi','assets/img/pengurus/kerohanian/muhammad-faishal-rahman.jpeg'],
      ]],
      ['Seksi Kesejahteraan Sosial & UMKM','kessos-umkm',4,[
        ['Mellody chintya Inez','Anggota Seksi','assets/img/pengurus/kessos-umkm/mellody-chintya-inez.jpg'],
        ['Muhammad Harun','Anggota Seksi','assets/img/pengurus/kessos-umkm/muhammad-harun.jpg'],
        ['Yadhie Karyadi utama','Anggota Seksi','assets/img/pengurus/kessos-umkm/yadhie-karyadi-utama.jpg'],
      ]],
      ['Seksi Kesekretariatan & Lingkungan Hidup','klh',5,[
        ['Abdul Husen','Anggota Seksi','assets/img/pengurus/klh/abdul-husen.jpg'],
        ['Aji Febriyanto','Anggota Seksi','assets/img/pengurus/klh/aji-febriyanto.jpg'],
        ['Ariani Alzahwa Mawa','Anggota Seksi','assets/img/pengurus/klh/ariani-alzahwa-mawa.jpg'],
        ['Elizabet Natalia Tambunan','Anggota Seksi','assets/img/pengurus/klh/elizabet-natalia-tambunan.png'],
        ['Muhammad elliyas','Anggota Seksi','assets/img/pengurus/klh/muhammad-elliyas.jpg'],
      ]],
      ['Seksi Pendidikan, Pelatihan & Perempuan Anak (P3A)','p3a',6,[
        ['Azizah Chairulishafa','Anggota Seksi','assets/img/pengurus/p3a/azizah-chairulishafa.jpg'],
      ]],
      ['Seksi Seni Budaya & Olahraga','sbo',7,[
        ['Danu Pangestu','Anggota Seksi','assets/img/pengurus/sbo/danu-pangestu.jpg'],
        ['Rafli Salim','Anggota Seksi','assets/img/pengurus/sbo/rafli-salim.jpg'],
        ['Robbyulloh Saputra','Anggota Seksi','assets/img/pengurus/sbo/robbyulloh-saputra.jpg'],
        ['gregorius pratama','Anggota Seksi','assets/img/pengurus/sbo/gregorius-pratama.png'],
      ]],
    ];
    const insSec = db.prepare('INSERT INTO sections(name,slug,sort_order) VALUES(?,?,?)');
    const insMem = db.prepare('INSERT INTO members(section_id,name,jabatan,photo,phone,bio,sort_order,is_active) VALUES(?,?,?,?,?,?,?,1)');
    for (const s of sections) {
      const res = insSec.run(s[0], s[1], s[2]);
      let i=1; for (const m of s[3]) insMem.run(Number(res.lastInsertRowid), m[0], m[1], m[2], '', '', i++);
    }
  }
  if (get('SELECT COUNT(*) as c FROM news').c === 0) {
    const ins = db.prepare('INSERT INTO news(title,slug,date,category,summary,content,image,is_published,is_highlight,author,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
    ins.run('Kerja Bakti Bersama Warga','kerja-bakti-bersama-warga','2026-11-12','Kegiatan','Anggota dan warga bergotong royong membersihkan lingkungan untuk menciptakan suasana yang lebih nyaman dan sehat.','Anggota dan warga bergotong royong membersihkan lingkungan untuk menciptakan suasana yang lebih nyaman dan sehat. (Contoh isi lengkap berita — silakan edit melalui panel admin.)','assets/img/kegiatan/dsc-0888.jpg',1,1,'Admin',1);
    ins.run('Acara Kebersamaan Pemuda','acara-kebersamaan-pemuda','2026-10-28','Berita','Kegiatan silaturahmi dan diskusi program kerja untuk memperkuat kolaborasi antar pemuda di lingkungan sekitar.','Kegiatan silaturahmi dan diskusi program kerja untuk memperkuat kolaborasi antar pemuda di lingkungan sekitar. (Contoh isi lengkap berita.)','assets/img/kegiatan/img-20250927-095125.jpg',1,1,'Admin',2);
    ins.run('Partisipasi Kegiatan Sosial','partisipasi-kegiatan-sosial','2026-10-15','Sosial','Karang Taruna turut serta dalam kegiatan sosial sebagai bentuk kepedulian dan kontribusi bagi masyarakat.','Karang Taruna turut serta dalam kegiatan sosial sebagai bentuk kepedulian dan kontribusi bagi masyarakat. (Contoh isi lengkap berita.)','assets/img/kegiatan/img-20260927-wa0185.jpg',1,1,'Admin',3);
  }
  if (get('SELECT COUNT(*) as c FROM schedules').c === 0) {
    const ins = db.prepare('INSERT INTO schedules(date,time_text,title,location,description,is_visible,sort_order) VALUES(?,?,?,?,?,?,?)');
    ins.run('2026-11-22','19.30 WIB - selesai','Rapat Koordinasi Pengurus','(Placeholder) Sekretariat Karang Taruna','Evaluasi program berjalan dan perencanaan kegiatan bulan berikutnya.',1,1);
    ins.run('2026-11-30','07.00 - 10.00 WIB','Kerja Bakti Lingkungan','(Placeholder) Lingkungan RT/RW setempat','Gotong royong membersihkan area lingkungan bersama warga dan pemuda.',1,2);
    ins.run('2026-12-05','16.00 - 18.00 WIB','Latihan Seni & Budaya','(Placeholder) Balai warga','Latihan rutin persiapan penampilan pada acara akhir tahun.',1,3);
    ins.run('2026-12-14','08.00 WIB - selesai','Bakti Sosial','(Placeholder) Titik kumpul disepakati','Kegiatan sosial untuk warga sekitar (detail menyusul).',1,4);
  }
  if (get('SELECT COUNT(*) as c FROM kas_transactions').c === 0) {
    const ins = db.prepare('INSERT INTO kas_transactions(date,description,type,amount,category,attachment) VALUES(?,?,?,?,?,?)');
    ins.run('2026-11-01','Iuran anggota bulan November','pemasukan',1000000,'Iuran Anggota','');
    ins.run('2026-11-05','Donasi kegiatan sosial','pemasukan',1000000,'Donasi','');
    ins.run('2026-11-10','Konsumsi rapat & kegiatan','pengeluaran',300000,'Operasional','');
    ins.run('2026-11-15','Perlengkapan kerja bakti','pengeluaran',450000,'Kerja Bakti Nov 2026','');
  }
  if (get('SELECT COUNT(*) as c FROM gallery').c === 0) {
    const ins = db.prepare('INSERT INTO gallery(image,caption,sort_order) VALUES(?,?,?)');
    [['assets/img/kegiatan/img-20260315-wa0029.jpg','Dokumentasi kegiatan 1',1],
     ['assets/img/kegiatan/img-20260628-wa0053.jpg','Dokumentasi kegiatan 2',2],
     ['assets/img/kegiatan/img-20260927-wa0296.jpg','Dokumentasi kegiatan 3',3],
     ['assets/img/kegiatan/img-20260927-wa0322.jpg','Dokumentasi kegiatan 4',4]].forEach(g=>ins.run(...g));
  }
}

function getSetting(key) {
  const row = get('SELECT value FROM settings WHERE key = ?', key);
  if (row && row.value != null && row.value !== '') return row.value;
  return defaults[key] ?? '';
}
function setSetting(key, value) { run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, String(value ?? '')); }

function adminsCount() { try { return get('SELECT COUNT(*) as c FROM admins').c; } catch { return 0; } }

module.exports = { db, init, seedIfNeeded, all, get, run, defaults, getSetting, setSetting, adminsCount };
