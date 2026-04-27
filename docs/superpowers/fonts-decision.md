# Font decision (Plan 01)

**Decision:** Use Google Fonts pairing (EB Garamond + Inter) for the reference build.

**Rationale:** GT Sectra and Söhne are commercial; licensing isn't resolved at the time of Plan 01. The fallbacks are explicitly named in the spec. The Google Fonts pairing is good enough to lock in the visual direction; if the look is right with these fonts, it'll be at least as right with the commercial ones.

**Reversal path:** When/if GT Sectra and Söhne are licensed, replace the `<link>` in `head-meta.njk` and the `font-family` declarations in `site.css`. No structural changes needed.
