## Project: Simple photographer/blogger site

This repository is a lightweight, static photoblog scaffold. It favors simple HTML/CSS/JS, a modular navigation fragment (`nav.html`), and a small Node script that generates a gallery index from `assets/media/` so you can add images by dropping them into folders.

## Quick start

1. Install dev tools (once):

```powershell
npm install
```

2. Generate media index (scan `assets/media/` and write `assets/media/index.json`):

```powershell
npm run generate:gallery
```

Note: the generator scripts are now exportable (can be imported in tests) and will only run when invoked directly. This makes them easier to unit-test.

3. Serve the site locally:

```powershell
# from the repo root
python -m http.server 8000
# then open http://localhost:8000
```

4. Run tests:

```powershell
npm test
```

## Layout and important files

- `index.html` — entry page; loads the modular `nav.html` into `#sidebar` and includes `assets/js/site.js` and `assets/css/site.css`.
- `nav.html` — modular navigation fragment (kept at repo root). Uses `<details>` for folders; folders should be given stable `id` attributes so persistence works (see below).
- `assets/css/site.css` — site styling (white background, black strokes, hard edges) and small responsive rules.
- `assets/js/site.js` — client loader: fetches and injects `nav.html`, wires mobile toggle and overlay, highlights active links, auto-opens ancestor folders for the active page, and stores a minimal persistent UI state.
- `assets/js/gallery.js` — simple client-side gallery that fetches `/assets/media/index.json` and cycles images. Use `data-gallery` on the container to select a named gallery.
- `scripts/generate-gallery.js` — Node script that walks `assets/media/` and writes `assets/media/index.json` mapping folder keys to arrays of image URLs.
- `assets/media/index.json` — generated file mapping gallery keys (root and subfolders) to image lists. Do not edit by hand.
- `tests/` — Jest tests (jsdom); small suite to sanity-check nav markup and behavior.

## Navigation and persistence rules

- The client loader stores two simple keys in `localStorage`:
	- `sidebar-open`: "true" or "false" when the user toggles the sidebar.
	- `sidebar-open-folders`: JSON array of `id` strings for `<details>` elements the user has explicitly opened.
- Implementation notes / best practices:
	- Give every folder `<details>` a stable `id` (for example `id="f-photography"`). Only folders with IDs are saved. This keeps persistence stable across edits.
	- The script only saves folder state on user `toggle` events. Programmatic opens (e.g., auto-opening the active page's ancestor folders) are not written to storage.
	- On load: the script restores saved folder IDs. If there are no saved IDs, it will auto-open only the ancestors of the active link so users can see where they are.

## Adding or editing navigation

- Edit `nav.html` to add or remove entries. Keep the structure:

```html
<details id="f-somefolder" class="nav-folder">
	<summary>Some Folder</summary>
	<ul>
		<li><a href="/path/page.html">Page</a></li>
	</ul>
</details>
```

- Always give folders an `id` if you want their open/closed state to persist across reloads.

## Galleries

- The gallery generator (`scripts/generate-gallery.js`) scans `assets/media/` recursively and writes `assets/media/index.json`. Example output structure:

```json
{
	"": ["/assets/media/img1.jpg","/assets/media/img2.jpg"],
	"project1": ["/assets/media/project1/imgA.jpg"]
}
```

- How to wire a gallery into a page: add an element with id `gallery` (or another id) and `data-gallery` attribute to select a key. Example in `photos/portfolio.html`:

```html
<div id="gallery" data-gallery=""></div>
<script src="/assets/js/gallery.js"></script>
```

- The client `gallery.js` will fetch `/assets/media/index.json`, pick the appropriate list for `data-gallery`, and cycle images. Regenerate `index.json` whenever you add/remove images.

## Tests and CI notes

- Tests use Jest with a jsdom environment. Run `npm test` locally after `npm install`.
- If you add tests that interact with the DOM, keep them fast and deterministic (avoid network calls or flaky timers). Run them in CI with `--runInBand` if resource constraints cause flakiness.
- Husky hooks are provided but require the repo to be a git repo and `npm install` to run to install hooks. On first clone:

```powershell
npm install
# then ensure .git exists and run
npx husky install
```

Recent changes in this repository (developer notes):

- The generator scripts (`scripts/generate-gallery.js`, `scripts/generate-index.js`) were refactored to export a `generate()` function and will only execute on direct invocation (`if (require.main === module)`). This improves testability.
- `assets/js/site.js` now exposes small helpers (`normalizePath`, `highlightActiveLink`, `openFolderWithActiveLink`) which are exported for unit tests while preserving the original browser bootstrap behavior. This lets tests exercise link-highlighting and folder-opening logic without running fetches or UI code.
- Two tests were added:
	- `tests/generate-gallery.test.js` — unit-level test for the gallery generator (mocks `fs`).
	- `tests/site.dom.test.js` — jsdom test for navigation highlight and folder open helpers (uses `nav.html`).

CI: A minimal GitHub Actions workflow is included at `.github/workflows/nodejs.yml` (runs `npm test` on push and pull requests). This provides basic test coverage in a clean environment.

## Deployment notes

- The site currently uses root-relative URLs (leading `/`) for assets and links. This is simplest when hosting at a domain root (recommended for a personal site with a custom domain).
- If you host under a subpath (e.g., GitHub Pages project site), adjust either:
	- the links to be relative to the site root at build time, or
	- set a `BASE_PATH` and update the generator and templates to prefix URLs with that base.

## Recommended best practices

- Give folder `<details>` stable ids for persistence (`f-...`).
- Keep `nav.html` at repo root if you rely on the client fetch fallback; alternatively consider inlining `nav.html` at build time to avoid runtime fetches.
- Run `npm run generate:gallery` after adding/removing images in `assets/media/`.
- Consider adding a small CI job:
	- run `npm test`
	- run `npm run generate:gallery` and verify `assets/media/index.json` is up to date
	- optionally build/validate HTML links
- If you need better image performance, add thumbnail generation (build step) and serve compressed images. Tools: sharp, imagemin, or a static asset pipeline.

## Troubleshooting

- Nav not appearing on nested pages:
	- Ensure `nav.html` is present in the repository root. The loader tries several candidate relative paths (to handle nested pages), and finally `/nav.html`.
- Persistence seems to misbehave:
	- Confirm folder `<details>` have `id` attributes. Only IDs are stored.
	- Clear localStorage keys `sidebar-open` and `sidebar-open-folders` in dev tools to reset state.
- Tests hang or are flaky in the dev environment:
	- Run a targeted test or use `--runInBand`. If jest hangs here, try running in CI or locally where node/npm and git are available.

## Next improvements (nice-to-have)

- Add thumbnail generation and a lightweight build pipeline.
- Add a tiny CI job that runs the generator and checks for stale `assets/media/index.json`.
- Add an optional build step to inline `nav.html` to avoid runtime fetch and eliminate flicker entirely.

## Contact / notes

If you want me to add automated CI, assign stable ids to any missing `<details>`, or make the nav inlined at build time, tell me which you'd like next and I will implement it.
