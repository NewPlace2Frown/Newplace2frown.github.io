// System-aware theme toggle. Order of precedence:
// 1. localStorage override (set by user clicking the toggle)
// 2. prefers-color-scheme media query
// 3. light (default)
//
// We apply the theme attribute as early as possible to avoid a flash.
// The inline pre-paint script in base.njk sets [data-theme] before stylesheet runs;
// this file wires the toggle button.
(() => {
  const STORAGE_KEY = 'npf-theme';

  const getStoredTheme = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };
  const setStoredTheme = (t) => {
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  };
  const apply = (t) => { document.documentElement.setAttribute('data-theme', t); };

  // If no stored preference, follow system; respond to system changes live.
  if (!getStoredTheme() && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      if (!getStoredTheme()) apply(e.matches ? 'dark' : 'light');
    });
  }

  const button = document.getElementById('themeToggle');
  if (!button) return;
  button.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    apply(next);
    setStoredTheme(next);
  });
})();
