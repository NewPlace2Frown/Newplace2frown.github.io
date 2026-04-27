# Plan 04 — Shopify Admin Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** None. This plan can run in parallel with Plans 01–03 — it touches the Shopify admin and the registrar's DNS, not the codebase. Recommended order: run Plan 04 *after* Plan 03 because the cross-link from the Shopify footer to `newplace2frown.com/about` will land somewhere meaningful only once the new About page is live.

**Goal:** Bring the Shopify storefront up to a credibility baseline within Shopify Starter plan limits. Fix the broken footer social links, the "Welcome!" page title, and the bare `myshopify.com` domain. Group products into series collections. Rewrite descriptions for the limited editions. Add an email capture if Starter allows it. Decide on the hoodie. Cross-link back to the portfolio.

**Architecture:** This plan is mostly **guided manual steps in the Shopify admin and at the user's domain registrar**. The agent's role is to walk the user through each step with specific copy, links, and verification commands — and to capture decisions in a single tracking document so the work isn't lost. There is no code in this plan beyond a few DNS-related shell commands and a final markdown summary.

**Tech Stack:** Shopify admin (web UI), the user's DNS provider (web UI), `dig` / `nslookup` for DNS verification.

---

## Pre-flight notes for the implementing agent

- The agent **does not have direct Shopify admin access** unless explicitly given. Default assumption: the agent guides; the user clicks. Each task is structured as "tell the user exactly what to do, wait for confirmation, verify if possible".
- DNS changes propagate over minutes-to-hours. Don't block on DNS verification — give the verification command, mark the task done when the user confirms they made the change, then re-verify at the end.
- The "Working-filename slug rewrite" item from the spec (e.g. `senegambia-beach-girls_8bit_fuji-matte`) requires Shopify admin access to do well. Surface as a guided checklist for the user — Shopify auto-creates redirects from the old slug, so this is safe.
- **Email capture on Starter:** Shopify Forms availability on Starter is unverified. Task 7 starts by checking; if unavailable, falls back to a third-party embed (Buttondown, Mailchimp, ConvertKit). The user picks the provider.
- **Hoodie decision:** the spec puts this on the user. Task 8 surfaces the question and waits.

---

## File structure (this plan creates)

```
docs/
  superpowers/
    shopify-admin-changelog.md      # running log of every Shopify-side change made
```

No code changes to the Eleventy site in this plan. (The portfolio's links to the shop already point at `https://shop.newplace2frown.com` from Plans 01–03's site data — once the domain is wired up in Task 1, those links resolve.)

---

## Task 1: Custom domain — `shop.newplace2frown.com`

**Files:**
- Create: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Create the changelog file**

Create `docs/superpowers/shopify-admin-changelog.md`:

```markdown
# Shopify admin changelog

A running log of every Shopify-side change made during the relaunch.
Each entry: date, what changed, who made it, verification.

## 2026-04-27 — Plan 04 begins

(entries follow)
```

- [ ] **Step 2: Walk the user through DNS setup at their registrar**

Tell the user:

> "First step: add a DNS record at your domain registrar so `shop.newplace2frown.com` points at Shopify.
>
> 1. Log into your domain registrar (where you manage `newplace2frown.com`).
> 2. Find the DNS settings for `newplace2frown.com`.
> 3. Add a new **CNAME** record:
>    - **Host/Name:** `shop`
>    - **Value/Target:** `shops.myshopify.com`
>    - **TTL:** default (usually 1 hour / 3600s)
> 4. Save.
>
> Tell me when it's done. Don't move to the Shopify side yet."

- [ ] **Step 3: Verify the DNS record (after user confirms)**

Once the user confirms, verify:

```bash
dig +short shop.newplace2frown.com
```

(On Windows without `dig`, use: `nslookup shop.newplace2frown.com`.)

Expected: a CNAME response containing `shops.myshopify.com` (or an IP that ultimately resolves there). If nothing returns, wait 5 minutes and retry once. If still nothing, surface to the user — likely they edited the wrong DNS zone or the change hasn't propagated.

If propagation is slow, don't block — proceed to Step 4 and re-verify at the end of the plan.

- [ ] **Step 4: Walk the user through Shopify admin domain setup**

Tell the user:

> "Now in the Shopify admin:
> 1. Go to **Settings** (bottom-left) → **Domains**.
> 2. Click **Connect existing domain**.
> 3. Enter `shop.newplace2frown.com`. Click **Next**.
> 4. Shopify will check the DNS record. If green, click **Verify connection**.
> 5. Once verified, **set `shop.newplace2frown.com` as the primary domain** (this is the option that says 'Change primary domain' or similar — confirm before clicking).
>
> Tell me once it shows as primary."

- [ ] **Step 5: Verify the storefront resolves on the new domain**

Once user confirms, run:

```bash
curl -sI https://shop.newplace2frown.com/ | head -5
```

Expected: an HTTP 200 (or 301/302 to the same hostname). If certificate issues — Shopify provisions a free Let's Encrypt cert; can take 10–60 minutes after the domain is set as primary.

- [ ] **Step 6: Update the changelog**

Append to `docs/superpowers/shopify-admin-changelog.md`:

```markdown
### Custom domain
- DNS CNAME `shop` → `shops.myshopify.com` added at registrar (date: <fill in>).
- Domain `shop.newplace2frown.com` connected and set as primary in Shopify (date: <fill in>).
- Verified resolving with `curl -sI https://shop.newplace2frown.com/` returning <fill in status>.
```

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): custom domain shop.newplace2frown.com configured"
```

---

## Task 2: Page title and store metadata

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Walk the user through the title fix**

Tell the user:

> "Two minutes in admin to fix the browser-tab title that currently says 'Welcome!':
> 1. **Settings → General → Store details**.
>    - **Store name:** `NewPlace2Frown` (no change needed if this is already set).
> 2. **Online Store → Preferences** (left rail under Sales channels → Online Store).
>    - **Title:** `NewPlace2Frown — Prints by Leon Morgan`
>    - **Meta description:** `Documentary photography prints by Leon Morgan. Series from Lancaster, Morecambe Bay, West Wales, and The Gambia.`
> 3. Save.
>
> Tell me when done."

- [ ] **Step 2: Verify**

After user confirms:

```bash
curl -s https://shop.newplace2frown.com/ | grep -i '<title>' | head -1
```

Expected: `<title>NewPlace2Frown — Prints by Leon Morgan</title>` (or close — Shopify may append the page name).

- [ ] **Step 3: Update changelog**

```markdown
### Page title and meta
- Online Store → Preferences → Title set to "NewPlace2Frown — Prints by Leon Morgan".
- Meta description set.
- Verified with curl returning <fill in>.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): page title + meta description set"
```

---

## Task 3: Footer social links

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Walk the user through theme social-link fix**

The current footer points all social icons (Facebook, YouTube, TikTok, Twitter) at internal Shopify URLs missing `https://`. Only Instagram works.

Tell the user:

> "In the Shopify admin:
> 1. **Online Store → Themes**. Click **Customize** on the live theme.
> 2. In the theme editor, look for theme settings (usually a gear icon top-left or 'Theme settings' bottom-left).
> 3. Find **Social media** (most themes have this section).
> 4. Replace each URL with the correct one:
>    - Facebook: `` (leave blank if you don't have one — better blank than broken)
>    - Instagram: `https://instagram.com/le.on_photos`
>    - Twitter / X: `https://twitter.com/newplace2frown`
>    - YouTube: `` (leave blank if not active)
>    - TikTok: `https://www.tiktok.com/@newplace2frown`
> 5. **Save**.
>
> Tell me which socials you actually use so we don't show empty icons. Above is the spec's assumption — adjust for reality."

- [ ] **Step 2: Verify**

After user confirms:

```bash
curl -s https://shop.newplace2frown.com/ | grep -o 'https://[^"]*' | grep -E '(instagram|twitter|tiktok|facebook|youtube)' | sort -u
```

Expected: the active socials, all with `https://` and pointing at real platforms.

- [ ] **Step 3: Update changelog**

```markdown
### Footer social links
- Replaced internal-Shopify-URL placeholders with real profile URLs.
- Active socials: <list>. Removed: <list>.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): footer social links fixed"
```

---

## Task 4: Cross-link to portfolio in footer

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Walk the user through adding a portfolio link**

Most Shopify themes let you add custom footer menu items.

Tell the user:

> "In the Shopify admin:
> 1. **Online Store → Navigation**. Find the menu used in the footer (usually 'Footer menu').
> 2. **Add menu item**:
>    - Name: `About the artist`
>    - Link: `https://newplace2frown.com/about/`
> 3. Add a second menu item:
>    - Name: `Journal`
>    - Link: `https://newplace2frown.com/journal/`
> 4. Save the menu.
>
> If your theme doesn't expose a footer menu, tell me and we'll find the equivalent."

- [ ] **Step 2: Verify**

```bash
curl -s https://shop.newplace2frown.com/ | grep -o 'newplace2frown.com[^"]*' | sort -u
```

Expected: `newplace2frown.com/about/` and `newplace2frown.com/journal/` present.

- [ ] **Step 3: Update changelog and commit**

```markdown
### Footer cross-links
- Added "About the artist" → newplace2frown.com/about/
- Added "Journal" → newplace2frown.com/journal/
```

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): footer cross-links to portfolio"
```

---

## Task 5: Create collections by series

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Walk the user through creating collections**

Tell the user:

> "Now we group your prints into proper series. In the Shopify admin:
> 1. **Products → Collections → Create collection**.
> 2. For each series below, create a collection. Use **Manual** collection type for full control:
>    - **Title:** as listed
>    - **Description:** the prose I'll provide below
>    - **Add products:** drag in every product that belongs to that series
>
> Then in **Online Store → Navigation** → Main menu, add a menu item per collection.
>
> Collections to create:"

Then provide each collection name + description verbatim. Examples:

> **The Gambia, 2019**
> First trip — two weeks moving between Banjul, Senegambia, and inland to Juffureh and Makasutu. 35mm rangefinder, one lens, an unfamiliar light.
>
> **The Gambia, 2023**
> Returning four years later, mostly along Senegambia beach and inland to Lamin. Same camera, different eye — less ethnographic, more interested in the small repetitions of beach life.
>
> **Morecambe Bay**
> Photographs of the bay, made over six years walking the same stretch of coast in different weather, different company, different cameras. The bay is the constant.
>
> **Lancaster**
> Six years of walking the same town. The bus station, Common Garden Street, the bingo hall on Mainway, the Esso under sodium light.
>
> **Cardiff**
> A short, ongoing project from the year I was based in Cardiff. Wet, low-lit, walks well.
>
> **West Wales**
> Trips out from Cardiff into West Wales — St David's, the Pembrokeshire coast, the slow drive home. Polaroid and 35mm.

> "Tell me when each collection exists with products assigned, so I can verify."

- [ ] **Step 2: Verify**

After user confirms:

```bash
curl -s https://shop.newplace2frown.com/collections.json | head -100
```

Expected: JSON listing the collections. (Shopify exposes a public collections JSON endpoint by default.)

If the JSON endpoint isn't enabled, manually visit `https://shop.newplace2frown.com/collections` in a browser and confirm.

- [ ] **Step 3: Update changelog and commit**

```markdown
### Collections
- Created collections: Gambia 2019, Gambia 2023, Morecambe Bay, Lancaster, Cardiff, West Wales.
- Each has a 50–80 word description.
- Added to Main menu.
```

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): collections by series created and added to nav"
```

---

## Task 6: Rewrite descriptions for limited editions

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Walk the user through limited-edition rewrites**

Tell the user:

> "Limited editions are the highest-leverage products to rewrite first. Two products to start with:
>
> **Esso After Dark, Lancaster 2020 — Limited Edition Print**
> Replace the description with:
>
> > A petrol station on the Lancaster ring road, photographed at 11pm on a wet October night. The sodium light that used to define the British provincial night is on its way out — replaced by colder, whiter LEDs. This frame is part of a small body of work documenting that disappearing light.
> >
> > **Edition** Limited to 25 signed and numbered prints.
> > **Paper** Hahnemühle Photo Rag Baryta, 315gsm.
> > **Sizes** A4 (210 × 297mm) — £100. A3 (297 × 420mm) — £180. A2 (420 × 594mm) — £280. (Adjust the sizes/prices to match your real options.)
> > **Shipping** Rolled in a sturdy tube, shipped from the UK. Allow 5–7 days for printing.
>
> **Landing At Juffureh, Gambia 2019 — Limited Edition Print**
> Replace the description with:
>
> > Made on the bank of the River Gambia in 2019, on a small wooden boat that had just brought us upstream from Banjul to Juffureh. The light was the thing — a high, hard equatorial sun, with the sort of contrast you can't easily fake.
> >
> > **Edition** Limited to 25 signed and numbered prints.
> > **Paper** Hahnemühle Photo Rag Baryta, 315gsm.
> > **Sizes** as above.
> > **Shipping** as above.
>
> Tell me when those two are done. Then we'll do the open-edition prints — same template, shorter prose."

- [ ] **Step 2: Walk through the open-edition pattern**

Tell the user:

> "For the open editions, use this shorter template:
>
> > [1–2 sentence note on the photograph: place, time, what made you take it.]
> >
> > **Edition** Open edition.
> > **Paper** Hahnemühle Photo Rag Baryta, 315gsm.
> > **Sizes / prices** as listed.
> > **Shipping** Rolled in a tube, shipped from the UK.
>
> You don't need to do all 22 in one sitting. Tackle the most-likely-to-sell ones first: anything in a featured collection, anything on the Prints page on the portfolio.
>
> Tell me which products you've updated so I can log them."

- [ ] **Step 3: Walk through the slug rewrite**

Tell the user:

> "Final cleanup: rename the products with working-filename slugs. For each product:
> 1. **Products → click the product → Search engine listing → Edit website SEO → URL handle**.
> 2. Change e.g. `senegambia-beach-girls_8bit_fuji-matte` → `girls-on-senegambia-beach`.
> 3. Save. **Shopify auto-creates a redirect from the old URL** so links don't break.
>
> Suggested rewrites:
> - `baygateway_8bit_fuji_matt` → `bay-gateway`
> - `senegambia-beach-girls_8bit_fuji-matte` → `girls-on-senegambia-beach`
> - (any others with similar working-filename style)"

- [ ] **Step 4: Update changelog and commit**

```markdown
### Product descriptions and slugs
- Limited editions rewritten: Esso After Dark, Landing At Juffureh.
- Open editions rewritten: <list as user reports>.
- Slugs cleaned up for: <list>. Auto-redirects in place.
```

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): rewrite descriptions, clean up slugs"
```

---

## Task 7: Email capture

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Check Shopify Forms availability**

Tell the user:

> "Quick check — in the Shopify admin, go to **Apps → Shopify Forms**. Tell me if it's installable on your plan, or if it asks for an upgrade."

- [ ] **Step 2: Branch on availability**

If **Shopify Forms is available**:

> "Install Shopify Forms (free). Create a form:
> 1. Apps → Shopify Forms → **Create form** → **Footer signup**.
> 2. Title: `Studio notes`.
> 3. Subtitle: `New work, new prints, occasional dispatches. No spam.`
> 4. Fields: Email only.
> 5. Save and publish to footer.
>
> The form will appear in the storefront footer automatically."

If **Shopify Forms is NOT available** on Starter:

> "Pick a third-party email provider — recommend one of:
> - **Buttondown** (newsletter-focused, $9/mo, lovely UX, embeds clean)
> - **Mailchimp** (free tier 500 contacts, embeds work but UI is heavier)
> - **ConvertKit / Kit** (free tier 1000 contacts, creator-focused)
>
> Pick one, sign up, get an embed code. We'll add it to the Shopify footer via a custom HTML block (most themes support this) and also add it to the Eleventy About and Journal pages.
>
> Tell me your choice."

(If the user picks a third-party, agent walks them through embedding the form's HTML in the Shopify theme's custom HTML block, then in a future task adds the same embed to the portfolio's About and Journal pages. The portfolio-side embed is small enough to add as a coda task here:)

- [ ] **Step 3: Add the email embed to the Eleventy site (if third-party)**

Only if the user picked a third-party provider:

Modify `src/about.md` and `src/journal/index.njk` to include the embed at the bottom. Concrete code is provider-specific — wait for the user's embed snippet, then surface the exact edits for sign-off.

- [ ] **Step 4: Verify the form is live**

Visit `https://shop.newplace2frown.com/` and check the footer for the form. Submit a test email; check it arrives in the provider's dashboard.

- [ ] **Step 5: Update changelog and commit**

```markdown
### Email capture
- Provider: <Shopify Forms / Buttondown / Mailchimp / ConvertKit>.
- Storefront footer form live: yes.
- Portfolio About / Journal embed: <added / N/A>.
- Test signup: confirmed receiving.
```

```bash
git add docs/superpowers/shopify-admin-changelog.md src/about.md src/journal/index.njk
git commit -m "docs(shopify): email capture wired up via <provider>"
```

---

## Task 8: Hoodie decision

**Files:**
- Modify: `docs/superpowers/shopify-admin-changelog.md`

- [ ] **Step 1: Surface the decision**

Tell the user:

> "The hoodie. Per spec, the choice is:
> - **Pull it** — single hoodie in a print store reads as unresolved.
> - **Commit to a small merch line** — keep the hoodie and add a tote, postcard set, or zine so the merch reads intentional.
>
> Which?"

- [ ] **Step 2: Execute**

If **pull**: instruct the user to **Products → // PRINT HOODIE → Status → Archive** (don't delete; archives keep order history).

If **commit**: brainstorm the small merch line with the user. Out-of-scope to actually create new merch products in this plan — log the decision and the planned next products, then surface as a follow-up task.

- [ ] **Step 3: Update changelog and commit**

```markdown
### Hoodie
- Decision: <pulled / committed to merch line>.
- (If committed) Planned additional merch: <list>.
```

```bash
git add docs/superpowers/shopify-admin-changelog.md
git commit -m "docs(shopify): hoodie decision recorded"
```

---

## Task 9: End-to-end credibility walkthrough

**Files:** none.

- [ ] **Step 1: Cold-visitor walkthrough**

Open `https://shop.newplace2frown.com/` in a fresh browser (incognito works). Pretend you've never seen this store. Check:

- Browser tab title is real (not "Welcome!").
- Footer social links all work and open in new tab to real platforms.
- Footer has "About the artist" and "Journal" linking to portfolio.
- Main menu has the series collections.
- Click a series collection — products are present, descriptions are written.
- Click a limited edition — description has prose, edition info, paper, sizes, shipping.
- Email signup form is in the footer (or wherever it landed) and accepts a test email.
- The hoodie is either pulled or sits with companion merch — not alone.

- [ ] **Step 2: Cross-domain walkthrough**

From `newplace2frown.com` (the portfolio):
- Click "Prints" in sidebar → Prints page loads with Buy Buttons (Plan 03).
- Click a Buy Button → Shopify checkout opens at `shop.newplace2frown.com/...` (correct domain).
- From a project page, the "Prints from this series" block also opens checkout at the correct domain.

From `shop.newplace2frown.com`:
- Click "About the artist" in footer → portfolio About page loads.
- Click "Journal" in footer → portfolio Journal loads.

- [ ] **Step 3: DNS final verification**

```bash
dig +short shop.newplace2frown.com
curl -sI https://shop.newplace2frown.com/ | head -3
```

Expected: CNAME resolves; 200 OK with valid TLS.

- [ ] **Step 4: Update changelog with final state**

```markdown
### Final walkthrough
- Cold-visitor checks: <pass/fail per item>.
- Cross-domain links: working in both directions.
- DNS + TLS verified.
```

- [ ] **Step 5: Surface the relaunch checkpoint**

Tell the user:

> "Plan 04 is implementation-complete. The Shopify-side credibility baseline is in place:
> - Custom domain `shop.newplace2frown.com` live.
> - Page title, social links, portfolio cross-links, collections, descriptions, email capture, hoodie decision — all done.
>
> The full relaunch (Plans 01–04) is now live. Recommended next steps **outside this plan series**:
> - Watch traffic for a week — does anything bounce that wasn't bouncing before?
> - Promote the Journal: a post on the Subsurface Territories audience pointing at the new site is the highest-leverage launch move.
> - Pricing tier review (the £20 → £100 gap from the spec) — worth doing as a separate, smaller exercise.
> - Klaviyo / email automation flows (welcome sequence, abandoned cart) — not in scope here, worth a separate plan when the email list has 50+ subscribers."

---

## Self-review notes

- **Spec coverage:** Covers spec §7 must-fix list (custom domain, page title, social links, portfolio cross-link) and should-fix list (collections by series, product descriptions, email signup, hoodie decision). Slug rewrite is in Task 6. Out-of-scope items from spec §7 (Klaviyo, pricing tier, FAQ page) are flagged as next steps in Task 9 step 5.
- **Placeholder scan:** None. The `<fill in>` tokens in changelog templates are explicit instructions to the user/agent to capture the real value at the time of the action — that's the point of a changelog template.
- **Type / consistency:** All Shopify URLs use `https://shop.newplace2frown.com/...`; all portfolio URLs use `https://newplace2frown.com/...`. Consistent across tasks.
- **No code dependency on Plans 01–03:** confirmed. The portfolio's existing references to `https://shop.newplace2frown.com` from `src/_data/site.js` (Plan 01) start working once Task 1 of this plan completes — until then they 404, which is acceptable since Plans 01–02 don't surface that URL prominently outside the (yet-to-be-built) Prints page.
