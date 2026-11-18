const { adminsCount } = require('../db');

function requireSetup(req, res, next) {
  if (adminsCount() === 0) {
    if (req.path !== '/setup') return res.redirect('/admin/setup');
  } else {
    if (req.path === '/setup') return res.redirect('/admin/login');
  }
  next();
}
function requireLogin(req, res, next) {
  if (adminsCount() === 0) return res.redirect('/admin/setup');
  if (!req.session || !req.session.adminId) return res.redirect('/admin/login');
  next();
}
function redirectIfAuthed(req, res, next) {
  if (req.session && req.session.adminId) return res.redirect('/admin');
  next();
}
module.exports = { requireSetup, requireLogin, redirectIfAuthed };
