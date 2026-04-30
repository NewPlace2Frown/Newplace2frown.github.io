# Journal templates

Three skeletons for new journal entries. Pick one based on length and intent:

- **`note.md`** — single thought, ~50–200 words. No images required. Title optional.
- **`dispatch.md`** — place-and-time-rooted, 300–700 words. One image typical.
- **`article.md`** — long-form, 800–3000 words. `ogType: article` for richer social previews.

## How to use one

1. Copy a template into `src/journal-drafts/` (this dir is invisible in production):
   ```
   cp docs/journal-templates/dispatch.md src/journal-drafts/2026-05-04-some-place.md
   ```
2. Fill in title, date, content. The filename becomes the slug.
3. Preview locally: `npm run dev:drafts`
4. When ready to publish, move it: `git mv src/journal-drafts/<file>.md src/journal/<file>.md`
5. Commit + push. The RSS feed and journal index update on next deploy.

## Frontmatter reference

| Field | Required | Notes |
|---|---|---|
| `title` | Yes for dispatch/article, optional for note | |
| `date` | Yes | YYYY-MM-DD; controls journal-index ordering and RSS pubDate |
| `description` | Recommended | Used in OG/Twitter cards and RSS feed |
| `ogImage` | Optional | Page-level social preview image; defaults to "Landing at Juffureh" |
| `ogImageAlt` | Optional | Alt text for the social preview |
| `ogType` | Optional | `website` (default) or `article` |
| `location` | Optional (dispatch) | Surfaces nowhere automatically; for your own reference |
