// Website Karang Taruna - Interaksi dasar
(function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Tabs (Pengurus)
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-panel[data-panel]');
  if (tabButtons.length && tabPanels.length) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        tabButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panel = document.querySelector('.tab-panel[data-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  // WhatsApp popup
  const waBtn = document.getElementById('wa-float');
  const waPopup = document.getElementById('wa-popup');
  const waClose = document.getElementById('wa-close');
  function closeWa() { if (waPopup) waPopup.classList.remove('open'); }
  if (waBtn && waPopup) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      waPopup.classList.toggle('open');
    });
  }
  if (waClose) waClose.addEventListener('click', closeWa);
  document.addEventListener('click', (e) => {
    if (!waPopup || !waPopup.classList.contains('open')) return;
    if (waPopup.contains(e.target) || (waBtn && waBtn.contains(e.target))) return;
    closeWa();
  });

  // Contact form demo/placeholder helper
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const action = contactForm.getAttribute('action') || '';
      if (action.includes('example.com') || action.trim() === '' || action === '#') {
        e.preventDefault();
        alert('Form ini masih placeholder. Silakan atur alamat email/layanan form (lihat komentar di HTML) agar pesan dapat terkirim.');
      }
      // jika action sudah diisi layanan form/email yang valid, biarkan submit normal
    });
  }
})();
