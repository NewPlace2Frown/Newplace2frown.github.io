# Plan — The Shrine Easter Egg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Plan 01 + Plan 02 (through Task 16, content-complete portfolio with field-journal visual identity, dark mode, hierarchical nav). The Shrine builds on top.

**Goal:** Bring the existing `unlinked/board.html` Win98 chrome shrine into the live site as a discoverable easter egg. Visitors who find it can browse a draggable photo gallery (GALLERY.EXE), sign a real guestbook (Formspree-backed, manually moderated into a `guestbook.json` data file), read MEMORY.TXT, view-source the page in pastiche, and watch a hit counter. The Shrine is multi-trigger discoverable (Konami code, "frown" sequence, multiple page-load console messages) but never linked from the visible site.

**Architecture:**
- A new `/shrine/` route built into the Eleventy site (Nunjucks template + scoped Win98 CSS that doesn't bleed into the rest of the design system).
- A small global `easter-eggs.js` listens for triggers on every page and navigates to `/shrine/` when activated.
- Guestbook submissions go to Formspree → email to Leon → manual review → paste real entries into `src/_data/guestbook.json` → next build shows them on the Shrine. The form *also* writes to `localStorage` so the submitter immediately sees their note appear (until next build, when the real moderated version replaces it).
- A few additional easter eggs scattered through the site for delight, all in keeping with the minimal/elegant aesthetic on the surface and Win98 theatre on the Shrine.

**Tech Stack:** Eleventy 3, Nunjucks, vanilla CSS/JS (scoped), Formspree free tier, JSON data file as moderated content store.

---

## Pre-flight notes for the implementing agent

- **No npm packages added.** Easter eggs use vanilla DOM APIs.
- **Win98 CSS must be scoped** to `.shrine-stage` so it doesn't leak. The project's normal stylesheet shouldn't change colour, font, or anything when the Shrine is added.
- **Formspree endpoint** is acquired by the user (a free Formspree account is already created). The implementing agent asks for the endpoint URL at Task 5 and won't proceed without it.
- **Existing `unlinked/board.html` is preserved** — we *port* its content into Eleventy templates, but the original file stays put as a historical artefact.
- The image-viewing easter egg is **C** from the brainstorm: a self-contained "GALLERY.EXE" window inside the Shrine that browses the site's photographs Win98-style. Project-page images are NOT modified.
- **Discovery triggers:** Konami code (Up Up Down Down Left Right Left Right B A), typing "frown" as a key sequence anywhere on the site, plus a friendly homepage console hint.
- **Console banner** must use ASCII art that fits the field-journal aesthetic — restrained, monospace, no emojis.

---

## File structure

**Creates:**
```
src/
  shrine.njk                         # the Shrine page itself, /shrine/
  _data/
    guestbook.json                   # moderated entries, committed to repo
    shrineImages.js                  # gallery image list (built from project frontmatter)
assets/
  css/
    shrine.css                       # scoped Win98 styles, only loaded on /shrine/
  js/
    shrine.js                        # all Shrine page behaviour
    easter-eggs.js                   # global page listener for triggers
docs/
  superpowers/
    shrine-content.md                # MEMORY.TXT poem + moderation runbook
```

**Modifies:**
```
src/_includes/layouts/base.njk      # include /assets/js/easter-eggs.js on every page
src/_data/site.js                    # add formspreeEndpoint key (Task 5)
```

**Untouched:**
```
unlinked/board.html                  # the original — preserved
src/_includes/partials/sidebar.njk   # the Shrine is NOT in the sidebar
```

---

## Task 1: Easter-egg listeners on every page

**Files:**
- Create: `assets/js/easter-eggs.js`
- Modify: `src/_includes/layouts/base.njk`

The listeners run on every page. None of them visibly change the page. When triggered, they navigate to `/shrine/`.

- [ ] **Step 1: Write `assets/js/easter-eggs.js`**

```javascript
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
```

- [ ] **Step 2: Wire the script into base.njk**

Modify `src/_includes/layouts/base.njk`. The existing block of script tags currently reads:

```njk
  <script src="/assets/js/site.js" defer></script>
  <script src="/assets/js/theme.js" defer></script>
  <script src="/assets/js/logo.js" defer></script>
```

Insert the easter-eggs script between theme.js and logo.js, so the file becomes:

```njk
  <script src="/assets/js/site.js" defer></script>
  <script src="/assets/js/theme.js" defer></script>
  <script src="/assets/js/easter-eggs.js" defer></script>
  <script src="/assets/js/logo.js" defer></script>
```

- [ ] **Step 3: Build, smoke-test in dev**

```bash
npm run build
ls _site/assets/js/easter-eggs.js
```

Run `npm run dev`, open `http://localhost:8080/`. Open DevTools console. Expect to see the ASCII banner. Try the Konami code (or just type `frown` somewhere not in a form). Expect a navigation to `/shrine/` — which will 404 until Task 3 builds it.

- [ ] **Step 4: Commit**

```bash
git add assets/js/easter-eggs.js src/_includes/layouts/base.njk
git commit -m "feat(easter-eggs): global Konami + frown sequence + homepage console hint"
```

---

## Task 2: Scoped Win98 CSS for the Shrine

**Files:**
- Create: `assets/css/shrine.css`

Loaded only on `/shrine/`. Provides the Win98 chrome (teal background, draggable windows, raised/inset buttons, MS Sans Serif). Every selector scoped under `.shrine-stage` so nothing leaks.

- [ ] **Step 1: Write `assets/css/shrine.css`**

```css
/* Shrine — Win98 pastiche. Loaded only on /shrine/. All selectors scoped
   under .shrine-stage so this stylesheet doesn't bleed into the rest of the site. */

.shrine-stage {
  position: fixed;
  inset: 0;
  background: #008080;
  font-family: "MS Sans Serif", Tahoma, Geneva, sans-serif;
  font-size: 12px;
  color: #000;
  z-index: 1000;
  overflow: hidden;
}

.shrine-stage a       { color: #00f; text-decoration: underline; }
.shrine-stage a:visited { color: #800080; }

.shrine-stage .win {
  position: absolute;
  min-width: 240px;
  max-width: 480px;
  border: 2px solid #000;
  background: #c0c0c0;
  box-shadow: 2px 2px 0 #808080, inset 1px 1px 0 #fff;
  user-select: none;
}

.shrine-stage .title {
  background: linear-gradient(to right, #000080, #1084d0);
  color: #fff;
  padding: 3px 5px;
  font-weight: bold;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shrine-stage .btns { display: flex; gap: 2px; }
.shrine-stage .btns button {
  width: 18px;
  height: 16px;
  font-size: 10px;
  font-family: inherit;
  border: 1px solid #000;
  background: #c0c0c0;
  padding: 0;
  cursor: pointer;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080;
}
.shrine-stage .btns button:active {
  box-shadow: inset -1px -1px 0 #fff, inset 1px 1px 0 #808080;
}

.shrine-stage .content {
  background: #c0c0c0;
  padding: 8px 10px 10px;
  border-top: 2px solid #808080;
  user-select: text;
}

.shrine-stage .counter {
  position: fixed;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  background: #c0c0c0;
  padding: 4px 8px;
  border: 2px solid #000;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080;
  z-index: 50;
}

.shrine-stage .escape-hatch {
  position: fixed;
  bottom: 8px;
  left: 8px;
  font-size: 11px;
  background: #c0c0c0;
  padding: 4px 8px;
  border: 2px solid #000;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080;
  cursor: pointer;
  font-family: inherit;
  z-index: 50;
}

.shrine-stage .form-row { margin: 4px 0; }
.shrine-stage input[type="text"],
.shrine-stage input[type="email"],
.shrine-stage textarea {
  width: 100%;
  font-family: inherit;
  font-size: 12px;
  border: 2px solid #000;
  box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff;
  background: #fff;
  padding: 2px 4px;
  box-sizing: border-box;
}
.shrine-stage textarea { resize: vertical; min-height: 60px; }
.shrine-stage button.action {
  border: 2px solid #000;
  background: #c0c0c0;
  padding: 3px 12px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080;
}
.shrine-stage button.action:active {
  box-shadow: inset -1px -1px 0 #fff, inset 1px 1px 0 #808080;
}

.shrine-stage .entry {
  border: 2px solid #000;
  box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff;
  background: #fff;
  margin-bottom: 4px;
  padding: 5px 6px;
}
.shrine-stage .entry .who { font-weight: bold; }
.shrine-stage .entry .when { color: #555; font-size: 11px; }

.shrine-stage pre {
  margin: 0;
  font-family: "Courier New", "Lucida Console", monospace;
  white-space: pre-wrap;
}

.shrine-stage .gallery-frame {
  width: 320px;
  height: 220px;
  background: #000;
  border: 2px solid #000;
  box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.shrine-stage .gallery-frame img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}
.shrine-stage .gallery-controls {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  align-items: center;
}
.shrine-stage .gallery-caption {
  flex: 1;
  font-size: 11px;
  color: #000;
  padding: 0 4px;
  font-style: italic;
}

@media (max-width: 720px) {
  .shrine-stage .win { min-width: auto; max-width: calc(100vw - 24px); }
  .shrine-stage .gallery-frame { width: 240px; height: 180px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/css/shrine.css
git commit -m "feat(shrine): scoped Win98 stylesheet"
```

---

## Task 3: Shrine page template + image data + content

**Files:**
- Create: `src/_data/shrineImages.js`
- Create: `src/_data/guestbook.json`
- Create: `src/shrine.njk`
- Create: `docs/superpowers/shrine-content.md`

- [ ] **Step 1: Write `src/_data/shrineImages.js`**

This builds the gallery list from the project markdowns, reusing what's already curated.

```javascript
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, '..', 'projects');

export default async function () {
  const files = (await fs.readdir(projectsDir)).filter(f => f.endsWith('.md'));
  const all = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(projectsDir, f), 'utf8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    const titleMatch = fm.match(/^title:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : f;
    const imgRegex = /\{\s*src:\s*"([^"]+)"[^}]*?(?:caption:\s*"([^"]+)")?[^}]*\}/g;
    let m;
    while ((m = imgRegex.exec(fm)) !== null) {
      all.push({ src: m[1], caption: m[2] || '', series: title });
    }
  }
  return all;
}
```

- [ ] **Step 2: Write `src/_data/guestbook.json`** (seed entries)

```json
[
  {
    "name": "leon",
    "msg": "if you found this you found the shrine. welcome.",
    "t": "2026-04-28"
  },
  {
    "name": "anon",
    "msg": "the web was a field of fireflies",
    "t": "2026-04-28"
  }
]
```

- [ ] **Step 3: Write `src/shrine.njk`**

The template uses `layout: false` so it doesn't include the field-journal base — the Shrine takes over the whole viewport.

```njk
---
permalink: /shrine/
eleventyExcludeFromCollections: true
title: SHRINE OF LOST LINKS
layout: false
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>SHRINE OF LOST LINKS</title>
  <link rel="stylesheet" href="/assets/css/shrine.css">
</head>
<body>
<div class="shrine-stage" id="shrine">

  <div class="win" id="w-shrine" style="left: 40px; top: 40px;">
    <div class="title">SHRINE OF LOST LINKS
      <div class="btns">
        <button data-act="close">x</button>
        <button data-act="min">_</button>
      </div>
    </div>
    <div class="content">
      <p><i>Under construction... forever.</i></p>
      <p><a href="#" data-shrine="poem">Open MEMORY.TXT</a></p>
      <p><a href="#" data-shrine="gallery">Open GALLERY.EXE</a></p>
      <p><a href="#" data-shrine="source">View Source</a></p>
    </div>
  </div>

  <div class="win" id="w-guestbook" style="left: 320px; top: 100px;">
    <div class="title">GUESTBOOK
      <div class="btns">
        <button data-act="close">x</button>
        <button data-act="min">_</button>
      </div>
    </div>
    <div class="content">
      <form id="guestbook-form" autocomplete="off">
        <div class="form-row"><input type="text" name="name" id="gb-name" placeholder="handle" maxlength="24" required></div>
        <div class="form-row"><textarea name="msg" id="gb-msg" placeholder="leave a note" maxlength="280" required></textarea></div>
        <div style="position:absolute; left:-9999px;" aria-hidden="true">
          <label>Leave blank: <input type="text" name="_gotcha" tabindex="-1"></label>
        </div>
        <div class="form-row"><button type="submit" class="action">Sign</button></div>
      </form>
      <div id="gb-status" style="margin: 4px 0 6px; font-size: 11px;"></div>
      <div id="gb-entries"></div>
    </div>
  </div>

  <div class="counter" id="counter">visitors: 000000</div>
  <button class="escape-hatch" id="escape-hatch">[ escape to surface ]</button>

  <script id="gb-seed" type="application/json">{{ guestbook | dump | safe }}</script>
  <script id="gallery-seed" type="application/json">{{ shrineImages | dump | safe }}</script>
  <script>window.SHRINE_FORMSPREE_ENDPOINT = "{{ site.formspreeEndpoint or '' }}";</script>
</div>
<script src="/assets/js/shrine.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Write `docs/superpowers/shrine-content.md`**

```markdown
# Shrine content

## MEMORY.TXT (the poem opened by the easter-egg link)

Field-journal pastiche. Replace with whatever Leon wants.

    The web was a field of fireflies.
    Some burned out, some learned
    to be constellations.

    Some were grandmasters of nothing in particular.
    Some held quasars in their pockets.
    Some looked, briefly, like Malkovich.

    -- logged 2026

## Spam protection

Formspree free tier includes:
- honeypot via the `_gotcha` field name (already in the form)
- their built-in spam screen

If junk slips through, the moderation flow below catches it.

## Moderation flow

1. Visitor opens /shrine/, fills the GUESTBOOK form.
2. JS posts to Formspree -> Formspree's spam screen + honeypot filter.
3. If accepted, Leon receives an email at the address tied to the Formspree form.
4. The submitter sees their entry immediately (optimistic local render, marked
   "pending review", lives only in their localStorage until step 5).
5. Decide: real or junk?
   - Junk: ignore the email; the entry stays only in the submitter's browser.
   - Real: open `src/_data/guestbook.json`, prepend an object:
       { "name": "...", "msg": "...", "t": "YYYY-MM-DD" }
     Commit + push. Next GitHub Pages deploy makes the entry visible to everyone.

The pending render is intentionally distinct ("pending review" suffix) so
visitors don't think they were censored if they don't see their note publicly
right away.
```

- [ ] **Step 5: Build, smoke-test**

```bash
npm run build
```

Confirm `_site/shrine/index.html` exists. Open it in a browser. Expect: teal background, two draggable Win98 windows (no dragging behaviour yet — Task 4), no styling leaks from the field-journal CSS.

- [ ] **Step 6: Commit**

```bash
git add src/shrine.njk src/_data/shrineImages.js src/_data/guestbook.json docs/superpowers/shrine-content.md
git commit -m "feat(shrine): page template + image data + seeded guestbook + content notes"
```

---

## Task 4: Shrine behaviour — windows, MEMORY, view-source, hit counter, GALLERY.EXE

**Files:**
- Create: `assets/js/shrine.js`

Window dragging, the four spawnable windows (MEMORY, GALLERY, VIEW-SOURCE, plus the static GUESTBOOK and SHRINE OF LOST LINKS), the hit counter, and the guestbook form display. (Form submission is wired in Task 5.)

- [ ] **Step 1: Write `assets/js/shrine.js`**

```javascript
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
```

- [ ] **Step 2: Build, smoke-test**

```bash
npm run build
```

Open `_site/shrine/index.html`. Drag windows, click MEMORY.TXT (poem window pops), click GALLERY.EXE (gallery cycles project images on prev/next), click View Source, press Escape. Hit counter increments on reload.

The guestbook form will not submit yet — Task 5.

- [ ] **Step 3: Commit**

```bash
git add assets/js/shrine.js
git commit -m "feat(shrine): windows, MEMORY, view-source, GALLERY.EXE, hit counter"
```

---

## Task 5: Wire the guestbook to Formspree + manual moderation flow

**Files:**
- Modify: `src/_data/site.js`
- Modify: `assets/js/shrine.js`
- Modify: `docs/superpowers/shrine-content.md`

- [ ] **Step 1: Ask the user for the Formspree endpoint URL**

The agent does NOT proceed past this step without the URL. Tell the user:

> "Plan needs your Formspree form endpoint URL. In your Formspree dashboard, click into the form, copy the endpoint (looks like `https://formspree.io/f/xyzabc123`), and paste it here. I'll add it to `src/_data/site.js` so the build picks it up."

Wait for the response.

- [ ] **Step 2: Add the endpoint to `src/_data/site.js`**

Add a new key alongside the existing exports:

```javascript
  formspreeEndpoint: 'https://formspree.io/f/REPLACE_WITH_USER_PROVIDED_URL',
```

- [ ] **Step 3: Add the submit handler to `assets/js/shrine.js`**

Append at the bottom of the IIFE in `shrine.js`, just before the closing `})();`:

```javascript
  // ---------- Guestbook submission ----------
  const form = document.getElementById('guestbook-form');
  const status = document.getElementById('gb-status');
  if (form && status) {
    const endpoint = window.SHRINE_FORMSPREE_ENDPOINT;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('gb-name').value.trim() || 'anon';
      const msg  = document.getElementById('gb-msg').value.trim();
      if (!msg) return;
      const honey = form.querySelector('input[name="_gotcha"]');
      if (honey && honey.value) return; // bot

      status.textContent = 'sending...';
      try {
        if (!endpoint) throw new Error('no endpoint configured');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error('submission failed');
        let pending = [];
        try { pending = JSON.parse(localStorage.getItem('shrine_pending_entries') || '[]'); } catch {}
        pending.unshift({
          name, msg,
          t: new Date().toLocaleDateString('en-GB'),
          pending: true
        });
        pending = pending.slice(0, 5);
        localStorage.setItem('shrine_pending_entries', JSON.stringify(pending));
        document.getElementById('gb-msg').value = '';
        status.textContent = 'sent. yours appears immediately; everyone else sees it after review.';
        if (typeof window.__shrineRenderEntries === 'function') window.__shrineRenderEntries();
      } catch (err) {
        status.textContent = "sorry -- that didn't go through. try again later?";
      }
    });
  }
```

- [ ] **Step 4: Build, smoke-test**

```bash
npm run build
```

If the user wants to test live: run `npm run dev`, open `/shrine/`, sign the guestbook with a test entry. Confirm: status message appears, entry shows on the page marked `(pending review)`, an email lands in the user's inbox.

- [ ] **Step 5: Commit**

```bash
git add src/_data/site.js assets/js/shrine.js docs/superpowers/shrine-content.md
git commit -m "feat(shrine): guestbook to Formspree + moderation runbook"
```

---

## Task 6: A few additional small easter eggs for delight

**Files:**
- Modify: `assets/js/easter-eggs.js`
- Modify: `docs/superpowers/shrine-content.md`

Three additions, each ~10 lines, all on-brand:

1. **Triple-click on the wordmark** triggers a brief FROWN frenzy — rapid cycling through all variants for ~1.5s.
2. **Holding `Q` for 2 seconds** while on a project page logs a tiny "specimen note" to the console. Nod to "Q" for "quasar".
3. **Visiting between 00:00 and 00:59 local time** shows a small dateline at the top of the homepage: "the witching hour, on schedule".

- [ ] **Step 1: Append the three eggs to `assets/js/easter-eggs.js`**

Add at the bottom, inside the IIFE:

```javascript
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
```

- [ ] **Step 2: Document the eggs (private)**

Append to `docs/superpowers/shrine-content.md`:

```markdown
## Easter eggs reference (private)

| Trigger | Result |
|---|---|
| Konami code | navigate to /shrine/ |
| Type "frown" anywhere (not in a form) | navigate to /shrine/ |
| Console hint on homepage | passive log explaining /shrine/ |
| Triple-click the wordmark | brief FROWN frenzy |
| Hold Q on a project page for 2s | specimen note in browser console |
| Visit homepage between 00:00 and 00:59 | dateline appears at top of homepage |
```

- [ ] **Step 3: Build, smoke-test the eggs**

```bash
npm run build
```

Triple-click the wordmark on any page; observe the brief font frenzy. Visit `/projects/morecambe/`, hold `q` for 2 seconds; check the browser console.

- [ ] **Step 4: Commit**

```bash
git add assets/js/easter-eggs.js docs/superpowers/shrine-content.md
git commit -m "feat(easter-eggs): wordmark frenzy, project Q-hold, midnight dateline"
```

---

## Task 7: Final checkpoint with the user

**Files:** none.

- [ ] **Step 1: Run dev, walk this list**

```bash
npm run dev
```

| Check | Expected |
|---|---|
| Open `/`, look at console | ASCII banner with shrine hint |
| Konami code on `/` | navigates to `/shrine/` |
| Type `frown` (not in a form) | navigates to `/shrine/` |
| Triple-click wordmark | brief font frenzy |
| Visit `/projects/morecambe/`, hold `q` for 2s | specimen note logged to console |
| Open `/shrine/` directly | teal background, two windows visible |
| Drag a window | follows the cursor |
| Click MEMORY.TXT | poem window pops |
| Click GALLERY.EXE | gallery window with project images cycling |
| Click View Source | escaped source window pops |
| Sign the guestbook | optimistic local render appears, status message confirms send, email arrives |
| Press Escape | top window closes |
| Click "[ escape to surface ]" | navigates to `/` |
| Visit `/` outside the Shrine path | none of the Shrine CSS leaks into the field-journal layout |

- [ ] **Step 2: Surface to user**

> "The Shrine is implementation-complete. Three real things to do before declaring it shipped:
>
> 1. Test the guestbook end-to-end with a throwaway entry; confirm Formspree sends the email, then add the entry to `src/_data/guestbook.json` and push, then refresh `/shrine/` and confirm the entry appears as moderated.
> 2. Decide if you want me to add the easter-egg list to a private README, or keep it tribal knowledge.
> 3. The MEMORY.TXT poem is currently a placeholder I wrote. Drop me your real text and I'll swap it in."

---

## Self-review notes

- **Spec coverage:** all four user decisions met — image-viewing-as-self-contained-GALLERY (option C), guestbook with Formspree + manual moderation (option A), discovery via Konami + "frown" + console hint (option E), plus a small set of additional eggs the user explicitly invited.
- **Placeholder scan:** the only placeholder is `REPLACE_WITH_USER_PROVIDED_URL` in `site.js` and Task 5 explicitly asks the user for it before proceeding. Not a plan failure; intentional gate.
- **Type consistency:** `gb-seed` and `gallery-seed` script IDs match between template and JS. `data-act` and `data-gact` and `data-shrine` attribute names match between template and delegated handlers in `shrine.js`. `window.SHRINE_FORMSPREE_ENDPOINT` set in `shrine.njk`, read in `shrine.js`. `window.__shrineRenderEntries` exposed from `shrine.js`, called from the form submit handler. `localStorage` keys (`shrine_hits_v3`, `shrine_pending_entries`) prefixed and versioned.
- **Style isolation:** every selector in `shrine.css` is scoped under `.shrine-stage`. The Shrine page uses `layout: false` so it doesn't include the field-journal base, doesn't load `site.css`, and the regular pages don't load `shrine.css`. Zero leak surface.
- **Mobile:** the Shrine works on mobile but the joke is desktop-first. Drag is mouse-only; taps still close/min, the form still works. Acceptable for an easter egg.
- **Accessibility:** the Shrine is pastiche; reduced semantic value by design. Adds `<meta name="robots" content="noindex">`.
- **Failure modes:** if Formspree is down, the form catches the error and shows a friendly message; submitter's text isn't lost client-side. If JS is disabled, the Shrine doesn't function — acceptable for an easter egg.
