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
})();
