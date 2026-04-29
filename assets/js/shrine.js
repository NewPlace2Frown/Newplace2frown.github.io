// Shrine behaviour. Scoped to elements inside .shrine-stage; runs after DOMContentLoaded.
(() => {
  const stage = document.getElementById('shrine');
  if (!stage) return;

  // ---------- z-order ----------
  let zCounter = 10;
  const bringToFront = (win) => { zCounter += 1; win.style.zIndex = zCounter; };

  // ---------- Drag ----------
  const makeDraggable = (win) => {
    const header = win.querySelector('.title');
    if (!header) return;
    let ox = 0, oy = 0, dragging = false;
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      dragging = true;
      ox = e.clientX - win.offsetLeft;
      oy = e.clientY - win.offsetTop;
      bringToFront(win);
    });
    win.addEventListener('mousedown', () => bringToFront(win));
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      win.style.left = (e.clientX - ox) + 'px';
      win.style.top  = (e.clientY - oy) + 'px';
    });
  };
  stage.querySelectorAll('.win').forEach(makeDraggable);

  // ---------- Title-bar buttons (delegated) ----------
  stage.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const win = btn.closest('.win');
    if (!win) return;
    if (btn.dataset.act === 'close') win.remove();
    if (btn.dataset.act === 'min') {
      const c = win.querySelector('.content');
      c.style.display = (c.style.display === 'none') ? 'block' : 'none';
    }
  });

  // ---------- Spawnable window helper ----------
  const spawnWindow = ({ title, body, left = 140, top = 160 }) => {
    const win = document.createElement('div');
    win.className = 'win';
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    win.innerHTML = `
      <div class="title">${title}
        <div class="btns">
          <button data-act="close">x</button>
          <button data-act="min">_</button>
        </div>
      </div>
      <div class="content">${body}</div>
    `;
    stage.appendChild(win);
    makeDraggable(win);
    bringToFront(win);
    return win;
  };

  // ---------- MEMORY.TXT ----------
  const spawnPoem = () => {
    const body = `<pre>The web was a field of fireflies.
Some burned out, some learned
to be constellations.

Some were grandmasters of nothing in particular.
Some held quasars in their pockets.
Some looked, briefly, like Malkovich.

-- logged 2026</pre>`;
    spawnWindow({ title: 'MEMORY.TXT', body, left: 100, top: 220 });
  };

  // ---------- View-source ----------
  const openSource = () => {
    const src = document.documentElement.outerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const body = `<pre style="max-height:240px; overflow:auto;">${src}</pre>`;
    spawnWindow({ title: 'VIEW-SOURCE', body, left: 200, top: 260 });
  };

  // ---------- GALLERY.EXE ----------
  let galleryIdx = 0;
  let galleryImages = [];
  try {
    galleryImages = JSON.parse(document.getElementById('gallery-seed').textContent);
  } catch { galleryImages = []; }

  const renderGalleryAt = (win, i) => {
    if (galleryImages.length === 0) return;
    const safeI = ((i % galleryImages.length) + galleryImages.length) % galleryImages.length;
    galleryIdx = safeI;
    const img = galleryImages[safeI];
    const frame = win.querySelector('.gallery-frame img');
    const caption = win.querySelector('.gallery-caption');
    const counter = win.querySelector('.gallery-counter');
    frame.src = img.src;
    frame.alt = img.caption || img.series || '';
    caption.textContent = img.caption ? `${img.caption} - ${img.series}` : img.series;
    counter.textContent = `${safeI + 1}/${galleryImages.length}`;
  };

  const openGallery = () => {
    if (galleryImages.length === 0) {
      spawnWindow({ title: 'GALLERY.EXE', body: '<p>no images available.</p>', left: 80, top: 280 });
      return;
    }
    const body = `
      <div class="gallery-frame"><img src="" alt=""></div>
      <div class="gallery-controls">
        <button class="action" data-gact="prev">&lsaquo; prev</button>
        <span class="gallery-counter"></span>
        <button class="action" data-gact="next">next &rsaquo;</button>
        <span class="gallery-caption"></span>
      </div>
    `;
    const win = spawnWindow({ title: 'GALLERY.EXE', body, left: 80, top: 280 });
    win.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-gact]');
      if (!b) return;
      renderGalleryAt(win, b.dataset.gact === 'prev' ? galleryIdx - 1 : galleryIdx + 1);
    });
    renderGalleryAt(win, 0);
  };

  // ---------- Action link router (the SHRINE OF LOST LINKS items) ----------
  stage.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-shrine]');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.shrine === 'poem') spawnPoem();
    if (a.dataset.shrine === 'gallery') openGallery();
    if (a.dataset.shrine === 'source') openSource();
  });

  // ---------- Escape hatch ----------
  const hatch = document.getElementById('escape-hatch');
  if (hatch) hatch.addEventListener('click', () => { window.location.href = '/'; });

  // ---------- Hit counter (per-browser, keeps the period feel) ----------
  (() => {
    const k = 'shrine_hits_v3';
    const n = parseInt(localStorage.getItem(k) || '0', 10) + 1;
    localStorage.setItem(k, String(n));
    const el = document.getElementById('counter');
    if (el) el.textContent = 'visitors: ' + String(n).padStart(6, '0');
  })();

  // ---------- Guestbook entries (rendering) ----------
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  const LOCAL_KEY = 'shrine_pending_entries';
  const renderEntries = () => {
    const wrap = document.getElementById('gb-entries');
    if (!wrap) return;
    let seeded = [];
    try { seeded = JSON.parse(document.getElementById('gb-seed').textContent || '[]'); } catch {}
    let pending = [];
    try { pending = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch {}
    const all = [...pending, ...seeded].slice(0, 8);
    wrap.innerHTML = all.map(e => `
      <div class="entry">
        <div><span class="who">${escapeHTML(e.name || 'anon')}</span>
          <span class="when">${escapeHTML(e.t || '')}</span>${e.pending ? ' <em>(pending review)</em>' : ''}</div>
        <div>${escapeHTML(e.msg || '')}</div>
      </div>
    `).join('');
  };
  renderEntries();
  window.__shrineRenderEntries = renderEntries;

  // ---------- Esc closes the topmost window ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const wins = [...stage.querySelectorAll('.win')];
      if (wins.length === 0) return;
      wins.sort((a, b) => (parseInt(b.style.zIndex || '0', 10)) - (parseInt(a.style.zIndex || '0', 10)));
      wins[0].remove();
    }
  });
})();
