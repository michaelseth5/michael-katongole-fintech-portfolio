# Michael Katongole — FinTech Portfolio

Plain HTML/CSS/JavaScript portfolio deployed from GitHub to the existing Vercel project. No framework migration or runtime build step is needed.

## Source map

See [REDESIGN-NOTES.md](REDESIGN-NOTES.md) for every page, section, script, stylesheet source, globe history, recording provenance, and the acceptance checklist.

- `index.html`: original authored content and inline application controllers.
- `premium.css`, `premium.js`: shared visual system and accessible hero interactions.
- `styles/manifest.json`: exact stylesheet cascade order, including preserved legacy rules.
- `styles/inline-*.css`: the former inline styles, kept as readable sources.
- `portfolio.css`: committed stylesheet bundle. Run `python3 scripts/build-styles.py` after editing any CSS source; commit the rebuilt bundle.
- `assets/fonts`: self-hosted DM Sans / Space Grotesk subsets and their OFL licenses.
- `tv-channels.js`, `mobile-router.js`, `experience-tabs.js`: full-screen desktop channels and classic mobile pages.
- `michael-tv.js`, `mobile-classic.js`: desktop Cinema / Instant and graphic-only mobile entry.
- `globe.js`: lazy desktop Globe.gl, annual trade/GDP and disabled-WebGL fallback.
- `api/markets.js`, `api/financial.js`, `netlify/functions/markets.js`: existing data adapters.

## Verify locally

Serve the repository with a static server for layout work. Deployed financial APIs require the Vercel or Netlify function runtime.

```sh
python3 scripts/build-styles.py
node tests/portfolio-audit.cjs
```

The Premium Portfolio Quality workflow installs test-only Chromium dependencies, checks all eight routes at 375, 390, 430, 1280, 1440, 1536 and 1920px, captures screenshots, and measures mobile Lighthouse performance/accessibility. `tests/performance-server.cjs` serves compressed text, reflecting the deployment CDN. Financial values in browser integration tests are explicitly isolated fixtures.

## Deployment and indexing

Push reviewed source to `main` to trigger the existing Vercel integration. Keep `noindex, nofollow, noarchive, nosnippet` metadata and hosting headers. This preserves the existing unlisted-link behavior and does not add or change account authentication or audience settings.

Financial feeds can be delayed or unavailable. Existing source labels and honest fallback states remain; no simulated values are shown as real market or trade data.
