# Plan 02 — Content Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Plan 01 complete and visually approved. The Eleventy scaffold, base layout, sidebar, and reference Morecambe project must already exist and render.

**Goal:** Port all remaining content from the old static HTML site into the new Eleventy structure — homepage with stronger hero, About, Contact, the curated Work page, the Projects index and remaining project pages, the Journal scaffold — and retire the old HTML files. Add three feature additions surfaced after Plan 01's visual checkpoint: a hierarchical Projects sub-nav in the sidebar, a Subsurface Territories link in the socials list, a darker/richer hero treatment, more bestiary-style detail on project metadata, and a system-aware dark-mode toggle. After this plan, every nav item resolves to a real page and the site is content-complete except for the Prints/Buy Button funnel (Plan 03).

**Scope additions (post-Plan-01 review, 2026-04-28):**
- Sidebar: Projects becomes a hierarchical disclosure that lists each series. Work stays flat (single curated page).
- Socials: add Subsurface Territories link.
- Project pages: add a more bestiary-flavoured "Specimen" header block (specimen number, kingdom/category-style labels) above the existing meta row. Subtle; black-on-white still.
- Homepage hero: more deliberately cinematic — full-viewport-height first frame, with a typeset opening line that fades in. Rotation continues underneath.
- Dark mode: system-preference-respecting + manual toggle that persists. Tasks 13–15 add this.
- "Easter eggs" deferred — flagged for a future micro-task once we agree on what they should be.
- GT Sectra: NOT switched in this plan. We stay on EB Garamond (Google Fonts) per the licensing review on 2026-04-28. Revisit if a real GT Sectra licence is acquired.

**Architecture:** Pure content addition on top of the Plan 01 scaffold. Each project becomes a markdown file in `src/projects/`. Journal is a markdown collection in `src/journal/` with an index page that lists posts reverse-chronologically. The homepage is a Nunjucks template that renders a rotating hero (CSS + minimal JS) plus a "Latest" block. Old HTML files in the repo root, `photos/`, `projects/`, `blog/`, `unlinked/`, `aboutme.html`, `contact.html`, `index.html`, `nav.html`, `Docphot-Contextual-Statements.html` are deleted at the end.

**Tech Stack:** Eleventy 3, Nunjucks, vanilla CSS/JS (no build tooling beyond Eleventy). Vitest for the same kind of layout assertions as Plan 01.

---

## Pre-flight notes for the implementing agent

- Read `docs/superpowers/specs/2026-04-27-newplace2frown-relaunch-design.md` §6 (Information architecture) before starting. The IA is the source of truth for what each page contains.
- Image filenames in `assets/media/` are inconsistent (mixed extensions, spaces, mixed case). Don't rename anything during this plan — `permalink` and `src` paths can include spaces (URL-encoded by the browser); the existing portfolio works that way today. Renaming is out of scope.
- The "Work" page (curated highlight reel) is a separate selection from any single project. It pulls 20–30 images across all series. The user picks the final selection — for this plan, scaffold the page with a starter set drawn from the existing About/Portfolio image rotation, and surface a checkpoint at Task 6 for the user to revise.
- Project descriptions need real prose. For each project, write a 100–200 word intro using the voice from the existing About page (instinctive, place-led, references to documentary practice). Don't fabricate facts — if you're unsure of a place/year, leave a `TODO_INTRO` comment in the markdown and surface it at the Task 9 checkpoint.
- The `Docphot-Contextual-Statements.html` file (postgrad photography theory writing) is preserved. Convert to a Journal post dated `2025-08-29` (matches the file's git history) — see Task 8.
- Tests use `execFileSync` with argv arrays, matching Plan 01's pattern.

---

## File structure (this plan creates and deletes)

**Creates:**
```
src/
  index.njk                         # REWRITE — real homepage
  about.md
  contact.md
  work.md
  projects/
    index.njk                       # projects index page
    gambia-2019.md
    gambia-2023.md
    lancaster.md
    cardiff.md
    wales.md
    # morecambe.md already exists from Plan 01
  journal/
    index.njk                       # journal index, lists posts
    journal.11tydata.js             # collection config (layout + tag)
    2025-08-29-docphot-contextual-statements.md
  _includes/
    layouts/
      page.njk                      # generic content page (about, contact)
      journal-post.njk
    partials/
      hero-rotator.njk              # used by homepage
  _data/
    work.js                         # curated highlight image list
assets/
  css/
    site.css                        # APPEND — hero, work grid, projects index, journal,
                                    # specimen card, frame numbers, sidebar disclosure,
                                    # dark-mode tokens, theme toggle styles
  js/
    hero-rotator.js                 # tiny rotator for homepage hero
    theme.js                        # dark/light theme toggle + persistence (Task 15)
tests/
  content.test.mjs                  # asserts all nav routes resolve and key content present
```

**Modifies (post-checkpoint additions, Tasks 13–15):**
```
src/_data/site.js                   # nav: Projects gets `children`; socials: add Subsurface
src/_includes/partials/sidebar.njk  # hierarchical disclosure for nav items with children;
                                    # theme toggle button before socials
src/_includes/layouts/base.njk      # inline pre-paint theme script + theme.js include
src/_includes/layouts/project.njk   # specimen card above title; frame numbers in captions
src/projects/morecambe.md           # add `specimen: 03` and `category: Place` frontmatter
.eleventy.js                        # register `padStart` filter (in addition to existing filters)
```

**Deletes (at Task 11, after content is verified):**
```
index.html
nav.html
aboutme.html
contact.html
Docphot-Contextual-Statements.html
photos/portfolio.html
projects/project1.html
projects/project2.html
blog/index.html
blog/drafts.html
blog/drafts/                        # entire directory
unlinked/                           # entire directory (per spec: stays unlinked, but is no longer needed)
scripts/generate-gallery.js
scripts/generate-index.js
scripts/                            # if empty after the deletes above
assets/media/index.json             # generated by old gallery script, no longer needed
```

---

## Task 1: Generic page layout (used by About, Contact)

**Files:**
- Create: `src/_includes/layouts/page.njk`

- [ ] **Step 1: Write the page layout**

Create `src/_includes/layouts/page.njk`:

```njk
---
layout: layouts/base.njk
---
<article class="page">
  <header class="page-header">
    <h1>{{ title }}</h1>
    {% if subtitle %}<p class="page-subtitle">{{ subtitle }}</p>{% endif %}
  </header>

  <div class="page-body">
    {{ content | safe }}
  </div>
</article>
```

- [ ] **Step 2: Append page styles to site.css**

Open `assets/css/site.css` and append (do not replace) these styles at the end:

```css
/* ---- Generic content pages (about, contact) ---- */

.page-header {
  margin-bottom: 2.5rem;
}
.page-header h1 {
  margin-bottom: 0.25rem;
}
.page-subtitle {
  font-family: var(--mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0.5rem 0 0;
}
.page-body p {
  max-width: var(--measure);
}
.page-body figure {
  margin: 2rem 0;
}
.page-body figure img {
  width: 100%;
  height: auto;
  display: block;
}
.page-body figcaption {
  margin-top: 8px;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/_includes/layouts/page.njk assets/css/site.css
git commit -m "feat(layout): generic page layout + page styles"
```

---

## Task 2: About page

**Files:**
- Create: `src/about.md`

- [ ] **Step 1: Write about.md**

Create `src/about.md`:

```markdown
---
layout: layouts/page.njk
title: About
subtitle: Leon Morgan / Documentary photographer
permalink: /about/
---

<figure>
  <img src="/assets/media/St Davids Polaroid.jpeg" alt="Polaroid of St David's coastline" />
  <figcaption>St David's, West Wales</figcaption>
</figure>

I take photographs. The work moves between street, landscape, and the spaces in between — Lancaster, Morecambe Bay, West Wales, The Gambia, and wherever else I happen to be carrying a camera.

Hailing from Lancaster, in the north west of England, I've documented people, places, and things across the planet — from Poland to Gambia and back again, the streets of Geneva, the Manchester underbelly. The work is instinctive, primarily from the streets, with regular detours into the digital and the astronomical.

From the age of fifteen, when an art teacher introduced me to Bresson's "decisive moment" alongside Robert Shore's *Post-Photography*, I've been trying to capture the world through the 3:2 frame of a camera — somewhere between traditional photojournalism and contemporary fine-art documentary practice. The contradiction between art, truth, and beauty is the thing I keep coming back to. I want the work to make people question the "truth" of what they're looking at.

If you'd like a print, the [shop is here](https://shop.newplace2frown.com). If you'd like to talk about a commission, collaboration, or anything else, [get in touch](/contact/).

—Leon
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Open `_site/about/index.html` in a browser (or run `npm run dev` and visit `/about/`). Expect the polaroid image at top, prose below in a single column, "About" active in the sidebar.

- [ ] **Step 3: Commit**

```bash
git add src/about.md
git commit -m "feat(content): About page"
```

---

## Task 3: Contact page

**Files:**
- Create: `src/contact.md`

- [ ] **Step 1: Write contact.md**

Create `src/contact.md`:

```markdown
---
layout: layouts/page.njk
title: Contact
subtitle: Hello — say hello
permalink: /contact/
---

For prints: [shop.newplace2frown.com](https://shop.newplace2frown.com).

For commissions, collaborations, exhibitions, or anything else:

- Email — [newplace2frown@gmail.com](mailto:newplace2frown@gmail.com)
- Instagram — [@le.on_photos](https://instagram.com/le.on_photos)
- Twitter — [@newplace2frown](https://twitter.com/newplace2frown)
- TikTok — [@newplace2frown](https://www.tiktok.com/@newplace2frown)
- SoundCloud — [m0rvidd](https://soundcloud.com/m0rvidd)

—Leon
```

- [ ] **Step 2: Build and verify**

Run `npm run dev`, visit `/contact/`. Expect single-column page with link list, "Contact" active in sidebar.

- [ ] **Step 3: Commit**

```bash
git add src/contact.md
git commit -m "feat(content): Contact page"
```

---

## Task 4: Project pages — Gambia 2019, Gambia 2023, Lancaster, Cardiff, Wales

**Files:**
- Create: `src/projects/gambia-2019.md`
- Create: `src/projects/gambia-2023.md`
- Create: `src/projects/lancaster.md`
- Create: `src/projects/cardiff.md`
- Create: `src/projects/wales.md`

- [ ] **Step 1: Inventory available images**

Run: `ls "assets/media/"` and capture the filenames. Group mentally by project:
- Gambia 2019: filenames mentioning Banjul, Juffureh, River Gambia, Makasutu, etc.
- Gambia 2023: Senegambia, Lamin Crossovers, Beach Rider, Give Respect Goats, Football, etc.
- Lancaster: Lancaster 2019, Eating Plus, Common Garden Street, Mainway, Church Street, Esso (also Morecambe-adjacent), etc.
- Cardiff: Cardiff Library, Cardiff Reflections, Leaving Cardiff, etc.
- Wales: St Davids Polaroid, Memories of West Wales, etc.

If a project has fewer than 4 images available, scaffold it with what exists and add a `TODO: more images` comment in the markdown. The user can populate later.

- [ ] **Step 2: Write Gambia 2019**

Create `src/projects/gambia-2019.md`. Replace image entries with files actually present in `assets/media/`:

```markdown
---
layout: layouts/project.njk
title: The Gambia, 2019
permalink: /projects/gambia-2019/
place: The Gambia
year: 2019
intro: >
  <p>First trip to The Gambia. Two weeks moving between Banjul, Senegambia, and the river inland to Juffureh and Makasutu. Made on a 35mm rangefinder with one lens; an unfamiliar light to work with, and a country I'd read about more than I'd seen.</p>
images:
  - { src: "/assets/media/Banjul Taxi.jpeg", alt: "Taxi on a Banjul street", caption: "Banjul taxi" }
  - { src: "/assets/media/Landing at Juffureh.jpg", alt: "Landing at Juffureh", caption: "Landing at Juffureh" }
  - { src: "/assets/media/The River Gambia.jpg", alt: "River Gambia", caption: "The River Gambia" }
  - { src: "/assets/media/Road to Makasutu.jpg", alt: "Road to Makasutu", caption: "Road to Makasutu" }
---
```

If `Banjul Taxi.jpeg` doesn't exist (the spec preamble noted a `Banjul Taxi.jpg` deletion in the working tree), use whatever Banjul/Gambia 2019 image is present.

- [ ] **Step 3: Write Gambia 2023**

Create `src/projects/gambia-2023.md`:

```markdown
---
layout: layouts/project.njk
title: The Gambia, 2023
permalink: /projects/gambia-2023/
place: The Gambia
year: 2023
intro: >
  <p>Returning four years later, mostly along Senegambia beach and inland to Lamin. Same camera, different eye — less ethnographic, more interested in the small repetitions of beach life: the football matches at dusk, the goats, the riders, the way light handles sand.</p>
images:
  - { src: "/assets/media/Senegambia Beach.jpeg", alt: "Senegambia beach", caption: "Senegambia beach" }
  - { src: "/assets/media/Senegambia Palms.jpeg", alt: "Senegambia palms", caption: "Senegambia palms" }
  - { src: "/assets/media/Lamin Crossovers.jpg", alt: "Lamin Crossovers", caption: "Lamin Crossovers" }
  - { src: "/assets/media/Give Respect Goats.jpg", alt: "Give Respect Goats", caption: "Give Respect" }
---
```

- [ ] **Step 4: Write Lancaster**

Create `src/projects/lancaster.md`:

```markdown
---
layout: layouts/project.njk
title: Lancaster
permalink: /projects/lancaster/
place: Lancaster, England
year: 2019–2025
intro: >
  <p>All roads lead to Lancaster. Six years of walking the same town: the bus station, Common Garden Street, the bingo hall on Mainway, the Esso under sodium light. The work is least like itself when I try to make it; better when I let the town find me.</p>
images:
  - { src: "/assets/media/Lancaster 2019 (2).jpg", alt: "Lancaster 2019", caption: "Lancaster, 2019" }
  - { src: "/assets/media/Eating Plus.jpg", alt: "Eating Plus", caption: "Eating Plus" }
  - { src: "/assets/media/Common Garden Street.jpeg", alt: "Common Garden Street", caption: "Common Garden Street" }
  - { src: "/assets/media/Church Street.jpeg", alt: "Church Street", caption: "Church Street" }
---
```

- [ ] **Step 5: Write Cardiff**

Create `src/projects/cardiff.md`:

```markdown
---
layout: layouts/project.njk
title: Cardiff
permalink: /projects/cardiff/
place: Cardiff, Wales
year: 2022–2024
intro: >
  <p>A short, ongoing project from the year I was based in Cardiff. The city is wet, low-lit, and walks well. These are the photographs that survived.</p>
images:
  - { src: "/assets/media/Cardiff Library.jpeg", alt: "Cardiff Library", caption: "Cardiff Library" }
---
<!-- TODO: more Cardiff images -->
```

- [ ] **Step 6: Write Wales**

Create `src/projects/wales.md`:

```markdown
---
layout: layouts/project.njk
title: West Wales
permalink: /projects/wales/
place: West Wales
year: 2023–2025
intro: >
  <p>Trips out from Cardiff into West Wales — St David's, the Pembrokeshire coast, the slow drive home. Polaroid and 35mm. The weather does most of the work.</p>
images:
  - { src: "/assets/media/St Davids Polaroid.jpeg", alt: "St David's polaroid", caption: "St David's, polaroid" }
---
<!-- TODO: more Wales images -->
```

- [ ] **Step 7: Build and verify all five render**

Run: `npm run build`
Confirm each `_site/projects/<slug>/index.html` exists.

- [ ] **Step 8: Commit**

```bash
git add src/projects/gambia-2019.md src/projects/gambia-2023.md src/projects/lancaster.md src/projects/cardiff.md src/projects/wales.md
git commit -m "feat(content): port Gambia, Lancaster, Cardiff, Wales project pages"
```

---

## Task 5: Projects index page

**Files:**
- Create: `src/projects/index.njk`
- Modify: `assets/css/site.css` (append projects-index styles)

- [ ] **Step 1: Write the projects index**

Create `src/projects/index.njk`:

```njk
---
layout: layouts/base.njk
title: Projects
permalink: /projects/
eleventyExcludeFromCollections: true
---
<header class="page-header">
  <h1>Projects</h1>
  <p class="page-subtitle">Series, ongoing and complete</p>
</header>

<ul class="projects-index">
{% set projects = collections.all
  | filter("data.layout", "layouts/project.njk")
  | sortByPlaceYear %}
{% for proj in projects %}
  <li class="project-card">
    <a href="{{ proj.url }}">
      {% if proj.data.images and proj.data.images.length > 0 %}
        <figure>
          <img src="{{ proj.data.images[0].src }}" alt="{{ proj.data.title }}" loading="lazy">
        </figure>
      {% endif %}
      <div class="project-card-meta">
        <span class="project-card-title">{{ proj.data.title }}</span>
        <span class="project-card-year">{{ proj.data.year }}</span>
      </div>
    </a>
  </li>
{% endfor %}
</ul>
```

The template uses two custom Eleventy filters (`filter` and `sortByPlaceYear`) — register them in `.eleventy.js` next.

- [ ] **Step 2: Register the filters in .eleventy.js**

Modify `.eleventy.js` so the exported function reads (additions inside the function body, before `return`):

```javascript
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('WebLogo1.gif');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('favicon.gif');
  eleventyConfig.addWatchTarget('src/');

  // Filter items in a collection by a nested key matching a value.
  // Usage: collections.all | filter("data.layout", "layouts/project.njk")
  eleventyConfig.addFilter('filter', (arr, keyPath, value) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => {
      const v = keyPath.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), item);
      return v === value;
    });
  });

  // Sort projects by year descending (string compare on the leading 4 chars works for "2023", "2019–2025", etc).
  eleventyConfig.addFilter('sortByPlaceYear', (arr) => {
    return [...arr].sort((a, b) => {
      const ay = String(a.data.year || '').slice(0, 4);
      const by = String(b.data.year || '').slice(0, 4);
      return by.localeCompare(ay);
    });
  });

  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
}
```

- [ ] **Step 3: Append projects-index styles**

Append to `assets/css/site.css`:

```css
/* ---- Projects index ---- */

.projects-index {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 48px 32px;
}
.projects-index a {
  display: block;
  text-decoration: none;
  color: var(--ink);
}
.projects-index figure {
  margin: 0 0 0.75rem;
  aspect-ratio: 3 / 2;
  overflow: hidden;
}
.projects-index figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 200ms ease;
}
.projects-index a:hover figure img { opacity: 0.92; }
.project-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.project-card-title {
  font-family: var(--serif);
  font-size: 1.15rem;
}
.project-card-year {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

@media (max-width: 700px) {
  .projects-index { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Build and verify**

Run: `npm run dev` and visit `/projects/`. Expect a 2-column grid (1-column on mobile) of project cards: image + title + year, sorted with newest year first.

- [ ] **Step 5: Commit**

```bash
git add src/projects/index.njk .eleventy.js assets/css/site.css
git commit -m "feat(projects): index page with grid + filters"
```

---

## Task 6: Work page (curated highlight reel)

**Files:**
- Create: `src/_data/work.js`
- Create: `src/work.md`
- Modify: `assets/css/site.css` (append work styles)

- [ ] **Step 1: Build the curated image list**

Create `src/_data/work.js`. The list below is a starter selection drawn from the existing `assets/media/` rotation — surface to the user at the Task 9 checkpoint to revise the final selection. Replace any filename that doesn't exist on disk with one that does.

```javascript
export default [
  { src: '/assets/media/Landing at Juffureh.jpg', alt: 'Landing at Juffureh, Gambia 2019', caption: 'Landing at Juffureh, 2019' },
  { src: '/assets/media/ESSO AFTER DARK.jpeg', alt: 'Esso after dark, Lancaster', caption: 'Esso After Dark, 2020' },
  { src: '/assets/media/FANTASTIC.jpg', alt: 'Fantastic, Morecambe 2019', caption: 'Fantastic, 2019' },
  { src: '/assets/media/Bay Sunset.jpeg', alt: 'Bay Sunset, Morecambe', caption: 'Bay Sunset, 2021' },
  { src: '/assets/media/Lamin Crossovers.jpg', alt: 'Lamin Crossovers, Gambia 2023', caption: 'Lamin Crossovers, 2023' },
  { src: '/assets/media/Senegambia Beach.jpeg', alt: 'Senegambia beach', caption: 'Senegambia, 2023' },
  { src: '/assets/media/Eating Plus.jpg', alt: 'Eating Plus, Lancaster', caption: 'Eating Plus, 2020' },
  { src: '/assets/media/Common Garden Street.jpeg', alt: 'Common Garden Street, Lancaster', caption: 'Common Garden Street' },
  { src: '/assets/media/Cardiff Library.jpeg', alt: 'Cardiff Library', caption: 'Cardiff Library' },
  { src: '/assets/media/Empty restaurant.jpeg', alt: 'Empty restaurant, Morecambe', caption: 'Empty restaurant, 2022' },
  { src: '/assets/media/Figure on the Horizon.jpeg', alt: 'Figure on the horizon, Morecambe Bay', caption: 'Figure on the horizon, 2021' },
  { src: '/assets/media/St Davids Polaroid.jpeg', alt: "St David's polaroid", caption: "St David's polaroid" },
  { src: '/assets/media/Road to Makasutu.jpg', alt: 'Road to Makasutu', caption: 'Road to Makasutu, 2019' },
  { src: '/assets/media/Spirited Sophistication.jpg', alt: 'Spirited Sophistication', caption: 'Spirited Sophistication' },
  { src: '/assets/media/The need for speed.jpg', alt: 'The need for speed', caption: 'The need for speed' },
  { src: '/assets/media/Mallorca DM.jpg', alt: 'Mallorca', caption: 'Mallorca' },
  { src: '/assets/media/Ravers NSDB.jpg', alt: 'Ravers', caption: 'Ravers' },
  { src: '/assets/media/Sunset from my Window.jpeg', alt: 'Sunset from my window', caption: 'Sunset from my window' },
  { src: '/assets/media/The Night Aretha Died (Reprise).jpeg', alt: 'The night Aretha died', caption: 'The night Aretha died (reprise)' },
  { src: '/assets/media/B-Army Surplus.jpeg', alt: 'B-Army Surplus', caption: 'B-Army Surplus' }
];
```

- [ ] **Step 2: Write the Work page**

Create `src/work.md`:

```markdown
---
layout: layouts/base.njk
title: Work
permalink: /work/
---

<header class="page-header">
  <h1>Work</h1>
  <p class="page-subtitle">An edit. Twenty frames across all series.</p>
</header>

<section class="work-images">
{% for img in work %}
  <figure>
    <img src="{{ img.src }}" alt="{{ img.alt }}" loading="lazy">
    {% if img.caption %}<figcaption>{{ img.caption }}</figcaption>{% endif %}
  </figure>
{% endfor %}
</section>
```

- [ ] **Step 3: Append work styles**

Append to `assets/css/site.css`:

```css
/* ---- Work (curated highlight reel) ---- */

.work-images {
  display: flex;
  flex-direction: column;
  gap: 64px;
}
.work-images figure { margin: 0; }
.work-images img { width: 100%; height: auto; display: block; }
.work-images figcaption {
  margin-top: 8px;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
```

- [ ] **Step 4: Build and verify**

Run: `npm run dev`, visit `/work/`. Expect a single-column scroll of large images with mono captions.

- [ ] **Step 5: Commit**

```bash
git add src/_data/work.js src/work.md assets/css/site.css
git commit -m "feat(work): curated highlight page"
```

---

## Task 7: Journal scaffold (layout, post layout, index, collection config)

**Files:**
- Create: `src/_includes/layouts/journal-post.njk`
- Create: `src/journal/journal.11tydata.js`
- Create: `src/journal/index.njk`
- Modify: `assets/css/site.css` (append journal styles)

- [ ] **Step 1: Write the post layout**

Create `src/_includes/layouts/journal-post.njk`:

```njk
---
layout: layouts/base.njk
---
<article class="journal-post">
  <header class="page-header">
    <h1>{{ title }}</h1>
    <p class="page-subtitle">
      {% if date %}<time datetime="{{ page.date.toISOString() }}">{{ page.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>{% endif %}
    </p>
  </header>

  <div class="page-body">
    {{ content | safe }}
  </div>
</article>
```

- [ ] **Step 2: Write the journal data file (applies to every post in the directory)**

Create `src/journal/journal.11tydata.js`:

```javascript
export default {
  layout: 'layouts/journal-post.njk',
  tags: 'journal',
  permalink: '/journal/{{ page.fileSlug }}/'
};
```

- [ ] **Step 3: Write the journal index**

Create `src/journal/index.njk`:

```njk
---
layout: layouts/base.njk
title: Journal
permalink: /journal/
eleventyExcludeFromCollections: true
---
<header class="page-header">
  <h1>Journal</h1>
  <p class="page-subtitle">Notes, dispatches, occasional theory</p>
</header>

{% set posts = collections.journal | reverse %}
{% if posts.length == 0 %}
  <p>Nothing here yet.</p>
{% else %}
  <ul class="journal-index">
  {% for post in posts %}
    <li>
      <a href="{{ post.url }}">
        <span class="journal-date">{{ post.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
        <span class="journal-title">{{ post.data.title }}</span>
      </a>
    </li>
  {% endfor %}
  </ul>
{% endif %}
```

- [ ] **Step 4: Append journal styles**

Append to `assets/css/site.css`:

```css
/* ---- Journal ---- */

.journal-index {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--rule);
}
.journal-index li {
  border-bottom: 1px solid var(--rule);
}
.journal-index a {
  display: flex;
  gap: 1.5rem;
  align-items: baseline;
  padding: 14px 0;
  text-decoration: none;
  color: var(--ink);
}
.journal-date {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
  flex: 0 0 110px;
}
.journal-title {
  font-family: var(--serif);
  font-size: 1.1rem;
}
.journal-index a:hover .journal-title { color: var(--accent); }

.journal-post .page-body {
  max-width: var(--measure);
}
```

- [ ] **Step 5: Build and verify**

Run: `npm run dev`, visit `/journal/`. Expect "Nothing here yet." (the Docphot post is added in Task 8).

- [ ] **Step 6: Commit**

```bash
git add src/_includes/layouts/journal-post.njk src/journal/journal.11tydata.js src/journal/index.njk assets/css/site.css
git commit -m "feat(journal): post layout, collection config, index page"
```

---

## Task 8: Port Docphot Contextual Statements to a journal post

**Files:**
- Create: `src/journal/2025-08-29-docphot-contextual-statements.md`

- [ ] **Step 1: Read the existing source**

Run: `cat Docphot-Contextual-Statements.html`
The file is ~20KB. Identify:
- The actual prose (between body markup)
- Any inline images and their `src` paths
- The structure (likely several "statements" with headings)

- [ ] **Step 2: Write the journal post**

Create `src/journal/2025-08-29-docphot-contextual-statements.md`:

```markdown
---
title: Docphot — Contextual Statements
date: 2025-08-29
---

<!--
  Imported from Docphot-Contextual-Statements.html.
  Preserve the original prose verbatim. Convert <h2>/<h3> markup to ## / ### markdown.
  If the original contains <img> tags, keep them inline as HTML — markdown image syntax
  loses alt text and class attributes that may matter.
-->

<!-- IMPLEMENTING AGENT: paste the cleaned prose from the original HTML here.
     - Strip the <html>, <head>, <body>, <main>, <header> wrappers.
     - Remove the sidebar/nav markup.
     - Keep semantic headings.
     - Preserve image references; image paths relative to /assets/media/ should stay correct
       since assets are served from the same root. -->
```

The implementing agent then opens `Docphot-Contextual-Statements.html`, extracts the prose content (everything inside `<main class="content">` minus headers), and pastes it under the comment block, replacing the placeholder. Headings convert from `<h2>` to `##`. The original `<h1>Docphot — Contextual Statements</h1>` is *not* duplicated in the body (the layout renders the title from frontmatter).

- [ ] **Step 3: Build and verify**

Run: `npm run dev`, visit `/journal/`. Expect one post listed, dated "29 Aug 2025", linking to `/journal/2025-08-29-docphot-contextual-statements/`. Visit it, confirm the prose is intact.

- [ ] **Step 4: Commit**

```bash
git add src/journal/2025-08-29-docphot-contextual-statements.md
git commit -m "feat(journal): port Docphot Contextual Statements as first post"
```

---

## Task 9: Homepage with rotating hero + Latest block

**Files:**
- Create: `src/_includes/partials/hero-rotator.njk`
- Create: `assets/js/hero-rotator.js`
- Modify: `src/index.njk` (full rewrite)
- Modify: `assets/css/site.css` (append hero + latest styles)

- [ ] **Step 1: Write the hero rotator partial**

Create `src/_includes/partials/hero-rotator.njk`:

```njk
<div class="hero" data-interval="9000">
  {% for img in heroImages %}
    <figure class="hero-frame{% if loop.first %} is-active{% endif %}">
      <img src="{{ img.src }}" alt="{{ img.alt }}" {% if loop.first %}fetchpriority="high"{% else %}loading="lazy"{% endif %}>
      <figcaption>{{ img.caption }}</figcaption>
    </figure>
  {% endfor %}
</div>
```

- [ ] **Step 2: Write the rotator JS**

Create `assets/js/hero-rotator.js`:

```javascript
// Cross-fades hero frames at a fixed interval. Pure JS, no deps.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const frames = [...hero.querySelectorAll('.hero-frame')];
  if (frames.length < 2) return;
  const interval = parseInt(hero.dataset.interval, 10) || 9000;
  let i = 0;
  setInterval(() => {
    frames[i].classList.remove('is-active');
    i = (i + 1) % frames.length;
    frames[i].classList.add('is-active');
  }, interval);
})();
```

- [ ] **Step 3: Rewrite src/index.njk as the real homepage**

Replace `src/index.njk` with:

```njk
---
layout: layouts/base.njk
title: Home
heroImages:
  - { src: "/assets/media/Landing at Juffureh.jpg", alt: "Landing at Juffureh, Gambia 2019", caption: "Landing at Juffureh — Gambia, 2019" }
  - { src: "/assets/media/ESSO AFTER DARK.jpeg", alt: "Esso after dark, Lancaster", caption: "Esso After Dark — Lancaster, 2020" }
  - { src: "/assets/media/Bay Sunset.jpeg", alt: "Bay Sunset, Morecambe", caption: "Bay Sunset — Morecambe, 2021" }
  - { src: "/assets/media/Lamin Crossovers.jpg", alt: "Lamin Crossovers", caption: "Lamin Crossovers — Gambia, 2023" }
  - { src: "/assets/media/St Davids Polaroid.jpeg", alt: "St David's polaroid", caption: "St David's — Wales" }
---
<section class="home">
  {% include "partials/hero-rotator.njk" %}

  {% set latestJournal = collections.journal | reverse | first %}
  {% if latestJournal %}
    <aside class="latest">
      <span class="latest-label">Latest from the journal</span>
      <a class="latest-link" href="{{ latestJournal.url }}">
        {{ latestJournal.data.title }}
        <span class="latest-date">{{ latestJournal.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
      </a>
    </aside>
  {% endif %}
</section>

<script src="/assets/js/hero-rotator.js" defer></script>
```

- [ ] **Step 4: Append hero + latest styles**

Append to `assets/css/site.css`:

```css
/* ---- Home (hero rotator + latest block) ---- */

.home { /* main panel already has padding; hero needs to break out */ }

.hero {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  margin: 0 0 3rem;
  background: var(--ink);
  overflow: hidden;
}
.hero-frame {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  transition: opacity 1200ms ease-in-out;
}
.hero-frame.is-active { opacity: 1; }
.hero-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-frame figcaption {
  position: absolute;
  left: 18px;
  bottom: 16px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.latest {
  border-top: 1px solid var(--rule);
  padding: 24px 0 0;
}
.latest-label {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  display: block;
  margin-bottom: 6px;
}
.latest-link {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  font-family: var(--serif);
  font-size: 1.3rem;
  text-decoration: none;
  color: var(--ink);
}
.latest-date {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.latest-link:hover { color: var(--accent); }
```

- [ ] **Step 5: Build and verify**

Run: `npm run dev`, visit `/`. Expect:
- Large hero image (3:2 aspect), small mono caption bottom-left.
- After 9s, fades to the next image. Cycle of 5.
- Below: "Latest from the journal" with the Docphot post linked.

If the hero is taller than the viewport on a small screen, that's fine — the spec asks for full-bleed cinematic, not viewport-locked.

- [ ] **Step 6: Commit**

```bash
git add src/_includes/partials/hero-rotator.njk assets/js/hero-rotator.js src/index.njk assets/css/site.css
git commit -m "feat(home): rotating hero + latest journal block"
```

---

## Task 10: Content tests

**Files:**
- Create: `tests/content.test.mjs`

- [ ] **Step 1: Write the content test**

Create `tests/content.test.mjs`:

```javascript
import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

const routes = [
  '/index.html',
  '/about/index.html',
  '/contact/index.html',
  '/work/index.html',
  '/projects/index.html',
  '/projects/morecambe/index.html',
  '/projects/gambia-2019/index.html',
  '/projects/gambia-2023/index.html',
  '/projects/lancaster/index.html',
  '/projects/cardiff/index.html',
  '/projects/wales/index.html',
  '/journal/index.html',
  '/journal/2025-08-29-docphot-contextual-statements/index.html'
];

describe('content port', () => {
  beforeAll(() => {
    execFileSync('npx', ['@11ty/eleventy'], { stdio: 'pipe', shell: process.platform === 'win32' });
  });

  routes.forEach(route => {
    it(`builds ${route}`, () => {
      expect(existsSync(`_site${route}`)).toBe(true);
    });
  });

  it('homepage has a hero with at least 3 frames', () => {
    const doc = parseHTML(readFileSync('_site/index.html', 'utf8')).document;
    const frames = doc.querySelectorAll('.hero .hero-frame');
    expect(frames.length).toBeGreaterThanOrEqual(3);
  });

  it('homepage shows a latest journal link', () => {
    const doc = parseHTML(readFileSync('_site/index.html', 'utf8')).document;
    const link = doc.querySelector('.latest-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toMatch(/^\/journal\//);
  });

  it('projects index lists every project page', () => {
    const doc = parseHTML(readFileSync('_site/projects/index.html', 'utf8')).document;
    const links = [...doc.querySelectorAll('.projects-index a')].map(a => a.getAttribute('href'));
    ['/projects/morecambe/', '/projects/gambia-2019/', '/projects/gambia-2023/', '/projects/lancaster/', '/projects/cardiff/', '/projects/wales/']
      .forEach(href => expect(links).toContain(href));
  });

  it('journal index lists at least one post', () => {
    const doc = parseHTML(readFileSync('_site/journal/index.html', 'utf8')).document;
    const items = doc.querySelectorAll('.journal-index li');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test`
Expected: all tests from Plans 01 + 02 pass.

- [ ] **Step 3: Commit**

```bash
git add tests/content.test.mjs
git commit -m "test(content): assert all routes build, hero/latest/index lists populate"
```

---

## Task 11: Retire old HTML and gallery script

**Files:** deletes only.

- [ ] **Step 1: Confirm new site is content-complete**

Run: `npm run build && npm test`
Expected: all tests pass.

Visit (in dev mode) every nav route plus a project page and the journal post. Confirm content is correct — this is the cheapest moment to catch a porting mistake.

- [ ] **Step 2: Delete old static HTML files**

```bash
git rm index.html
git rm nav.html
git rm aboutme.html
git rm contact.html
git rm Docphot-Contextual-Statements.html
git rm photos/portfolio.html
git rm projects/project1.html
git rm projects/project2.html
git rm blog/index.html
git rm blog/drafts.html
git rm -r blog/drafts/
git rm -r blog/
git rm -r unlinked/
```

(If `git rm -r blog/` fails because the dir is non-empty after the file deletes above, re-run; if it errors as "did not match any files" because already empty, ignore.)

- [ ] **Step 3: Delete old gallery scripts**

```bash
git rm scripts/generate-gallery.js
git rm scripts/generate-index.js
git rm assets/media/index.json
```

If `scripts/` is empty after the above, also:

```bash
rmdir scripts
```

(Don't `git rm` the empty directory — git doesn't track directories.)

- [ ] **Step 4: Verify build still passes**

Run: `npm run build && npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: retire old static HTML and gallery scripts

The Eleventy build at _site/ is now the source of truth for every route."
```

---

## Task 12: Content checkpoint (interim — before Tasks 13–15)

**Files:** none.

- [ ] **Step 1: Surface the interim checkpoint**

After Tasks 1–11, before the additions in Tasks 13–15, run `npm run dev` and let the user walk through the content. Most issues caught at this stage are content (wrong year, wrong place, prose doesn't read right) — cheap to fix now, costly to fix after dark mode + sidebar IA changes are layered on.

This is informational. Tasks 13–15 are still in scope; only stop if the user asks to.

---

## Task 13: Hierarchical Projects sub-nav + Subsurface link

**Files:**
- Modify: `src/_data/site.js`
- Modify: `src/_includes/partials/sidebar.njk`
- Modify: `src/_includes/partials/socials.njk`
- Modify: `assets/css/site.css` (append sidebar disclosure styles)

- [ ] **Step 1: Update site.js — add Subsurface social and a `children` field on Projects**

Read `src/_data/site.js`. Replace the existing `nav` and `socials` arrays with:

```javascript
  nav: [
    { label: 'Work',     href: '/work/' },
    {
      label: 'Projects', href: '/projects/',
      children: [
        { label: 'Morecambe',          href: '/projects/morecambe/' },
        { label: 'The Gambia, 2019',   href: '/projects/gambia-2019/' },
        { label: 'The Gambia, 2023',   href: '/projects/gambia-2023/' },
        { label: 'Lancaster',          href: '/projects/lancaster/' },
        { label: 'Cardiff',            href: '/projects/cardiff/' },
        { label: 'West Wales',         href: '/projects/wales/' }
      ]
    },
    { label: 'Journal',  href: '/journal/' },
    { label: 'Prints',   href: '/prints/' },
    { label: 'About',    href: '/about/' },
    { label: 'Contact',  href: '/contact/' }
  ],
  socials: [
    { label: 'Instagram',   href: 'https://instagram.com/le.on_photos' },
    { label: 'Subsurface',  href: 'https://subsurfaces.net' },
    { label: 'Twitter',     href: 'https://twitter.com/newplace2frown' },
    { label: 'TikTok',      href: 'https://www.tiktok.com/@newplace2frown' },
    { label: 'SoundCloud',  href: 'https://soundcloud.com/m0rvidd' }
  ]
```

(Verify the Subsurface URL with the user if uncertain — at the time of writing it is `https://subsurfaces.net`. If that turns out wrong, the user will tell you in the checkpoint.)

- [ ] **Step 2: Update sidebar.njk to render children as a `<details>` disclosure**

Replace the entire contents of `src/_includes/partials/sidebar.njk` with:

```njk
<aside class="sidebar" aria-label="Site navigation">
  <a class="logo" href="/" aria-label="Home">
    <img src="/WebLogo1.gif" alt="NewPlace2Frown logo" />
  </a>

  <nav class="nav">
    <ul>
    {% for item in site.nav %}
      <li>
        {% if item.children %}
          {# A nav item with children renders as a <details> disclosure.
             Open by default if the active page is in this branch. #}
          {% set branchOpen = false %}
          {% if page.url and page.url.startsWith(item.href) %}{% set branchOpen = true %}{% endif %}
          <details class="nav-folder"{% if branchOpen %} open{% endif %}>
            <summary>
              <a href="{{ item.href }}"
                 class="{% if page.url and page.url == item.href %}active{% endif %}">
                {{ item.label }}
              </a>
            </summary>
            <ul>
            {% for child in item.children %}
              <li>
                <a href="{{ child.href }}"
                   class="{% if page.url == child.href %}active{% endif %}">
                  {{ child.label }}
                </a>
              </li>
            {% endfor %}
            </ul>
          </details>
        {% else %}
          <a href="{{ item.href }}"
             class="{% if page.url and (page.url == item.href or page.url.startsWith(item.href)) %}active{% endif %}">
            {{ item.label }}
          </a>
        {% endif %}
      </li>
    {% endfor %}
    </ul>
  </nav>

  {% include "partials/socials.njk" %}
</aside>
```

Note: the previous active-state logic for top-level items used `page.url.startsWith(item.href)`. For an item with children we change that to an exact match (so the parent is "active" only when the user is on the index, not on a child) — and the children get the active state when on their own page. This avoids both parent and child rendering as active simultaneously.

- [ ] **Step 3: Append disclosure styles to site.css**

Append to `assets/css/site.css`:

```css
/* ---- Sidebar disclosure (hierarchical Projects) ---- */

.nav-folder {
  margin: 0;
}
.nav-folder > summary {
  list-style: none;
  cursor: pointer;
  padding: 0;
  display: block;
}
.nav-folder > summary::-webkit-details-marker { display: none; }
.nav-folder > summary > a { padding-right: 1rem; }
.nav-folder > summary::after {
  content: "+";
  float: right;
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-top: 6px;
  transition: transform 200ms ease;
  display: inline-block;
}
.nav-folder[open] > summary::after { content: "−"; }
.nav-folder > ul {
  list-style: none;
  margin: 4px 0 8px 14px;
  padding: 0 0 0 12px;
  border-left: 1px solid var(--rule);
}
.nav-folder > ul > li > a {
  display: inline-block;
  padding: 4px 0;
  font-size: 0.88rem;
  color: var(--ink-soft);
  text-decoration: none;
  position: relative;
}
.nav-folder > ul > li > a::after {
  /* reuse parent underline animation */
  content: "";
  position: absolute;
  left: 0;
  right: 100%;
  bottom: 1px;
  height: 1px;
  background: currentColor;
  transition: right 200ms ease;
}
.nav-folder > ul > li > a:hover,
.nav-folder > ul > li > a:focus-visible { color: var(--accent); }
.nav-folder > ul > li > a:hover::after,
.nav-folder > ul > li > a:focus-visible::after { right: 0; }
.nav-folder > ul > li > a.active {
  color: var(--ink);
  font-weight: 500;
}
.nav-folder > ul > li > a.active::after { right: 0; background: var(--ink); }
```

- [ ] **Step 4: Build, run tests, eyeball**

```bash
npm run build
npm test
```

Tests should still pass (the layout test asserts the six top-level nav labels exist as text — they still do, with Projects inside a `<summary>`). If `tests/layout.test.mjs` fails because the selector `.sidebar .nav a` no longer picks up the children inside `<summary>`, update the assertion to `.sidebar .nav a, .sidebar .nav summary > a` — but only if the test fails. Don't pre-emptively change it.

Open `http://localhost:8080/projects/morecambe/`. Expect:
- Sidebar: Projects shows a "−" indicator and is open, listing all six series. Morecambe is active (subtle weight + underline).
- Subsurface appears as a social.

- [ ] **Step 5: Commit**

```bash
git add src/_data/site.js src/_includes/partials/sidebar.njk assets/css/site.css
git commit -m "feat(nav): hierarchical Projects sub-nav + Subsurface social link"
```

---

## Task 14: Stronger hero + bestiary specimen header on project pages

**Files:**
- Modify: `src/index.njk` (hero structure)
- Modify: `assets/css/site.css` (hero styles + specimen styles)
- Modify: `src/_includes/layouts/project.njk` (specimen header block)

- [ ] **Step 1: Strengthen the homepage hero**

The Plan 02 Task 9 hero is a 3:2 aspect block. Replace it with a viewport-height treatment.

Replace `src/index.njk` with:

```njk
---
layout: layouts/base.njk
title: Home
heroImages:
  - { src: "/assets/media/Landing at Juffureh.jpg", alt: "Landing at Juffureh, Gambia 2019", caption: "Landing at Juffureh — Gambia, 2019" }
  - { src: "/assets/media/ESSO AFTER DARK.jpeg", alt: "Esso after dark, Lancaster", caption: "Esso After Dark — Lancaster, 2020" }
  - { src: "/assets/media/Bay Sunset.jpeg", alt: "Bay Sunset, Morecambe", caption: "Bay Sunset — Morecambe, 2021" }
  - { src: "/assets/media/Lamin Crossovers.jpg", alt: "Lamin Crossovers", caption: "Lamin Crossovers — Gambia, 2023" }
  - { src: "/assets/media/St Davids Polaroid.jpeg", alt: "St David's polaroid", caption: "St David's — Wales" }
---
<section class="home">
  {% include "partials/hero-rotator.njk" %}

  <div class="home-overlay">
    <p class="home-byline">A working photographer's notebook —<br>Lancaster, Morecambe, Wales, The Gambia.</p>
    <p class="home-meta">— Leon Morgan</p>
  </div>

  {% set latestJournal = collections.journal | reverse | first %}
  {% if latestJournal %}
    <aside class="latest">
      <span class="latest-label">Latest from the journal</span>
      <a class="latest-link" href="{{ latestJournal.url }}">
        {{ latestJournal.data.title }}
        <span class="latest-date">{{ latestJournal.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
      </a>
    </aside>
  {% endif %}
</section>

<script src="/assets/js/hero-rotator.js" defer></script>
```

- [ ] **Step 2: Update hero CSS — full viewport height, overlay typography**

Replace the `.home` and `.hero*` sections in `assets/css/site.css` (find the comment `/* ---- Home (hero rotator + latest block) ---- */` and replace everything between that comment and the next major comment) with:

```css
/* ---- Home (hero rotator + overlay + latest block) ---- */

.home {
  /* main panel padding is set by .main; we let the hero break out of the padded column */
  margin: -56px -64px 0;
}

.hero {
  position: relative;
  width: 100%;
  height: calc(100vh - 0px);
  margin: 0;
  background: var(--ink);
  overflow: hidden;
}
.hero-frame {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  transition: opacity 1500ms ease-in-out;
}
.hero-frame.is-active { opacity: 1; }
.hero-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-frame figcaption {
  position: absolute;
  left: 22px;
  bottom: 18px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.home-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 64px;
  padding: 0 64px;
  pointer-events: none;
  color: #fff;
  text-shadow: 0 1px 14px rgba(0,0,0,0.4);
  font-family: var(--serif);
}
.home-byline {
  font-size: 1.6rem;
  line-height: 1.25;
  margin: 0 0 0.4em;
  max-width: 28ch;
  opacity: 0;
  animation: home-fadeup 900ms 600ms ease-out forwards;
}
.home-meta {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
  opacity: 0;
  animation: home-fadeup 900ms 1100ms ease-out forwards;
}
@keyframes home-fadeup {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.latest {
  margin: 56px 64px 0;
  border-top: 1px solid var(--rule);
  padding: 24px 0 0;
}
.latest-label {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  display: block;
  margin-bottom: 6px;
}
.latest-link {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  font-family: var(--serif);
  font-size: 1.3rem;
  text-decoration: none;
  color: var(--ink);
}
.latest-date {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.latest-link:hover { color: var(--accent); }

@media (max-width: 900px) {
  .home { margin: -80px -22px 0; }
  .home-overlay { padding: 0 22px; bottom: 36px; }
  .home-byline { font-size: 1.2rem; max-width: 22ch; }
  .latest { margin: 40px 22px 0; }
}
```

- [ ] **Step 3: Add specimen header to project layout**

Modify `src/_includes/layouts/project.njk`. Just inside `<article class="project">`, before the existing `<header class="project-header">`, add a specimen block. Replace the file with:

```njk
---
layout: layouts/base.njk
---
<article class="project">
  <aside class="specimen" aria-label="Project specimen card">
    <div class="specimen-row specimen-top">
      <span class="specimen-label">Specimen</span>
      <span class="specimen-value">Nº {{ specimen or "—" }}</span>
      <span class="specimen-spacer"></span>
      <span class="specimen-label">Series</span>
      <span class="specimen-value">{{ title }}</span>
    </div>
    <div class="specimen-row">
      <span class="specimen-label">Kingdom</span>
      <span class="specimen-value">Documentary</span>
      <span class="specimen-spacer"></span>
      <span class="specimen-label">Category</span>
      <span class="specimen-value">{{ category or "Place" }}</span>
    </div>
  </aside>

  <header class="project-header">
    <h1>{{ title }}</h1>
    <div class="project-meta">
      <span><strong>Place</strong>{{ place }}</span>
      <span><strong>Year</strong>{{ year }}</span>
      <span><strong>Frames</strong>{{ images.length }}</span>
    </div>
  </header>

  {% if intro %}
  <div class="project-intro">
    {{ intro | safe }}
  </div>
  {% endif %}

  <section class="project-images">
  {% for img in images %}
    <figure>
      <img src="{{ img.src }}" alt="{{ img.alt or title }}" loading="lazy">
      <figcaption>
        <span class="frame-no">№ {{ loop.index | string | padStart(2, "0") }}</span>
        {% if img.caption %}<span class="frame-caption">{{ img.caption }}</span>{% endif %}
      </figcaption>
    </figure>
  {% endfor %}
  </section>
</article>
```

The `padStart` filter doesn't exist in Eleventy by default. Register it in `.eleventy.js` — find the `addFilter` block from Plan 02 Task 5 and add:

```javascript
  eleventyConfig.addFilter('padStart', (s, len, char) => String(s).padStart(len, char));
```

(Add this alongside the existing `filter` and `sortByPlaceYear` filter registrations.)

- [ ] **Step 4: Append specimen + frame-number styles**

Append to `assets/css/site.css`:

```css
/* ---- Specimen card (Bestiary-flavour project header) ---- */

.specimen {
  display: grid;
  border: 1px solid var(--ink);
  margin: 0 0 2rem;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  max-width: 560px;
}
.specimen-row {
  display: grid;
  grid-template-columns: max-content 1fr 12px max-content 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid var(--rule);
}
.specimen-row:first-child { border-top: none; }
.specimen-label {
  color: var(--ink-soft);
}
.specimen-value {
  color: var(--ink);
}
.specimen-spacer { background: var(--ink); height: 100%; min-height: 12px; }

/* ---- Project image frame numbers ---- */

.project-images figcaption {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
}
.project-images figcaption .frame-no {
  color: var(--ink-soft);
  font-weight: 500;
}
.project-images figcaption .frame-caption {
  color: var(--ink);
}
```

- [ ] **Step 5: Update Morecambe markdown to provide a specimen number**

Edit `src/projects/morecambe.md` — add `specimen: 03` and `category: Place` to the frontmatter (between `place` and `year`). Other project markdowns can have specimens added in Task 4 of this plan or by the user later; if they don't have one the template renders `Nº —`, which is fine.

- [ ] **Step 6: Build, test, eyeball**

```bash
npm run build
npm test
```

Open homepage — expect a near-full-viewport hero with overlay byline (fades in) and rotation underneath. The "Latest" block sits below the fold in its padded margin.
Open `/projects/morecambe/` — expect the specimen card above the title, frame numbers next to each caption.

If the layout test breaks because of new figcaption structure, update the test's caption assertion (Plan 02 doesn't currently assert caption structure; only frame count). Likely no change needed.

- [ ] **Step 7: Commit**

```bash
git add src/index.njk assets/css/site.css src/_includes/layouts/project.njk .eleventy.js src/projects/morecambe.md
git commit -m "feat(visual): full-height hero overlay + specimen card + frame numbers"
```

---

## Task 15: System-aware dark mode toggle

**Files:**
- Modify: `assets/css/site.css` (dark token overrides + image-dim treatment)
- Modify: `src/_includes/partials/sidebar.njk` (toggle button)
- Create: `assets/js/theme.js`
- Modify: `src/_includes/layouts/base.njk` (preload theme + script)

- [ ] **Step 1: Append dark-mode tokens to site.css**

Append to `assets/css/site.css`:

```css
/* ---- Dark mode tokens ----
   Toggling is done via [data-theme="dark"] on <html>.
   System preference handled in JS (theme.js) so it can persist user override. */

html[data-theme="dark"] {
  --bg:        #0d0d0d;
  --ink:       #ececec;
  --ink-soft:  #999999;
  --rule:      #2a2a2a;
  --accent:    #d97757; /* warmer in dark — same family as burnt red, lifted */
}

/* Image presentation in dark — slight desaturation/dim avoids retina glare */
html[data-theme="dark"] .project-images img,
html[data-theme="dark"] .work-images img,
html[data-theme="dark"] .hero-frame img {
  filter: brightness(0.92);
  transition: filter 240ms ease;
}

/* Specimen card border uses --ink so it inverts naturally; explicit just in case: */
html[data-theme="dark"] .specimen { border-color: var(--ink); }

/* ---- Theme toggle button ---- */

.theme-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border: 1px solid var(--ink);
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
}
.theme-toggle .knob {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--ink);
  transition: transform 240ms ease;
  display: block;
}
html[data-theme="dark"] .theme-toggle .knob { transform: translateX(20px); }
.theme-toggle .label {
  position: absolute;
  left: -9999px;
}
.theme-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
```

- [ ] **Step 2: Add the toggle to the sidebar**

Modify `src/_includes/partials/sidebar.njk`. Just before the `{% include "partials/socials.njk" %}` line, insert:

```njk
  <div class="theme-row">
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle dark mode">
      <span class="knob" aria-hidden="true"></span>
      <span class="label">Toggle theme</span>
    </button>
    <span aria-hidden="true">Theme</span>
  </div>
```

- [ ] **Step 3: Write theme.js**

Create `assets/js/theme.js`:

```javascript
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
```

- [ ] **Step 4: Add a pre-paint script and the theme.js include to base.njk**

Modify `src/_includes/layouts/base.njk`. Inside `<head>`, AFTER the `{% include "partials/head-meta.njk" %}` line, add an inline script that runs before the body to set the theme attribute and avoid a paint flash:

```njk
<script>
  (function () {
    try {
      var stored = localStorage.getItem('npf-theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  })();
</script>
```

Then, near the bottom (next to the existing `<script src="/assets/js/site.js" defer></script>`), add:

```njk
<script src="/assets/js/theme.js" defer></script>
```

So the bottom of `<body>` reads:

```njk
  <script src="/assets/js/site.js" defer></script>
  <script src="/assets/js/theme.js" defer></script>
</body>
```

- [ ] **Step 5: Build, test, eyeball**

```bash
npm run build
npm test
```

Open the homepage. Click the toggle in the sidebar — site flips to dark. Refresh — stays dark. Open in a system set to dark mode (or use devtools "Emulate prefers-color-scheme: dark") — site loads dark without the toggle being clicked. Click toggle — flips to light. Refresh — stays light.

Expected behaviours:
- No paint flash on initial load (the inline pre-paint script handles that).
- All page surfaces respect the new tokens.
- Hero image, project images, work images get a slight dim in dark mode.

- [ ] **Step 6: Commit**

```bash
git add assets/css/site.css src/_includes/partials/sidebar.njk assets/js/theme.js src/_includes/layouts/base.njk
git commit -m "feat(theme): system-aware dark mode with manual toggle + persistence"
```

---

## Task 16: Final content + visual checkpoint with the user

**Files:** none.

- [ ] **Step 1: Surface the final checkpoint**

After Tasks 1–15, run `npm run dev`. Tell the user:

> "Plan 02 is implementation-complete with all post-checkpoint additions. The site is content-complete except for the Prints/Buy Button funnel (Plan 03). Please walk through:
>
> **Content**
> - Homepage hero — image selection, byline copy, rotation timing
> - Work page — the curated edit (the selection is a starter; tell me what to swap)
> - Each project page — intro prose accuracy, especially Lancaster, Cardiff, Wales
> - Journal post (Docphot) — confirm the prose came across cleanly
>
> **Post-checkpoint additions**
> - Sidebar — Projects expands to show all six series; Subsurface link in socials; theme toggle works
> - Project pages — specimen card above the title; frame numbers next to captions
> - Homepage — full-viewport hero with overlay byline that fades in
> - Dark mode — toggle persists, system preference is respected on first visit, no flash on reload
>
> **Mobile** — nav collapses, hero scales, dark mode toggle reachable
>
> Items still flagged for your input:
> - Cardiff and Wales project image selections are minimal
> - Work page selection is a starter
> - Subsurface URL — confirm `https://subsurfaces.net` is correct
> - Specimen numbers (`specimen: NN` in project markdown) are only set on Morecambe; add to others if you want
> - Easter eggs deferred — when you have ideas, we'll micro-plan them
>
> Once approved, Plan 03 wires up the Prints page and the Buy Button funnel."

**Do not start Plan 03 without explicit approval.**

---

## Self-review notes

- **Spec coverage:** Covers spec §6 (IA — sidebar nav targets all resolve, homepage hybrid A+C, project pages, Journal, Work distinct from Projects). Spec §3 funnel (portfolio → Shopify) is partially covered (About + Contact link to `shop.newplace2frown.com`); the Prints page itself is Plan 03. Post-checkpoint additions extend §5 (visual identity) with dark-mode tokens and a stronger hero, and §6 with hierarchical sidebar.
- **Placeholder scan:** The only intentional inline placeholder is the prose-import comment in `2025-08-29-docphot-contextual-statements.md` Task 8 — and the step explicitly instructs the agent to replace it with content extracted from the source HTML. That's a real action, not a placeholder. Specimen numbers default to `—` when absent in frontmatter, by template design — not a placeholder.
- **Type consistency:** Filter names (`filter`, `sortByPlaceYear`, `padStart`) registered in `.eleventy.js` match usage in `src/projects/index.njk` and `src/_includes/layouts/project.njk`. Collection name `journal` is set in `journal.11tydata.js` and consumed in both `src/journal/index.njk` and `src/index.njk`. CSS class names introduced (`.page`, `.page-header`, `.page-subtitle`, `.page-body`, `.projects-index`, `.project-card`, `.work-images`, `.journal-index`, `.journal-date`, `.journal-title`, `.journal-post`, `.hero`, `.hero-frame`, `.latest`, `.latest-label`, `.latest-link`, `.latest-date`, `.nav-folder`, `.specimen`, `.specimen-row`, `.specimen-label`, `.specimen-value`, `.specimen-spacer`, `.frame-no`, `.frame-caption`, `.theme-toggle`, `.theme-row`, `.knob`, `.home-overlay`, `.home-byline`, `.home-meta`) are all referenced in templates and styled in `site.css`. Heroimages frontmatter key matches partial (`heroImages` → `{% for img in heroImages %}`). The `nav` data structure adds an optional `children` field; sidebar.njk handles both shapes.
- **Open dependencies for Plan 03:** the sidebar still has a `Prints` nav item pointing at `/prints/` which 404s until Plan 03. Same as Plan 01's deferred-routes situation. (Confirmed in 2026-04-28 review: keep the Prints page as a portfolio-side surface even after Shopify is on `shop.newplace2frown.com` — it's the curated featured-prints funnel.)
- **Risk: hero overlay readability.** The home-overlay byline sits over an arbitrary photograph at full viewport. If a particular hero frame is too bright, the white text + shadow may not survive. Mitigation if surfaced at the checkpoint: a subtle scrim gradient on the bottom 40% of the hero (`.hero::after` with `background: linear-gradient(transparent, rgba(0,0,0,0.4))`). Don't preemptively add — only if a real legibility problem shows up.
- **Risk: dark mode + hero image filter interaction.** The `brightness(0.92)` dim on hero images in dark mode may make a deep image too dark. If the user reports a frame is unreadable in dark mode, swap the filter for a contrast-preserving alternative (`filter: brightness(0.95) contrast(1.02)`). Same: don't preemptively add.
