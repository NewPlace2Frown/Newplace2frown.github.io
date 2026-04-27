# NewPlace2Frown Relaunch — Design Spec

**Date:** 2026-04-27
**Owner:** Leon Morgan
**Status:** Draft for review

## 1. Goal

Relaunch NewPlace2Frown as a coherent two-surface presence — a portfolio at `newplace2frown.com` and a focused print store at `shop.newplace2frown.com` — with a shared visual identity, a real funnel between them, and a backend that doesn't fight the addition of new work. Increase print sales by making the work look serious, the artist legible, and the path to purchase friction-free.

## 2. Non-goals

- Not a CMS migration. The portfolio stays static, free to host, Git-versioned.
- Not a Shopify replatform. We work within Shopify Starter constraints and put the design effort into the portfolio.
- Not a marketing/SEO/ads strategy. The focus is the surfaces themselves; demand-generation is out of scope for this spec.
- Not a logo redesign. The existing chrome wordmark stays; it's repositioned, not replaced.

## 3. Architecture

### Two surfaces, one funnel

- **Portfolio** at `newplace2frown.com` — Eleventy-generated static site, hosted on GitHub Pages. The primary brand surface. Houses About, Projects, Journal/Blog, and a "Prints" section that surfaces featured prints with embedded Shopify Buy Buttons.
- **Shopify storefront** at `shop.newplace2frown.com` — the full catalogue, checkout, and post-purchase. Visually aligned within Starter-plan limits (typography, colour, copy) but not a custom theme. Linked from every portfolio page.

### Why this split

- Portfolio is the surface that builds trust; store is the surface that converts. Treating them as one site (option D in brainstorming) would force everything into Shopify's theming constraints. Treating them as fully separate (current state) leaves no funnel.
- Buy Buttons are explicitly supported on Shopify Starter — this is the use case Starter was designed for. No upgrade required.

### Funnel

- Portfolio Project page → "Prints from this series" section with Buy Buttons for the relevant SKUs → Shopify checkout.
- Portfolio Prints page → curated featured prints (limited editions first) with Buy Buttons → "Browse the full shop" link → `shop.newplace2frown.com`.
- Shopify storefront footer → links back to portfolio About, Journal, and home.

## 4. Backend (portfolio)

### Eleventy migration

Replace the current hand-authored HTML pages with Eleventy. Justification: adding a project today means hand-editing HTML, copying boilerplate `<aside>` markup, updating `nav.html`, and running the gallery generator. With Eleventy a new project is "drop folder of images, write a markdown file with title/year/intro, push." Nav builds itself from the project list.

### Source structure

```
src/
  _data/
    site.js          # global config (nav order, social links, shop URL)
    projects.js      # auto-derived from src/projects/*.md
  _includes/
    layouts/
      base.njk       # sidebar + main panel
      project.njk    # project page template
      page.njk       # generic content page
    partials/
      sidebar.njk
      socials.njk
      buy-button.njk # Shopify Buy Button embed wrapper
  projects/
    gambia-2019.md   # frontmatter: title, year, place, intro, image_dir, featured_prints[]
    morecambe.md
    lancaster.md
    ...
  journal/
    2026-04-27-some-post.md
  about.md
  prints.md
  contact.md
  index.njk          # homepage
assets/
  media/
    projects/
      gambia-2019/   # images live here, referenced by frontmatter
      morecambe/
  fonts/
  css/
  js/
.eleventy.js
package.json
```

### Build

- `npm run dev` — Eleventy serve with hot reload.
- `npm run build` — output to `_site/`, deployed to GitHub Pages via Actions.
- The existing `scripts/generate-gallery.js` is replaced by an Eleventy data file or shortcode that reads images from `assets/media/projects/<slug>/` at build time.
- Existing tests in `tests/` are removed or rewritten — they test the old client-side nav loader which no longer exists.

### Hosting & domain

- GitHub Pages serves `newplace2frown.com` (already configured via `CNAME`).
- Shopify gets `shop.newplace2frown.com` configured as a custom domain in Shopify admin (Starter supports custom domains on subdomains).
- A DNS CNAME `shop` → `shops.myshopify.com` is added at the registrar.

## 5. Visual identity

### Direction: "field journal"

The site behaves like a working photographer's notebook made public. Inspiration acknowledged: Nicolas Nova's *Bestiary of the Anthropocene* — specimen-card metadata, dignified type, weight given to negative space. We borrow the *vocabulary* (dateline-style metadata blocks, fixed-width labels, restrained ornament) without copying the visual style.

### Type

- **Display:** GT Sectra (editorial, slight idiosyncrasy, used for project titles, headings, the wordmark fallback if needed).
- **Body:** Söhne (utilitarian sans, used for body copy, nav, captions, metadata).
- **Mono (limited use):** a system mono stack (`ui-monospace, SFMono-Regular, Menlo, monospace`) for dateline labels and metadata keys (PLACE / YEAR / EDITION).
- Native browser rendering with `font-display: swap`, subsetted woff2 files. **Pretext to be re-evaluated at typography implementation stage** — included only if it earns a measurable benefit over the native stack.
- GT Sectra and Söhne are commercial fonts. Licensing cost and source of truth for the files is a decision point at implementation; if cost is prohibitive, fallbacks are: GT Sectra → EB Garamond or Cormorant Garamond (Google Fonts); Söhne → Inter or IBM Plex Sans (open source).

### Colour

- Monochrome. White background, near-black text (`#111`), one mid-grey for secondary text and rules (`#888`), one accent reserved for hover states only (TBD at implementation, likely a muted ink-blue or burnt red — single accent, used sparingly).
- No gradients, no shadows. The chrome logo is the only non-flat element on the page.

### Layout

- **Sidebar (left, fixed, ~240px desktop):** wordmark top, nav middle, social icons bottom. One vertical rule separates sidebar from main panel; otherwise no borders or boxes.
- **Main panel:** single-column. Body text in a measured 60–72ch column, left-aligned, never justified. Images either full-bleed (max-width: 100% of main panel) or contained at a consistent max-width with generous margins.
- **No two-column About-page-style layouts.** Image first (full-width), then prose below.

### The chrome logo

Stays. Repositioned: lives in the sidebar top, rendered ~80–100px wide max, with 32px+ padding around it so nothing else touches it. Animation triggers on hover only (or once on page load), not constantly. The wordmark is the one expressive thing on the page; everything else is restrained so it has room to be weird.

### Responsiveness

- Desktop (≥1024px): sidebar + main panel as described.
- Tablet (768–1023px): sidebar narrows to ~200px; main panel reflows.
- Mobile (<768px): sidebar collapses behind a top-left hamburger (current pattern preserved). Mobile nav is full-screen overlay, not a cramped drawer. Main panel goes full-width with reduced padding.
- Images on mobile: full-bleed by default (edge-to-edge), captions below.

### Motion

- Subtle. Image transitions on the homepage and project galleries fade (300ms ease-in-out), no slides or zooms.
- Sidebar nav items: underline animates in on hover (200ms).
- Logo: hover animation as described.
- No scroll-jacking, no parallax, no full-page transitions.

## 6. Information architecture

### Sidebar (final)

Single-level only. No nested folders by default. The current `<details>`-based folders go.

```
[CHROME LOGO]

Work
Projects
Journal
Prints
About
Contact

[SOCIAL ICONS]
```

- **Work** = a single curated highlight reel — the strongest 20–30 images across all series, presented as a sequence with no series labels. The "if you only see one page" page. Distinct from Projects: this is the *edit*, Projects is the *archive*.
- **Projects** = index of series; each is a real page with intro and full image sequence (Gambia 2019, Gambia 2023, Morecambe, Lancaster, Wales, Cardiff, etc.). Projects index page is a list of series with a representative image and year for each.
- **Journal** = the blog. Renamed from "Blog" to fit the field-journal metaphor.
- **Prints** = the funnel into Shopify. Featured prints (limited editions first), each with embedded Buy Button, plus a clear "Browse full shop →" link.
- **About** = artist statement + bio. Single-column rewrite of current About.
- **Contact** = working social links + email + commission inquiry note.

The current "Drafts" page is removed from public nav (move to local-only or delete).
The `unlinked/` folder stays unlinked.
`Docphot-Contextual-Statements.html` either becomes a Journal post or a linked page from About — decided at implementation.

### Homepage (final)

**Hybrid of options A and C from brainstorming.**

Above the fold:
- Single full-bleed rotating image (8–12s rotation, fade transition).
- Small caption bottom-left: place + year, in mono.
- Sidebar is the only chrome.

Below the fold (visible on scroll):
- A "Latest" block: most recent project or journal post, single image + title + one-line teaser. Pulls returning visitors deeper without crowding the cinematic first impression.

That's it. No grid of thumbnails, no "featured collection" carousels, no email signup popup. Email signup lives on Journal and About pages.

### Project pages

Each project is a single scrollable page:
- Project title (display type, large).
- Dateline metadata block in mono (PLACE / YEAR / N IMAGES) — Bestiary-style.
- 100–250 word intro in body type.
- Sequence of images, full-width within the main panel, generous spacing between.
- (Optional) per-image captions in mono.
- Footer block: "Prints from this series" with embedded Buy Buttons for the SKUs that come from this series. Links to Shopify for everything else.

### Journal

- Reverse-chronological index page.
- Each post is markdown, rendered via Eleventy.
- Posts can include images via the same Eleventy image shortcode.
- RSS feed generated at build time.

### Prints page (the funnel)

- Short intro: what the prints are, paper, sizing, edition policy.
- Grid of featured prints (start with the limited editions). Each card: image, title, place/year in mono, price, Buy Button.
- "Browse the full shop →" link to `shop.newplace2frown.com`.

## 7. Shopify scope (Starter-realistic)

Within Starter plan limits — no theme customisation beyond what the admin allows.

### Must-fix (blocks credibility)

- **Custom domain:** `shop.newplace2frown.com` set as primary in Shopify admin; DNS CNAME added at registrar.
- **Page title:** change from "Welcome!" to a real title (e.g. "NewPlace2Frown — Prints by Leon Morgan").
- **Footer social links:** fix all five — Facebook, Instagram, YouTube, TikTok, Twitter — currently pointing at internal Shopify URLs without `https://` prefix. Replace with real profile URLs.
- **Add link to portfolio:** footer link "About the artist →" pointing to `newplace2frown.com/about`.

### Should-fix (lifts conversion)

- **Collections by series:** create collections for Gambia 2019, Gambia 2023, Morecambe, Lancaster, Cardiff, Wales. Assign products. Each collection gets a 50–100 word intro in the description field.
- **Product descriptions:** rewrite for the limited editions first (Esso After Dark, Landing At Juffureh) — paragraph on the image, edition status, paper/sizing notes. Working-filename-style slugs (`baygateway_8bit_fuji_matt`, `senegambia-beach-girls_8bit_fuji-matte`) get rewritten to human-readable slugs; Shopify auto-creates redirects so links don't break.
- **Email signup:** add via Shopify Forms if available on Starter; otherwise a Mailchimp/Buttondown embed in the footer. **To verify at implementation:** Shopify Forms availability on Starter.
- **Pull or commit on the hoodie:** decision required. Spec recommends pulling unless a small artist-merch line (zine, postcard set, tote) is committed to in this scope.

### Out of scope for this spec

- Theme replacement or customisation beyond admin-available settings.
- Klaviyo/email automation flows (welcome sequence, abandoned cart). Email capture only.
- Pricing tier review (the £20 → £100 gap). Worth doing, but a separate decision.
- FAQ / Shipping / Print Care page. Worth doing later; not blocking.

## 8. Implementation checkpoint plan (high-level)

The detailed implementation plan is generated by the `writing-plans` skill after this spec is approved. High-level checkpoints, in order:

1. **Eleventy scaffold** — new branch, set up Eleventy, port one project page (Morecambe) end-to-end as the reference implementation. **Checkpoint: review the rendered Morecambe page in browser before continuing.**
2. **Visual identity wired in** — type, colour, layout, sidebar, repositioned logo. Apply to the reference page. **Checkpoint: review the look in browser, on desktop and mobile, sign off the visual direction.**
3. **Port remaining content** — About, Contact, all projects, Journal scaffold, homepage with rotating image. **Checkpoint: walk the whole site, confirm content + IA.**
4. **Prints page + Buy Button integration** — pick 4–6 featured prints, generate Buy Button embeds in Shopify admin, integrate into Prints page and project page footers. **Checkpoint: test a real purchase flow end-to-end (can be cancelled before payment).**
5. **Shopify must-fix pass** — domain, page title, social links, portfolio link in footer. **Checkpoint: confirm in live admin.**
6. **Shopify should-fix pass** — collections, descriptions for limited editions, email signup, hoodie decision. **Checkpoint: review storefront live.**
7. **Cutover** — merge to main, GitHub Pages serves the new site at `newplace2frown.com`, old HTML files retired.

Each checkpoint is a stop. No moving forward without sign-off.

## 9. Open questions to resolve at implementation

- GT Sectra / Söhne licensing cost — confirm or fall back to Google Fonts pairing.
- Pretext evaluation — quick test, in or out.
- Single accent colour for hover states — TBD, decided when type and layout are in.
- Hoodie — pull, or commit to a small merch line.
- Shopify Forms availability on Starter (vs. third-party email embed).
- Whether `Docphot-Contextual-Statements.html` becomes a Journal post or an About-linked page.
- Whether the homepage "Latest" block points at most-recent Project or most-recent Journal post (decided when Journal has content).

## 10. What success looks like

- A cold visitor lands on `newplace2frown.com`, immediately understands they're looking at a working documentary photographer, and can navigate to projects, prints, or about within one click.
- A returning visitor finds something new — most recent project or journal post — without searching.
- Adding a new project is: drop folder, write 100–200 words, push. Less than 10 minutes.
- The Shopify store reads as the same studio as the portfolio: same wordmark, same socials, same voice in product descriptions.
- The path from "I like this image" to "I bought this print" is at most three clicks: project page → Buy Button → checkout.
