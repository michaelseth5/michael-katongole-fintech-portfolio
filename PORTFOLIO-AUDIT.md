# Portfolio UX audit — November 2026

This is an **incremental** audit of the existing HTML/CSS/JavaScript portfolio, not a framework migration or full visual redesign.

## Verified issues and corrections
- **High — public editorial leakage:** An Experience note referencing a supplied resume and omitted employer information was visible to visitors. The note was removed entirely.
- **High — inaccurate current-location framing:** The NYC/NJ tile described New York as the current location. It now says Dallas and distinguishes Boston as an upcoming move. The Manhattan graphic remains decorative; it should not be mistaken for a live location map.
- **Medium — indefinite market placeholders:** Replaced `Fetching latest available price…` and FX `Connecting…` initial labels. Unavailable quotes now display an explicit fallback, not an endless loading statement. Prices, when available, still come from the existing API.
- **Medium — visitor privacy/discoverability:** The site is intentionally **unlisted**, with robots metadata and `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` on Vercel and Netlify. It remains accessible to anyone holding the link. This is *not* authentication/password protection and cannot guarantee immediate disappearance from previously indexed search results.
- **Medium — keyboard navigation:** Added skip-to-main-content control, a focusable main landmark, and visible focus outlines.
- **Low — unnecessary image loading:** Deferred two education logos below the fold. The hero headshot retains eager loading.
- **Confirmed already healthy at source level:** no duplicate HTML IDs, balanced `<script>` tags, one main landmark after the change, Vercel/Netlify market routes preserved.

## Technical scope
Files changed: `index.html`, `ux.css`, `vercel.json`, `netlify.toml`, `tests/portfolio-audit.cjs`, `tests/live-data-smoke.cjs`, and `.github/workflows/globe-smoke.yml`.

Existing financial globe, gallery assets, project content, market ticker, navigation sections, and design colors were not rebuilt or migrated.

## Testing and caveats
- GitHub Actions validates markup invariants and runs Chromium globe/browser smoke tests.
- UN Comtrade is an upstream public source and may sometimes return an unavailable response. A `503` is acceptable only when accompanied by an explicit unavailable-data payload with **no fabricated financial flows**. Live success and fallback handling are recorded separately.
- Vercel preview should be verified for the `X-Robots-Tag` header prior to promoting to production.
- Full Lighthouse score benchmarking, exhaustive broken-link checks, accessibility audit, all-image verification, and detailed device-by-device visual QA are **not claimed** by this iteration. No before-and-after performance numbers are asserted without measurement.

## Next review opportunities
Review longer case-study prose together with actual project repositories to make descriptions more personal without manufacturing accomplishments, then evaluate gallery interaction and performance on a wider device matrix.
