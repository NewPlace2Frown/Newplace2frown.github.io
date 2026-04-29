// Global easter-egg listeners. Triggers navigate to /shrine/.
(() => {
  const SHRINE_PATH = '/shrine/';
  if (window.location.pathname.startsWith(SHRINE_PATH)) return;

  // ----- Konami code -----
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                  'b','a'];
  let konamiIdx = 0;
  window.addEventListener('keydown', (e) => {
    const want = KONAMI[konamiIdx];
    const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (got === want.toLowerCase()) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        window.location.href = SHRINE_PATH;
      }
    } else {
      konamiIdx = (got === KONAMI[0].toLowerCase()) ? 1 : 0;
    }
  });

  // ----- "frown" type-anywhere sequence -----
  const SEQ = 'frown';
  let seqBuf = '';
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key.length !== 1) { seqBuf = ''; return; }
    seqBuf = (seqBuf + e.key.toLowerCase()).slice(-SEQ.length);
    if (seqBuf === SEQ) {
      window.location.href = SHRINE_PATH;
    }
  });

  // ----- Console hint (homepage only, restrained, on-brand) -----
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const banner = [
      '',
      '  N E W   P L A C E   .   I I   .   F R O W N',
      '  ---------------------------------------------',
      '  specimen log / leon morgan',
      '',
      '  if you got this far you might enjoy',
      '  -> /shrine/   (or try the Konami code)',
      ''
    ].join('\n');
    console.log('%c' + banner, 'font-family: ui-monospace, monospace; color: #555; line-height: 1.4;');
  }

  // ----- Egg: triple-click wordmark for FROWN frenzy -----
  document.addEventListener('DOMContentLoaded', () => {
    const wordmark = document.querySelector('.logo-wordmark');
    if (!wordmark) return;
    let clicks = 0; let last = 0;
    wordmark.addEventListener('click', () => {
      const now = Date.now();
      if (now - last < 500) clicks += 1; else clicks = 1;
      last = now;
      if (clicks >= 3) {
        clicks = 0;
        const frown = wordmark.querySelector('.logo-frown');
        if (!frown) return;
        const variants = ['inter', 'serif', 'serif-up', null, 'inter', 'serif', null];
        let i = 0;
        const id = setInterval(() => {
          if (i >= variants.length) { clearInterval(id); delete frown.dataset.alt; return; }
          if (variants[i] == null) delete frown.dataset.alt;
          else frown.dataset.alt = variants[i];
          i += 1;
        }, 90);
      }
    });
  });

  // ----- Egg: hold Q for 2s on a project page -> specimen note in console -----
  (() => {
    if (!window.location.pathname.startsWith('/projects/')) return;
    let qHeld = false; let timer = null;
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'q' && e.key !== 'Q') return;
      if (qHeld) return;
      qHeld = true;
      timer = setTimeout(() => {
        const meta = document.querySelector('.project-meta');
        const title = document.querySelector('h1');
        if (meta && title) {
          console.log('%cSpecimen note', 'font-family: ui-monospace, monospace; font-weight: bold; color: #555;');
          console.log('%c' + title.textContent.trim(), 'font-family: ui-monospace, monospace; color: #111;');
          console.log('%c' + meta.textContent.replace(/\s+/g, ' ').trim(), 'font-family: ui-monospace, monospace; color: #555;');
        }
      }, 2000);
    });
    window.addEventListener('keyup', (e) => {
      if (e.key !== 'q' && e.key !== 'Q') return;
      qHeld = false;
      if (timer) { clearTimeout(timer); timer = null; }
    });
  })();

  // ----- Egg: midnight dateline -----
  (() => {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
    const now = new Date();
    if (now.getHours() !== 0) return;
    document.addEventListener('DOMContentLoaded', () => {
      const main = document.querySelector('.main');
      if (!main) return;
      const note = document.createElement('div');
      note.style.cssText = 'font-family: ui-monospace, monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); padding: 0 0 12px; opacity: 0; transition: opacity 800ms ease;';
      note.textContent = '-- the witching hour, on schedule --';
      main.prepend(note);
      requestAnimationFrame(() => { note.style.opacity = '1'; });
    });
  })();

})();
