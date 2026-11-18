const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const router = express.Router();
const { all, get, run, adminsCount, getSetting, setSetting } = require('../db');
const { requireLogin, redirectIfAuthed } = require('../middleware/auth');
const { uploader } = require('../middleware/upload');
const { slugify, ensureUniqueSlug } = require('../utils');

function flash(req, msg, type='success'){ req.session.flash = { msg, type }; }
function wantLogin(req,res,next){ if(adminsCount()===0) return res.redirect('/admin/setup'); next(); }

// SETUP (first admin)
router.get('/setup', redirectIfAuthed, (req, res) => {
  if (adminsCount() > 0) return res.redirect('/admin/login');
  res.render('admin/setup', { title: 'Setup Admin', error: null, values: {} });
});
router.post('/setup', (req, res) => {
  if (adminsCount() > 0) return res.redirect('/admin/login');
  const { username='', email='', password='', password2='' } = req.body;
  let error = null;
  if (!username || !email || !password) error = 'Semua field wajib diisi.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = 'Email tidak valid.';
  else if (password.length < 6) error = 'Password minimal 6 karakter.';
  else if (password !== password2) error = 'Konfirmasi password tidak cocok.';
  if (error) return res.render('admin/setup', { title: 'Setup Admin', error, values: {username,email} });
  const hash = bcrypt.hashSync(password, 10);
  const info = run('INSERT INTO admins(username,email,password_hash) VALUES(?,?,?)', username.trim(), email.trim(), hash);
  req.session.adminId = Number(info.lastInsertRowid);
  res.redirect('/admin');
});

// LOGIN
router.get('/login', redirectIfAuthed, wantLogin, (req, res) => {
  res.render('admin/login', { title: 'Login Admin', error: null, login: '' });
});
router.post('/login', wantLogin, (req, res) => {
  const { login='', password='' } = req.body;
  const u = get('SELECT * FROM admins WHERE username=? OR email=? LIMIT 1', login, login);
  if (u && bcrypt.compareSync(password, u.password_hash)) {
    req.session.adminId = u.id;
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: 'Login Admin', error: 'Username/email atau password salah.', login });
});
router.get('/logout', (req, res) => { req.session.destroy(()=>res.redirect('/')); });

// DASHBOARD
router.get('/', requireLogin, (req, res) => {
  const counts = {
    'Berita': get('SELECT COUNT(*) c FROM news').c,
    'Anggota Aktif': get('SELECT COUNT(*) c FROM members WHERE is_active=1').c,
    'Jadwal': get('SELECT COUNT(*) c FROM schedules').c,
    'Transaksi Kas': get('SELECT COUNT(*) c FROM kas_transactions').c,
    'Galeri': get('SELECT COUNT(*) c FROM gallery').c,
    'Seksi': get('SELECT COUNT(*) c FROM sections').c,
  };
  const saldo = get("SELECT COALESCE(SUM(CASE WHEN type='pemasukan' THEN amount ELSE -amount END),0) s FROM kas_transactions").s || 0;
  res.render('admin/dashboard', { title: 'Dashboard', active: 'dashboard', counts, saldo });
});

// PASSWORD
router.get('/password', requireLogin, (req, res) => res.render('admin/password', { title:'Ganti Password', active:'', error:null }));
router.post('/password', requireLogin, (req, res) => {
  const { old_password='', new_password='', new_password2='' } = req.body;
  const u = get('SELECT * FROM admins WHERE id=?', req.session.adminId);
  let error=null;
  if (!u || !bcrypt.compareSync(old_password, u.password_hash)) error='Password lama salah.';
  else if (new_password.length < 6) error='Password baru minimal 6 karakter.';
  else if (new_password !== new_password2) error='Konfirmasi password baru tidak cocok.';
  if (error) return res.render('admin/password', { title:'Ganti Password', active:'', error });
  run('UPDATE admins SET password_hash=? WHERE id=?', bcrypt.hashSync(new_password,10), u.id);
  flash(req,'Password berhasil diubah.'); res.redirect('/admin/password');
});

// ACCOUNTS
router.get('/accounts', requireLogin, (req, res) => {
  const rows = all('SELECT id,username,email,created_at FROM admins ORDER BY id ASC');
  res.render('admin/accounts', { title:'Akun Admin', active:'accounts', rows, form: req.query.action==='add'?'add':null, error:null, values:{} });
});
router.post('/accounts', requireLogin, (req, res) => {
  const form = req.body.form;
  if (form === 'add') {
    const { username='', email='', password='' } = req.body;
    let error=null;
    if(!username||!email||!password) error='Semua field wajib diisi.';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error='Email tidak valid.';
    else if(password.length<6) error='Password minimal 6 karakter.';
    if(error){ const rows=all('SELECT id,username,email,created_at FROM admins ORDER BY id ASC'); return res.render('admin/accounts',{title:'Akun Admin',active:'accounts',rows,form:'add',error,values:{username,email}}); }
    try {
      run('INSERT INTO admins(username,email,password_hash) VALUES(?,?,?)', username.trim(), email.trim(), bcrypt.hashSync(password,10));
      flash(req,'Akun admin ditambahkan.');
    } catch(e){ const rows=all('SELECT id,username,email,created_at FROM admins ORDER BY id ASC'); return res.render('admin/accounts',{title:'Akun Admin',active:'accounts',rows,form:'add',error:'Gagal menambah (mungkin username/email sudah dipakai).',values:{username,email}}); }
  } else if (form === 'delete') {
    const del = Number(req.body.id);
    if (del === req.session.adminId) flash(req,'Tidak bisa menghapus akun yang sedang login.','error');
    else if (adminsCount() <= 1) flash(req,'Minimal harus ada satu akun admin.','error');
    else { run('DELETE FROM admins WHERE id=?', del); flash(req,'Akun admin dihapus.'); }
  }
  res.redirect('/admin/accounts');
});

// BERITA
const upBerita = uploader('berita', { allowed:['.jpg','.jpeg','.png','.webp','.gif'] });
router.get('/berita', requireLogin, (req, res) => {
  const action = req.query.action || 'list'; const id = Number(req.query.id||0);
  let editRow=null; if(action==='edit' && id) editRow=get('SELECT * FROM news WHERE id=?', id);
  const rows = all('SELECT * FROM news ORDER BY sort_order ASC, date DESC, id DESC');
  res.render('admin/berita', { title:'Berita', active:'berita', action: editRow?'edit':(action==='add'?'add':'list'), editRow, rows, error:null });
});
router.post('/berita', requireLogin, upBerita.single('image'), (req, res) => {
  const form = req.body.form;
  if (form === 'delete') { run('DELETE FROM news WHERE id=?', Number(req.body.id)); flash(req,'Berita dihapus.'); return res.redirect('/admin/berita'); }
  if (form === 'save') {
    const id = Number(req.body.id||0);
    const title = (req.body.title||'').trim();
    if(!title){ flash(req,'Judul wajib diisi.','error'); return res.redirect('/admin/berita'); }
    const slug = ensureUniqueSlug((s,ex)=> get('SELECT id FROM news WHERE slug=?'+(ex?' AND id<>?':''), ...(ex?[s,ex]:[s])), req.body.slug||title, id||null);
    const data = {
      title, slug,
      date: req.body.date||null, category: req.body.category||'', summary: req.body.summary||'', content: req.body.content||'',
      is_published: req.body.is_published?1:0, is_highlight: req.body.is_highlight?1:0,
      author: req.body.author||'', sort_order: parseInt(req.body.sort_order||'0',10)||0
    };
    let image = null; if (req.file) image = 'uploads/berita/' + req.file.filename;
    if (id) {
      if (image) run(`UPDATE news SET title=?,slug=?,date=?,category=?,summary=?,content=?,is_published=?,is_highlight=?,author=?,sort_order=?,image=? WHERE id=?`, data.title,data.slug,data.date,data.category,data.summary,data.content,data.is_published,data.is_highlight,data.author,data.sort_order,image,id);
      else run(`UPDATE news SET title=?,slug=?,date=?,category=?,summary=?,content=?,is_published=?,is_highlight=?,author=?,sort_order=? WHERE id=?`, data.title,data.slug,data.date,data.category,data.summary,data.content,data.is_published,data.is_highlight,data.author,data.sort_order,id);
    } else {
      run(`INSERT INTO news(title,slug,date,category,summary,content,image,is_published,is_highlight,author,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?)`, data.title,data.slug,data.date,data.category,data.summary,data.content,image||'',data.is_published,data.is_highlight,data.author,data.sort_order);
    }
    flash(req,'Berita disimpan.');
  }
  res.redirect('/admin/berita');
});

// JADWAL
router.get('/jadwal', requireLogin, (req, res) => {
  const action=req.query.action||'list'; const id=Number(req.query.id||0);
  let editRow=null; if(action==='edit'&&id) editRow=get('SELECT * FROM schedules WHERE id=?',id);
  const rows=all('SELECT * FROM schedules ORDER BY sort_order ASC, date ASC, id ASC');
  res.render('admin/jadwal',{title:'Jadwal',active:'jadwal',action:editRow?'edit':(action==='add'?'add':'list'),editRow,rows,error:null});
});
router.post('/jadwal', requireLogin, (req,res)=>{
  const form=req.body.form;
  if(form==='delete'){ run('DELETE FROM schedules WHERE id=?', Number(req.body.id)); flash(req,'Jadwal dihapus.'); return res.redirect('/admin/jadwal'); }
  if(form==='save'){
    const id=Number(req.body.id||0);
    const title=(req.body.title||'').trim(); if(!title){flash(req,'Nama kegiatan wajib diisi.','error'); return res.redirect('/admin/jadwal');}
    const d={date:req.body.date||null,time_text:req.body.time_text||'',title,location:req.body.location||'',description:req.body.description||'',is_visible:req.body.is_visible?1:0,sort_order:parseInt(req.body.sort_order||'0',10)||0};
    if(id) run('UPDATE schedules SET date=?,time_text=?,title=?,location=?,description=?,is_visible=?,sort_order=? WHERE id=?', d.date,d.time_text,d.title,d.location,d.description,d.is_visible,d.sort_order,id);
    else run('INSERT INTO schedules(date,time_text,title,location,description,is_visible,sort_order) VALUES(?,?,?,?,?,?,?)', d.date,d.time_text,d.title,d.location,d.description,d.is_visible,d.sort_order);
    flash(req,'Jadwal disimpan.');
  }
  res.redirect('/admin/jadwal');
});

// ANGGOTA & SECTIONS
const upMember = uploader('anggota', { allowed:['.jpg','.jpeg','.png','.webp','.gif','.heic','.heif'] });
router.get('/anggota', requireLogin, (req,res)=>{
  const action=req.query.action||'list'; const id=Number(req.query.id||0); const section_id=Number(req.query.section_id||0);
  let editSection=null, editMember=null;
  if(action==='edit_section'&&id) editSection=get('SELECT * FROM sections WHERE id=?',id);
  if(action==='edit_member'&&id) { editMember=get('SELECT * FROM members WHERE id=?',id); }
  const sections=all('SELECT * FROM sections ORDER BY sort_order ASC, id ASC');
  const membersBy={}; for(const s of sections) membersBy[s.id]=all('SELECT * FROM members WHERE section_id=? ORDER BY sort_order ASC, id ASC', s.id);
  res.render('admin/anggota',{title:'Anggota & Pengurus',active:'anggota',action,editSection,editMember,sections,membersBy,section_id,error:null});
});
router.post('/anggota', requireLogin, upMember.single('photo'), (req,res)=>{
  const form=req.body.form;
  try{
    if(form==='save_section'){
      const id=Number(req.body.id||0); const name=(req.body.name||'').trim(); if(!name) throw new Error('Nama seksi wajib diisi.');
      const slug=ensureUniqueSlug((s,ex)=>get('SELECT id FROM sections WHERE slug=?'+(ex?' AND id<>?':''), ...(ex?[s,ex]:[s])), req.body.slug||name, id||null);
      const sort=parseInt(req.body.sort_order||'0',10)||0;
      if(id) run('UPDATE sections SET name=?,slug=?,sort_order=? WHERE id=?', name,slug,sort,id); else run('INSERT INTO sections(name,slug,sort_order) VALUES(?,?,?)', name,slug,sort);
      flash(req,'Seksi/komponen disimpan.');
    } else if(form==='delete_section'){
      run('DELETE FROM sections WHERE id=?', Number(req.body.id)); flash(req,'Seksi/komponen dihapus.');
    } else if(form==='save_member'){
      const id=Number(req.body.id||0); const section_id=Number(req.body.section_id||0); const name=(req.body.name||'').trim();
      if(!name||!section_id){ flash(req,'Nama dan seksi wajib diisi.','error'); return res.redirect('/admin/anggota'); }
      const d={section_id,name,jabatan:req.body.jabatan||'',phone:req.body.phone||'',bio:req.body.bio||'',sort_order:parseInt(req.body.sort_order||'0',10)||0,is_active:req.body.is_active?1:0};
      const photo=req.file?('uploads/anggota/'+req.file.filename):null;
      if(id){
        if(photo) run('UPDATE members SET section_id=?,name=?,jabatan=?,phone=?,bio=?,sort_order=?,is_active=?,photo=? WHERE id=?', d.section_id,d.name,d.jabatan,d.phone,d.bio,d.sort_order,d.is_active,photo,id);
        else run('UPDATE members SET section_id=?,name=?,jabatan=?,phone=?,bio=?,sort_order=?,is_active=? WHERE id=?', d.section_id,d.name,d.jabatan,d.phone,d.bio,d.sort_order,d.is_active,id);
      } else {
        run('INSERT INTO members(section_id,name,jabatan,photo,phone,bio,sort_order,is_active) VALUES(?,?,?,?,?,?,?,?)', d.section_id,d.name,d.jabatan,photo||'',d.phone,d.bio,d.sort_order,d.is_active);
      }
      flash(req,'Anggota/pengurus disimpan.');
    } else if(form==='delete_member'){
      run('DELETE FROM members WHERE id=?', Number(req.body.id)); flash(req,'Anggota/pengurus dihapus.');
    }
  }catch(e){ flash(req,'Gagal menyimpan: '+e.message,'error'); }
  res.redirect('/admin/anggota');
});

// KAS
const upKas = uploader('kas', { allowed:['.jpg','.jpeg','.png','.webp','.gif','.pdf','.heic','.heif'] });
router.get('/kas', requireLogin, (req,res)=>{
  const action=req.query.action||'list'; const id=Number(req.query.id||0);
  const from=req.query.from||'', to=req.query.to||'', category=req.query.category||'';
  let editRow=null; if(action==='edit'&&id) editRow=get('SELECT * FROM kas_transactions WHERE id=?',id);
  const where=[]; const params=[];
  if(from){where.push('date >= ?');params.push(from);} if(to){where.push('date <= ?');params.push(to);} if(category){where.push('category = ?');params.push(category);} 
  const wsql=where.length?('WHERE '+where.join(' AND ')) : '';
  const rows=all(`SELECT * FROM kas_transactions ${wsql} ORDER BY date DESC, id DESC`, ...params);
  const sums=get(`SELECT COALESCE(SUM(CASE WHEN type='pemasukan' THEN amount ELSE 0 END),0) masuk, COALESCE(SUM(CASE WHEN type='pengeluaran' THEN amount ELSE 0 END),0) keluar FROM kas_transactions ${wsql}`, ...params)||{masuk:0,keluar:0};
  const cats=all("SELECT DISTINCT category FROM kas_transactions WHERE category<>'' ORDER BY category ASC").map(r=>r.category);
  res.render('admin/kas',{title:'Kas',active:'kas',action:editRow?'edit':(action==='add'?'add':'list'),editRow,rows,sums,cats,filters:{from,to,category},error:null});
});
router.post('/kas', requireLogin, upKas.single('attachment'), (req,res)=>{
  const form=req.body.form;
  if(form==='delete'){ run('DELETE FROM kas_transactions WHERE id=?', Number(req.body.id)); flash(req,'Transaksi dihapus.'); return res.redirect('/admin/kas'); }
  if(form==='save'){
    const id=Number(req.body.id||0);
    const description=(req.body.description||'').trim(); const type=req.body.type;
    let amt=String(req.body.amount||'0').replace(/Rp|\s/g,'').replace(/\./g,'').replace(',', '.');
    const amount=parseFloat(amt)||0;
    if(!description||!['pemasukan','pengeluaran'].includes(type)||amount<=0){ flash(req,'Data transaksi tidak valid (uraian, jenis, jumlah>0 wajib).','error'); return res.redirect('/admin/kas'+(id?('?action=edit&id='+id):'?action=add')); }
    const d={date:req.body.date||null,description,type,amount,category:req.body.category||''};
    const att=req.file?('uploads/kas/'+req.file.filename):null;
    if(id){
      if(att) run('UPDATE kas_transactions SET date=?,description=?,type=?,amount=?,category=?,attachment=? WHERE id=?', d.date,d.description,d.type,d.amount,d.category,att,id);
      else run('UPDATE kas_transactions SET date=?,description=?,type=?,amount=?,category=? WHERE id=?', d.date,d.description,d.type,d.amount,d.category,id);
    } else {
      run('INSERT INTO kas_transactions(date,description,type,amount,category,attachment) VALUES(?,?,?,?,?,?)', d.date,d.description,d.type,d.amount,d.category,att||'');
    }
    flash(req,'Transaksi kas disimpan.');
  }
  res.redirect('/admin/kas');
});

// GALERI
const upGal = uploader('galeri', { allowed:['.jpg','.jpeg','.png','.webp','.gif'] });
router.get('/galeri', requireLogin, (req,res)=>{
  const action=req.query.action||'list'; const id=Number(req.query.id||0);
  let editRow=null; if(action==='edit'&&id) editRow=get('SELECT * FROM gallery WHERE id=?',id);
  const rows=all('SELECT * FROM gallery ORDER BY sort_order ASC, id DESC');
  res.render('admin/galeri',{title:'Galeri',active:'galeri',action:editRow?'edit':(action==='add'?'add':'list'),editRow,rows,error:null});
});
router.post('/galeri', requireLogin, upGal.single('image'), (req,res)=>{
  const form=req.body.form;
  if(form==='delete'){ run('DELETE FROM gallery WHERE id=?', Number(req.body.id)); flash(req,'Foto galeri dihapus.'); return res.redirect('/admin/galeri'); }
  if(form==='save'){
    const id=Number(req.body.id||0); const caption=req.body.caption||''; const sort=parseInt(req.body.sort_order||'0',10)||0;
    const img=req.file?('uploads/galeri/'+req.file.filename):null;
    if(id){ if(img) run('UPDATE gallery SET image=?,caption=?,sort_order=? WHERE id=?', img,caption,sort,id); else run('UPDATE gallery SET caption=?,sort_order=? WHERE id=?', caption,sort,id); }
    else { if(!img){flash(req,'Foto wajib diunggah.','error'); return res.redirect('/admin/galeri?action=add');} run('INSERT INTO gallery(image,caption,sort_order) VALUES(?,?,?)', img,caption,sort); }
    flash(req,'Galeri disimpan.');
  }
  res.redirect('/admin/galeri');
});

// PENGATURAN
const upSet = uploader('umum', { allowed:['.jpg','.jpeg','.png','.webp','.gif'] });
router.get('/pengaturan', requireLogin, (req,res)=>{
  const keys=['site_name','tagline','hero_title','hero_lead','hero_image','profil_text','stat1_value','stat1_label','stat2_value','stat2_label','stat3_value','stat3_label','footer_about','address','phone','email','hours','wa_number','wa_template','social_instagram','social_facebook','social_youtube','social_tiktok','maps_embed','maps_link','logo','struktur_image','contact_note'];
  const vals={}; keys.forEach(k=>vals[k]=getSetting(k));
  res.render('admin/pengaturan',{title:'Pengaturan',active:'pengaturan',vals});
});
router.post('/pengaturan', requireLogin, upSet.fields([{name:'logo',maxCount:1},{name:'hero_image',maxCount:1},{name:'struktur_image',maxCount:1}]), (req,res)=>{
  const textKeys=['site_name','tagline','hero_title','hero_lead','profil_text','stat1_value','stat1_label','stat2_value','stat2_label','stat3_value','stat3_label','footer_about','address','phone','email','hours','wa_number','wa_template','social_instagram','social_facebook','social_youtube','social_tiktok','maps_embed','maps_link','contact_note'];
  textKeys.forEach(k=>setSetting(k, req.body[k]||''));
  for(const k of ['logo','hero_image','struktur_image']){
    if(req.files && req.files[k] && req.files[k][0]) setSetting(k, 'uploads/umum/'+req.files[k][0].filename);
  }
  flash(req,'Pengaturan disimpan.'); res.redirect('/admin/pengaturan');
});

module.exports = router;
