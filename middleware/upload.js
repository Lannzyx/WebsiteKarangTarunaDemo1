const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeStorage(subdir) {
  const dir = path.join(__dirname, '..', 'public', 'uploads', subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const base = path.basename(file.originalname || 'file', ext).replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || 'file';
      cb(null, base + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6) + ext);
    }
  });
}
function uploader(subdir, opts={}) {
  const allowed = opts.allowed || ['.jpg','.jpeg','.png','.webp','.gif','.pdf','.heic','.heif'];
  return multer({
    storage: makeStorage(subdir),
    limits: { fileSize: opts.max || 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      if (allowed.includes(ext)) cb(null, true); else cb(null, false);
    }
  });
}
module.exports = { uploader };
