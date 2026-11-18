const express = require('express');
const session = require('express-session');
const path = require('path');
const { init, seedIfNeeded, adminsCount, getSetting, get } = require('./db');
const { formatRupiah, formatTanggalId } = require('./utils');

init();
seedIfNeeded();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  name: 'kt_admin',
  secret: process.env.SESSION_SECRET || 'karang-taruna-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// static
app.use(express.static(path.join(__dirname, 'public')));

// locals
app.use((req, res, next) => {
  res.locals.S = (k) => getSetting(k);
  res.locals.fmtRp = formatRupiah;
  res.locals.fmtDate = formatTanggalId;
  res.locals.e = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  res.locals.currentAdmin = null;
  if (req.session && req.session.adminId) {
    try { res.locals.currentAdmin = get('SELECT id,username,email,created_at FROM admins WHERE id=?', req.session.adminId); } catch { res.locals.currentAdmin = null; }
  }
  res.locals.flash = req.session ? req.session.flash : null;
  if (req.session) delete req.session.flash;
  res.locals.path = req.path;
  next();
});

// guard: if no admin, force setup for admin area (except setup)
app.use('/admin', (req, res, next) => {
  const count = adminsCount();
  if (count === 0 && req.path !== '/setup') return res.redirect('/admin/setup');
  if (count > 0 && req.path === '/setup') return res.redirect('/admin/login');
  next();
});

// routes
app.use('/', require('./routes/public'));
app.use('/admin', require('./routes/admin'));

// 404
app.use((req, res) => {
  res.status(404).render('public/404', { title: 'Tidak ditemukan', active: '' });
});

app.listen(PORT, () => {
  console.log(`Website Karang Taruna (Node.js) berjalan di http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin/login`);
});
