# Plan 03 — Buy Button Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisites:**
- Plan 01 + Plan 02 complete and approved (Eleventy scaffold + content port).
- User has access to the Shopify admin to generate Buy Button embed snippets (this is the one Shopify-side dependency in this plan; the agent cannot do this — it must be handed to the user with explicit instructions and waited on).

**Goal:** Wire the portfolio site to the store. Build a `/prints/` page that surfaces 4–6 featured prints with embedded Shopify Buy Buttons, and add a "Prints from this series" footer block to project pages that have associated SKUs. After this plan, a visitor can move from a project page to a Buy Button to a Shopify checkout in three clicks.

**Architecture:** Buy Buttons are embedded via Shopify's official ShopifyBuy JS SDK. Each product gets a unique embed snippet generated in the Shopify admin (Sales channels → Buy Button → Create a Buy Button → Product → Embed code). The snippets contain the storefront access token and product ID; they are safe to commit to a public repo (the storefront access token is a public credential by design — abuse vectors are limited to spamming the cart). The agent collects the snippets from the user, converts each to a normalised data record in `src/_data/products.js`, and renders all Buy Buttons with one shared partial that loads the SDK once.

**Tech Stack:** Eleventy 3, Nunjucks, Shopify Buy Button SDK (loaded from `sdks.shopifycdn.com`).

---

## Pre-flight notes for the implementing agent

- **The storefront access token in a Buy Button snippet is public by design.** Don't be alarmed by committing it. It's scoped to read-only product/checkout access on a single store; it's not the Admin API key.
- The Buy Button SDK script is loaded from Shopify's CDN. We accept this dependency for the convenience of using Shopify's official integration. Loaded with `defer` and only on pages that use it.
- The exact products to feature must come from the user. The spec recommends starting with the limited editions (Esso After Dark, Landing At Juffureh) plus 2–4 others. Surface this at Task 2.
- Do not attempt to scrape the existing Shopify storefront for product IDs — they're not stable identifiers in URLs. The Buy Button admin flow is the canonical source.
- This plan does not change anything in the Shopify admin beyond generating Buy Button snippets — full admin work (domain, social links, collections, descriptions) is Plan 04.

---

## File structure (this plan creates and modifies)

**Creates:**
```
src/
  _data/
    products.js                     # array of normalised product records
  _includes/
    partials/
      buy-button.njk                # renders one Buy Button container by product id
      buy-button-sdk.njk            # loads the Shopify SDK script (included once per page that needs it)
  prints.md                         # the Prints page
docs/
  superpowers/
    buy-button-snippets.md          # raw snippets pasted by the user (gitignored OK; or committed for reference)
assets/
  css/
    site.css                        # APPEND — prints page styles + buy button container styling
```

**Modifies:**
```
src/_includes/layouts/project.njk   # adds optional "Prints from this series" footer block
src/projects/*.md                   # adds optional `prints:` frontmatter array per project
```

---

## Task 1: Brief the user on what's needed from Shopify, and wait

**Files:** none — this is a coordination step.

- [ ] **Step 1: Surface the brief**

Tell the user verbatim:

> "Plan 03 needs Buy Button embed snippets from your Shopify admin. Here's exactly what to do — takes about 5 minutes per product:
>
> 1. In Shopify admin, go to **Sales channels** in the left rail. If 'Buy Button' isn't listed, click **+** next to Sales channels and add it (free, no plan upgrade).
> 2. Inside Buy Button channel, click **Create a Buy Button** → **Product Buy Button**.
> 3. Pick the product. Use defaults for layout (or pick 'classic'). Click **Next** → **Generate code**.
> 4. Copy the entire `<div id='product-component-...'> ... </script>` block.
> 5. Paste it into a message to me, prefixed with the product's slug (e.g. `esso-after-dark:` then the snippet).
>
> I need 4–6 products. The spec recommends starting with:
> - Esso After Dark *Limited Edition Print*
> - Landing At Juffureh *Limited Edition Print*
> - 2–4 others of your choice (the prints you most want to push)
>
> Tell me the slugs you'll use (URL-friendly, lowercase, dashes — e.g. `esso-after-dark`) and paste the snippets. I'll handle the rest."

- [ ] **Step 2: Wait for the user response**

Do not proceed to Task 2 until the user has provided at least one snippet. If they want to start with one product and add more later, that's fine — Task 2 is structured to accept any N ≥ 1.

---

## Task 2: Capture snippets, extract product records

**Files:**
- Create: `docs/superpowers/buy-button-snippets.md` (raw snippets for reference)
- Create: `src/_data/products.js`

- [ ] **Step 1: Save the raw snippets**

Create `docs/superpowers/buy-button-snippets.md` with each snippet under a heading matching its slug:

```markdown
# Buy Button raw snippets

Captured from Shopify admin. Source of truth for the data records in `src/_data/products.js`.
Storefront access tokens here are public by design — see plan preamble.

## esso-after-dark
<paste snippet here>

## landing-at-juffureh
<paste snippet here>

(etc.)
```

- [ ] **Step 2: Parse each snippet**

Each Shopify Buy Button snippet contains a structure like:

```html
<div id='product-component-1234567890'></div>
<script type="text/javascript">
/*<![CDATA[*/
(function () {
  var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }
  function loadScript() { ... }
  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'newplace2frown.myshopify.com',
      storefrontAccessToken: 'abcdef0123456789...',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: '7891234567890',
        node: document.getElementById('product-component-1234567890'),
        moneyFormat: '%C2%A3%7B%7Bamount%7D%7D',
        options: { ... }
      });
    });
  }
})();
/*]]>*/
</script>
```

For each snippet, extract:
- `slug` (the user-provided slug)
- `componentId` (the number after `product-component-`)
- `productId` (the value of `id:` inside `createComponent`)
- `domain` (the `domain:` value, usually `newplace2frown.myshopify.com`)
- `storefrontAccessToken`
- `moneyFormat` (URL-encoded; default is `£{{amount}}` URL-encoded)

Title and price aren't in the snippet — the SDK fetches them at runtime. The agent must ask the user for the human-readable `title` and `place`/`year` for each product (or extract from the corresponding project markdown if obvious).

- [ ] **Step 3: Write src/_data/products.js**

Create `src/_data/products.js` with one record per snippet:

```javascript
// Product records derived from Shopify Buy Button embed snippets.
// Source of truth: docs/superpowers/buy-button-snippets.md
//
// All fields except title/place/year/series come from the snippets themselves.
// title/place/year/series are filled in by hand for the data-driven Prints page.
//
// Storefront access tokens are public by design.

export default [
  {
    slug: 'esso-after-dark',
    title: 'Esso After Dark',
    place: 'Lancaster, England',
    year: 2020,
    edition: 'Limited Edition Print',
    series: 'morecambe',                  // matches a project page slug if one exists
    image: '/assets/media/ESSO AFTER DARK.jpeg',
    componentId: 'PASTE_FROM_SNIPPET',
    productId: 'PASTE_FROM_SNIPPET',
    domain: 'newplace2frown.myshopify.com',
    storefrontAccessToken: 'PASTE_FROM_SNIPPET',
    moneyFormat: '%C2%A3%7B%7Bamount%7D%7D'
  },
  {
    slug: 'landing-at-juffureh',
    title: 'Landing At Juffureh',
    place: 'The Gambia',
    year: 2019,
    edition: 'Limited Edition Print',
    series: 'gambia-2019',
    image: '/assets/media/Landing at Juffureh.jpg',
    componentId: 'PASTE_FROM_SNIPPET',
    productId: 'PASTE_FROM_SNIPPET',
    domain: 'newplace2frown.myshopify.com',
    storefrontAccessToken: 'PASTE_FROM_SNIPPET',
    moneyFormat: '%C2%A3%7B%7Bamount%7D%7D'
  }
  // ... one entry per product
];
```

The agent fills in the `PASTE_FROM_SNIPPET` placeholders with the actual values from each snippet, and adds one entry per snippet provided. `title`, `place`, `year`, `edition`, `series`, `image` come from the user (asked at Step 2) or the matching project markdown.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/buy-button-snippets.md src/_data/products.js
git commit -m "feat(shop): capture Buy Button snippets, normalise into products.js"
```

---

## Task 3: Buy Button SDK partial + per-product embed partial

**Files:**
- Create: `src/_includes/partials/buy-button-sdk.njk`
- Create: `src/_includes/partials/buy-button.njk`

- [ ] **Step 1: Write the SDK loader partial**

The SDK loads itself on first use. We expose a single shared init that all per-product embeds share — that way we load the SDK once per page no matter how many products are rendered.

Create `src/_includes/partials/buy-button-sdk.njk`:

```njk
<script>
(function () {
  if (window.__npfBuyButtonInit) return;
  window.__npfBuyButtonInit = true;
  window.__npfPendingProducts = window.__npfPendingProducts || [];

  function loadSDK(cb) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) { cb(); return; }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  window.__npfRenderProduct = function (cfg) {
    if (!window.ShopifyBuy || !window.ShopifyBuy.UI) {
      window.__npfPendingProducts.push(cfg);
      loadSDK(function () {
        var pending = window.__npfPendingProducts;
        window.__npfPendingProducts = [];
        pending.forEach(function (c) { window.__npfRenderProduct(c); });
      });
      return;
    }
    var client = ShopifyBuy.buildClient({
      domain: cfg.domain,
      storefrontAccessToken: cfg.storefrontAccessToken
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: cfg.productId,
        node: document.getElementById('product-component-' + cfg.componentId),
        moneyFormat: cfg.moneyFormat,
        options: {
          product: {
            styles: {
              product: { '@media (min-width: 601px)': { 'max-width': '100%', 'margin-left': '0', 'margin-bottom': '50px' } },
              button: { 'background-color': '#111111', ':hover': { 'background-color': '#333333' }, 'border-radius': '0' }
            },
            buttonDestination: 'checkout',
            contents: { img: false, title: false, price: true }
          }
        }
      });
    });
  };
})();
</script>
```

The SDK loader is intentionally minimal. The `contents` config above hides the SDK's image and title because we render those ourselves with our own typography — the Buy Button just shows price + button.

- [ ] **Step 2: Write the per-product embed partial**

Create `src/_includes/partials/buy-button.njk`:

```njk
{# Renders the container for one product's Buy Button. Expects `product` in scope. #}
<div class="buy-button" data-slug="{{ product.slug }}">
  <div id="product-component-{{ product.componentId }}"></div>
  <script>
    window.__npfRenderProduct({
      componentId: "{{ product.componentId }}",
      productId: "{{ product.productId }}",
      domain: "{{ product.domain }}",
      storefrontAccessToken: "{{ product.storefrontAccessToken }}",
      moneyFormat: "{{ product.moneyFormat | safe }}"
    });
  </script>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/_includes/partials/buy-button-sdk.njk src/_includes/partials/buy-button.njk
git commit -m "feat(shop): Buy Button SDK loader + per-product embed partial"
```

---

## Task 4: Prints page

**Files:**
- Create: `src/prints.md`
- Modify: `assets/css/site.css` (append prints styles)

- [ ] **Step 1: Write src/prints.md**

Create `src/prints.md`:

```markdown
---
layout: layouts/base.njk
title: Prints
permalink: /prints/
---

<header class="page-header">
  <h1>Prints</h1>
  <p class="page-subtitle">Limited and open editions / shipped from the UK</p>
</header>

<div class="prints-intro">
  <p>A small selection of work, available as fine art prints. Limited editions are signed and numbered; open editions are printed to order. Each print is made on archival fine art paper and shipped flat.</p>
  <p>For the full catalogue, including framed pieces and additional images: <a href="https://shop.newplace2frown.com">visit the shop →</a></p>
</div>

{% include "partials/buy-button-sdk.njk" %}

<section class="prints-grid">
{% for product in products %}
  <article class="print-card">
    <figure>
      <img src="{{ product.image }}" alt="{{ product.title }}" loading="lazy">
    </figure>
    <div class="print-meta">
      <h2 class="print-title">{{ product.title }}</h2>
      <p class="print-tag">
        <span>{{ product.place }}</span>
        <span>·</span>
        <span>{{ product.year }}</span>
        {% if product.edition %}<span>·</span><span>{{ product.edition }}</span>{% endif %}
      </p>
      {% set product = product %}
      {% include "partials/buy-button.njk" %}
    </div>
  </article>
{% endfor %}
</section>

<p class="prints-footer">
  <a href="https://shop.newplace2frown.com">Browse the full shop →</a>
</p>
```

- [ ] **Step 2: Append prints styles**

Append to `assets/css/site.css`:

```css
/* ---- Prints page ---- */

.prints-intro {
  max-width: var(--measure);
  margin: 0 0 3rem;
}
.prints-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 96px;
}
.print-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
.print-card figure {
  margin: 0;
}
.print-card img {
  width: 100%;
  height: auto;
  display: block;
}
.print-title {
  font-family: var(--serif);
  font-size: 1.5rem;
  margin: 0 0 0.4rem;
}
.print-tag {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
}
.print-tag span { display: inline-block; }
.buy-button { margin-top: 0.5rem; }
.prints-footer {
  margin-top: 4rem;
  font-family: var(--mono);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (min-width: 900px) {
  .print-card {
    grid-template-columns: 1.4fr 1fr;
    gap: 3rem;
    align-items: start;
  }
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run dev`, visit `/prints/`. Expect:
- Intro paragraph + link to full shop.
- Each product: image (left on desktop, top on mobile), title + place/year/edition mono row, Buy Button below.
- The Buy Button hydrates after a second or two — initially the container is empty, then a "£X — Add to cart" button appears.
- Clicking the button takes you to `newplace2frown.myshopify.com/cart` or to the Shopify checkout — confirm the flow works (cancel before payment).

If the button never hydrates, open the browser console — usually a CSP or token issue. The token in the snippet must match the one rendered into the partial; double-check `products.js`.

- [ ] **Step 4: Commit**

```bash
git add src/prints.md assets/css/site.css
git commit -m "feat(prints): /prints/ page with Buy Button grid + full-shop link"
```

---

## Task 5: "Prints from this series" on project pages

**Files:**
- Modify: `src/_includes/layouts/project.njk`
- Modify: `assets/css/site.css` (append project-prints styles)

- [ ] **Step 1: Update the project layout to render prints from the series**

Replace `src/_includes/layouts/project.njk` with:

```njk
---
layout: layouts/base.njk
---
<article class="project">
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
      {% if img.caption %}<figcaption>{{ img.caption }}</figcaption>{% endif %}
    </figure>
  {% endfor %}
  </section>

  {# Prints from this series — only render if any product matches the project's slug. #}
  {% set seriesSlug = page.fileSlug %}
  {% set seriesPrints = products | filter("series", seriesSlug) %}
  {% if seriesPrints and seriesPrints.length > 0 %}
    <aside class="project-prints">
      <h2>Prints from this series</h2>
      {% include "partials/buy-button-sdk.njk" %}
      <div class="project-prints-grid">
      {% for product in seriesPrints %}
        <article class="project-print-card">
          <figure>
            <img src="{{ product.image }}" alt="{{ product.title }}" loading="lazy">
          </figure>
          <div>
            <h3 class="print-title">{{ product.title }}</h3>
            <p class="print-tag">
              {% if product.edition %}<span>{{ product.edition }}</span>{% endif %}
            </p>
            {% set product = product %}
            {% include "partials/buy-button.njk" %}
          </div>
        </article>
      {% endfor %}
      </div>
      <p class="prints-footer">
        <a href="/prints/">All prints →</a>
      </p>
    </aside>
  {% endif %}
</article>
```

The `filter` filter was registered in Plan 02 Task 5 — it filters an array of records by a key/value match. We reuse it here.

- [ ] **Step 2: Append project-prints styles**

Append to `assets/css/site.css`:

```css
/* ---- Project page: prints-from-this-series footer ---- */

.project-prints {
  margin-top: 96px;
  padding-top: 48px;
  border-top: 1px solid var(--rule);
}
.project-prints h2 {
  margin: 0 0 1.5rem;
  font-size: 1.3rem;
}
.project-prints-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
}
.project-print-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.project-print-card img {
  width: 100%;
  height: auto;
  display: block;
}

@media (min-width: 700px) {
  .project-prints-grid { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run dev`. For each project that has a matching `series` in `products.js`:
- Visit the project page.
- Scroll to bottom — expect the "Prints from this series" block with one Buy Button per matching product.
- For projects with no matching products (e.g. Cardiff if no Cardiff print exists), confirm the block is absent.

- [ ] **Step 4: Commit**

```bash
git add src/_includes/layouts/project.njk assets/css/site.css
git commit -m "feat(project): Prints from this series footer with Buy Buttons"
```

---

## Task 6: End-to-end purchase flow check (manual)

**Files:** none.

- [ ] **Step 1: Start dev server, walk the funnel**

Run: `npm run dev`.

Walk these flows and capture findings (don't actually purchase — cancel before payment):

1. Home → click "Prints" in sidebar → click Buy Button on a featured print → land in Shopify checkout → cancel.
2. Home → click "Projects" in sidebar → click a project that has prints (e.g. Morecambe) → scroll to "Prints from this series" → click Buy Button → land in Shopify checkout → cancel.
3. Mobile (<700px): repeat (1) and (2). Confirm the Buy Button is full-width and tappable.

If anything breaks: most likely cause is a wrong `productId` or `storefrontAccessToken` in `products.js`. Re-check against `docs/superpowers/buy-button-snippets.md`.

- [ ] **Step 2: Run the test suite**

Run: `npm test`
Expected: existing tests pass. (No new tests are added in this plan — the Buy Buttons hydrate at runtime from a third-party CDN, which is hostile to unit testing. Manual verification in Step 1 is the testing strategy.)

- [ ] **Step 3: Commit any small fixes from Step 1**

If you needed to correct any product records, commit the fix:

```bash
git add src/_data/products.js
git commit -m "fix(products): correct <field> for <slug>"
```

---

## Task 7: Funnel checkpoint with the user

**Files:** none.

- [ ] **Step 1: Surface the checkpoint**

Tell the user:

> "Plan 03 is implementation-complete. The funnel is live in dev:
>
> - `/prints/` — featured print grid, each with a working Buy Button.
> - Each project page that has matching prints shows a 'Prints from this series' block at the bottom.
>
> Please test the flow end-to-end (cancel at checkout — don't actually pay):
> - Click a Buy Button on `/prints/`. Does it open the Shopify checkout?
> - Click a Buy Button on a project page. Same question.
> - On mobile, are the buttons big enough to tap?
>
> Items I flagged that might need adjustment:
> - Featured product selection on `/prints/` — happy with these N products, or do you want to swap any?
> - 'Prints from this series' block: only appears on projects where a product's `series` field matches the project slug. If a print should appear on a different project, edit the `series` value in `src/_data/products.js`.
>
> Once approved, Plan 04 covers the Shopify-side admin work (custom domain, social links, collections, descriptions, email signup)."

**Do not start Plan 04 without explicit approval.** (Though Plan 04 has no code dependency on Plan 03 — the user can run them in either order or in parallel.)

---

## Self-review notes

- **Spec coverage:** Covers spec §3 (funnel: project → Buy Button → checkout, prints page → Buy Buttons → "browse full shop" link) and §6 (Prints page structure: intro, featured grid, browse full shop link). Spec §6 also says project pages should show "Prints from this series with embedded Buy Buttons for the SKUs that come from this series" — covered in Task 5.
- **Placeholder scan:** `PASTE_FROM_SNIPPET` strings in Task 2 Step 3 are *intentional templates* that the implementing agent fills in from the user-provided snippets — every step says explicitly that they must be replaced. Not a placeholder failure.
- **Type consistency:** `products.js` field names (`slug`, `title`, `place`, `year`, `edition`, `series`, `image`, `componentId`, `productId`, `domain`, `storefrontAccessToken`, `moneyFormat`) are referenced consistently in `prints.md`, `project.njk`, and `buy-button.njk`. Window globals (`__npfBuyButtonInit`, `__npfPendingProducts`, `__npfRenderProduct`) are defined in `buy-button-sdk.njk` and consumed in `buy-button.njk`. The `filter` Eleventy filter is reused from Plan 02 — defined once in `.eleventy.js`.
- **Public-token caveat:** The storefront access token is committed to a public repo. This is intentional and aligns with Shopify's design. If the user later objects, the path is to move the token into a build-time env var and inject at compile, but that adds CI complexity — not warranted unless the user objects.
