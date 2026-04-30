# newplace2frown.com

Documentary photography portfolio + journal for Leon Morgan. Eleventy-built static site, deployed to GitHub Pages.

## Stack

- **[Eleventy 3](https://www.11ty.dev/)** (ESM) — static site generator. Source in `src/`, output in `_site/`.
- **Vitest** — test runner. Suites in `tests/`.
- **Vanilla CSS / JS** — no build pipeline beyond Eleventy. Stylesheet at `assets/css/site.css`, scripts in `assets/js/`.
- **GitHub Actions** — `.github/workflows/deploy.yml` builds and deploys to Pages on push to `main`.

## Quick start

```bash
npm install
npm run dev          # serve at http://localhost:8080
npm run build        # write static site to _site/
npm test             # run the Vitest suite
npm run clean        # wipe _site/ (use if dev hits stale state)
npm run dev:clean    # clean + dev in one
```

## Source layout

```
src/
  index.njk                  homepage with rotating hero
  about.md, contact.md, work.md
  shrine.njk                 easter-egg page (do not link)
  projects/                  series pages (markdown frontmatter -> project.njk)
  journal/                   reverse-chronological journal posts
  _includes/
    layouts/                 base.njk, page.njk, project.njk, journal-post.njk
    partials/                sidebar.njk, head-meta.njk, hero-rotator.njk, socials.njk
  _data/
    site.js                  global config: title, nav, socials, shopUrl, formspreeEndpoint
    work.js                  curated highlight image list for /work/
    guestbook.json           moderated shrine guestbook entries
    shrineImages.js          gallery list built from project frontmatter

assets/
  css/site.css               field-journal stylesheet (light + dark tokens)
  css/shrine.css             scoped Win98 stylesheet for /shrine/ only
  js/site.js                 mobile sidebar toggle
  js/theme.js                light/dark mode (system preference + manual override)
  js/logo.js                 typeset wordmark animation
  js/easter-eggs.js          global egg listeners (Konami, "frown" sequence, etc.)
  js/shrine.js               windows + gallery + guestbook for /shrine/
  js/hero-rotator.js         homepage hero crossfade
  media/                     project images (optimised, max 2400px wide)

tests/
  build.test.mjs             smoke-tests the Eleventy build
  layout.test.mjs            asserts sidebar, nav, project metadata render
  content.test.mjs           asserts every nav route resolves

scripts/
  optimise-images.mjs        resize + recompress assets/media/ in place

docs/superpowers/            specs, plans, and runbooks for major changes
```

## Adding a project

1. Create `src/projects/<slug>.md` with this frontmatter:
   ```yaml
   ---
   layout: layouts/project.njk
   title: <name>
   permalink: /projects/<slug>/
   place: <where>
   year: <year or year-range>
   intro: >
     <p>One or two paragraphs of context.</p>
   images:
     - { src: "/assets/media/<file>", alt: "<alt>", caption: "<caption>" }
     - ...
   ---
   ```
2. Drop the images into `assets/media/`.
3. Run `node scripts/optimise-images.mjs` to compress them in place (skips files <500KB).
4. Add the new project to the `Projects` children list in `src/_data/site.js` so it appears in the sidebar.
5. `npm run dev` to preview, `npm test` to confirm, commit, push.

## Adding a journal post

1. Create `src/journal/YYYY-MM-DD-<slug>.md` with `title:` and `date:` in frontmatter; markdown body.
2. The journal index, layout, and `/journal/<slug>/` permalink are wired automatically via `src/journal/journal.11tydata.js`.

## The shrine (easter egg page)

`/shrine/` is a deliberately unlinked Win98-pastiche page reachable via three triggers (Konami code on any page, typing "frown" anywhere outside form fields, or a console hint on the homepage). Includes a guestbook backed by [Formspree](https://formspree.io/); see `docs/superpowers/shrine-content.md` for the moderation runbook.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`, which runs the test suite, builds, and uploads `_site/` as a Pages artifact. Pages source must be set to **GitHub Actions** in repo Settings -> Pages.

The `pre-push` git hook (Husky) runs `npm test` locally before any push.

## Custom domain

`CNAME` contains `newplace2frown.com`. DNS A/AAAA records point at GitHub's Pages servers; no `www` configured.

## Notes

- Image optimisation is one-shot via `scripts/optimise-images.mjs`. Run it whenever new images are added; it's idempotent and skips already-small files.
- Dark mode tokens live in `assets/css/site.css` under `html[data-theme="dark"]`. The toggle persists in `localStorage` and respects `prefers-color-scheme` on first visit.
- Tests run sequentially (`vitest.config.mjs` sets `fileParallelism: false`) because parallel Eleventy builds contend for `_site/` writes on Windows.
