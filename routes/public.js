const express = require('express');
const router = express.Router();
const { all, get } = require('../db');

router.get('/', (req, res) => {
  const news = all("SELECT * FROM news WHERE is_published=1 ORDER BY is_highlight DESC, sort_order ASC, date DESC, id DESC LIMIT 3");
  const schedules = all("SELECT * FROM schedules WHERE is_visible=1 ORDER BY date ASC, sort_order ASC, id ASC LIMIT 2");
  const gallery = all("SELECT * FROM gallery ORDER BY sort_order ASC, id DESC LIMIT 8");
  res.render('public/index', { title: 'Beranda', active: 'index', news, schedules, gallery });
});

router.get('/anggota', (req, res) => {
  const sections = all('SELECT * FROM sections ORDER BY sort_order ASC, id ASC');
  const membersBy = {};
  for (const s of sections) membersBy[s.id] = all('SELECT * FROM members WHERE section_id=? AND is_active=1 ORDER BY sort_order ASC, id ASC', s.id);
  res.render('public/anggota', { title: 'Anggota & Pengurus', active: 'anggota', sections, membersBy });
});

router.get('/jadwal', (req, res) => {
  const rows = all('SELECT * FROM schedules WHERE is_visible=1 ORDER BY date ASC, sort_order ASC, id ASC');
  const today = new Date().toISOString().slice(0,10);
  let upcoming = rows.filter(r => !r.date || r.date >= today);
  if (upcoming.length === 0) upcoming = rows.slice();
  res.render('public/jadwal', { title: 'Jadwal Kegiatan', active: 'jadwal', rows, upcoming: upcoming.slice(0,6) });
});

router.get('/kas', (req, res) => {
  const { from='', to='', category='' } = req.query;
  const where=[]; const params=[];
  if (from) { where.push('date >= ?'); params.push(from); }
  if (to) { where.push('date <= ?'); params.push(to); }
  if (category) { where.push('category = ?'); params.push(category); }
  const wsql = where.length ? ('WHERE ' + where.join(' AND ')) : '';
  const rows = all(`SELECT * FROM kas_transactions ${wsql} ORDER BY date DESC, id DESC`, ...params);
  const sums = get(`SELECT 
    COALESCE(SUM(CASE WHEN type='pemasukan' THEN amount ELSE 0 END),0) as masuk,
    COALESCE(SUM(CASE WHEN type='pengeluaran' THEN amount ELSE 0 END),0) as keluar
    FROM kas_transactions ${wsql}`, ...params) || {masuk:0,keluar:0};
  const cats = all("SELECT DISTINCT category FROM kas_transactions WHERE category <> '' ORDER BY category ASC").map(r=>r.category);
  res.render('public/kas', { title: 'Kas', active: 'kas', rows, sums, cats, filters: {from,to,category} });
});

router.get('/kontak', (req, res) => {
  const waNum = String(getSettingOr('wa_number')).replace(/\D+/g,'');
  res.render('public/kontak', { title: 'Kontak', active: 'kontak' });
});
function getSettingOr(k){ const { getSetting } = require('../db'); return getSetting(k); }

router.get('/berita', (req, res) => {
  const slug = req.query.slug || '';
  if (!slug) {
    const rows = all("SELECT * FROM news WHERE is_published=1 ORDER BY sort_order ASC, date DESC, id DESC");
    return res.render('public/berita_list', { title: 'Berita', active: '', rows });
  }
  const n = get("SELECT * FROM news WHERE slug=? AND is_published=1 LIMIT 1", slug);
  if (!n) return res.status(404).render('public/404', { title: 'Berita tidak ditemukan', active: '' });
  res.render('public/berita_detail', { title: n.title, active: '', n });
});

module.exports = router;
