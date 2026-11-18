const path = require('path');
const crypto = require('crypto');

function slugify(text) {
  return String(text || '').toLowerCase().trim()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}
function formatRupiah(amount) {
  const n = Math.round(Number(amount) || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
const bulan = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function formatTanggalId(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  return `${parseInt(m[3],10)} ${bulan[parseInt(m[2],10)]||m[2]} ${m[1]}`;
}
function saveUpload(file, subdir) {
  // file already saved by multer to dest; return relative public path
  if (!file) return '';
  return 'uploads/' + subdir + '/' + path.basename(file.filename);
}
function ensureUniqueSlug(getExisting, base, excludeId=null) {
  let slug = slugify(base), s = slug, i = 2;
  while (true) {
    const row = getExisting(s, excludeId);
    if (!row) return s;
    s = slug + '-' + i++;
  }
}
module.exports = { slugify, formatRupiah, formatTanggalId, saveUpload, ensureUniqueSlug };
