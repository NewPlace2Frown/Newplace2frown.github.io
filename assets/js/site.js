// Encapsulated helpers so they can be imported by tests without executing
// the browser-only bootstrap when required from Node.

// Normalize a pathname or href to a comparable form.
function normalizePath(p, base) {
  if(!p) return '/';
  try{
    // Resolve relative URLs against the provided base (or location.origin in browser)
    const resolved = new URL(p, base || (typeof location !== 'undefined' && location.origin) || 'http://example.com');
    let pathname = resolved.pathname || '/';
    if(pathname === '') pathname = '/';
    pathname = pathname.replace(/\/index\.html$/, '/');
    if(pathname.length > 1) pathname = pathname.replace(/\/$/, '');
    return pathname;
  }catch(e){
    return p;
  }
}

function highlightActiveLink(root, curLocation) {
  const sidebar = root || document.getElementById('sidebar');
  if(!sidebar) return;
  const links = sidebar.querySelectorAll('.nav-list a');
  if(!links) return;
  const currentPath = (curLocation && curLocation.pathname) || (typeof location !== 'undefined' && location.pathname) || '/';
  const cur = normalizePath(currentPath, (typeof location !== 'undefined' && location.origin) || 'http://example.com');
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    const ap = normalizePath(href, (typeof location !== 'undefined' && location.origin) || 'http://example.com');
    if(ap === cur) a.classList.add('active'); else a.classList.remove('active');
  });
}

function openFolderWithActiveLink(root, options){
  options = options || {};
  const sidebar = root || document.getElementById('sidebar');
  if(!sidebar) return;
  const active = sidebar.querySelector('.nav-list a.active');
  if(!active) return;
  if(options.closeSiblings){
    Array.from(sidebar.querySelectorAll('details')).forEach(d=>{ d.open = false });
  }
  let parent = active.parentElement;
  while(parent && parent !== sidebar){
    if(parent.tagName && parent.tagName.toLowerCase() === 'details') parent.open = true;
    parent = parent.parentElement;
  }
}

// Browser bootstrap. Keep original behavior when loaded in the browser via <script>.
if(typeof window !== 'undefined' && typeof document !== 'undefined'){
  document.addEventListener('DOMContentLoaded', function(){
    // prevent flicker while nav loads
    document.documentElement.classList.add('nav-loading');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('overlay');

    (async function loadNav(){
      const candidates = [
        'nav.html', './nav.html', '../nav.html', '../../nav.html', '../../../nav.html', '../../../../nav.html', '/nav.html'
      ];
      let html = null;
      for(const c of candidates){
        try{
          const r = await fetch(c);
          if(r.ok){ html = await r.text(); break; }
        }catch(e){ /* try next candidate */ }
      }
      if(!html){
        console.error('Navigation failed to load from any candidate path');
        if(sidebar) sidebar.innerHTML = '<p style="padding:12px;color:#f88">Navigation failed to load.</p>';
        document.documentElement.classList.remove('nav-loading');
        return;
      }
      if(sidebar) sidebar.innerHTML = html;
      // restore persisted state
      let persistedFolderIds = null;
      try{
        const open = localStorage.getItem('sidebar-open');
        if(open === 'true' && sidebar) sidebar.classList.add('open');
        const raw = localStorage.getItem('sidebar-open-folders');
        if(raw){
          const parsed = JSON.parse(raw);
          if(Array.isArray(parsed)) persistedFolderIds = parsed;
        }
        if(Array.isArray(persistedFolderIds) && persistedFolderIds.length && sidebar){
          persistedFolderIds.forEach(id => {
            try{
              const selector = (typeof CSS !== 'undefined' && CSS.escape) ? '#' + CSS.escape(id) : '#' + id;
              const el = sidebar.querySelector(selector);
              if(el && el.tagName && el.tagName.toLowerCase() === 'details') el.open = true;
            }catch(e){}
          });
        }
      }catch(e){ persistedFolderIds = null; }

      highlightActiveLink(sidebar);
      if(!Array.isArray(persistedFolderIds) || persistedFolderIds.length === 0) openFolderWithActiveLink(sidebar, {closeSiblings:true});

      const detailsEls = sidebar ? Array.from(sidebar.querySelectorAll('details')) : [];
      detailsEls.forEach(d => d.addEventListener('toggle', function(){
        try{
          const openIds = Array.from(sidebar.querySelectorAll('details'))
            .filter(x => x.open)
            .map(x => x.id)
            .filter(Boolean);
          localStorage.setItem('sidebar-open-folders', JSON.stringify(openIds));
        }catch(e){}
      }));

      document.documentElement.classList.remove('nav-loading');
    }());

    function openSidebar(){
      if(!sidebar) return;
      sidebar.classList.add('open');
      if(overlay) overlay.classList.add('show');
      if(toggle) toggle.setAttribute('aria-expanded','true');
      try{ localStorage.setItem('sidebar-open','true'); }catch(e){}
    }
    function closeSidebar(){
      if(!sidebar) return;
      sidebar.classList.remove('open');
      if(overlay) overlay.classList.remove('show');
      if(toggle) toggle.setAttribute('aria-expanded','false');
      try{ localStorage.setItem('sidebar-open','false'); }catch(e){}
    }

    if(toggle) toggle.addEventListener('click', function(){ if(sidebar && sidebar.classList.contains('open')) closeSidebar(); else openSidebar(); });
    if(overlay) overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSidebar(); });

    window.addEventListener('resize', function(){
      if(window.innerWidth > 800){
        if(sidebar) sidebar.classList.remove('open'); if(overlay) overlay.classList.remove('show'); if(toggle) toggle.setAttribute('aria-expanded','false');
      }
    });
  });
}

// Expose helpers for testing (and for consumers that import the module)
try{
  if(typeof module !== 'undefined') module.exports = { normalizePath, highlightActiveLink, openFolderWithActiveLink };
}catch(e){}
