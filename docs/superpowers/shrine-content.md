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
