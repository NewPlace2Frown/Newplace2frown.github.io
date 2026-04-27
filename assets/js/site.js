// Minimal sidebar toggle. The old client-side nav loader is gone;
// Eleventy renders the sidebar at build time.
(() => {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay');
  if (!toggle || !sidebar || !overlay) return;

  const open = () => {
    sidebar.classList.add('open');
    overlay.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    sidebar.classList.remove('open');
    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
