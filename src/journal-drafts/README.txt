# Drafts

Files in this folder are NOT built or deployed. Eleventy ignores this directory
in production builds.

To preview a draft locally:
- `npm run dev:drafts` — runs Eleventy with the `src/journal-drafts/` directory
  included via the `BUILD_DRAFTS=1` env var.

When a draft is ready to publish:
- Move it: `git mv src/journal-drafts/<file>.md src/journal/<file>.md`
- Set the `date` frontmatter to today's date.
- Commit and push.
