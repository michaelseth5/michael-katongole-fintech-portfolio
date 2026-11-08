# Financial Trade Globe — Implementation Notes

The globe runs in the existing plain HTML/CSS/JavaScript portfolio. No React, Next.js, TypeScript, bundler, or runtime package install is required.

## Components
- `index.html`: original homepage; exactly one `#financial-globe` mount and references to the two assets below.
- `globe.js`: Globe.gl WebGL initialization, country selection, camera, routes, filters, GDP panel, responsive controls.
- `globe.css`: scope-limited dark-purple styling and fullscreen/mobile layout.
- `assets/countries.geojson`: bundled Natural Earth 110m country dataset (177 features), sourced from the three-globe example. This is **not** an exhaustive list of all political territories.
- `netlify/functions/markets.js`: keeps the existing quote endpoint and adds `dataset=trade` and `dataset=gdp`.
- `netlify.toml`: existing rewrite from `/api/markets` to the Netlify function.

## Data sources and interpretation
- **UN Comtrade public preview**: annual merchandise trade records from a selected reporting country, by bilateral partner. `flow=X` is a reported export from reporter to partner; `flow=M` is a reported import from partner to reporter. These are *trade values*, not live money transfers or capital flows. Preview responses are limited to 500 rows and may omit some country pairs. Summing the returned rows is **not** an official national or global total. Do not mix mirrored reporter records as if they were independent transactions.
- **World Bank World Development Indicators**: GDP (current USD), series `NY.GDP.MKTP.CD`; the panel prints the actual observation year separately from the selected trade year. Missing indicators display "Not Available".
- FDI, portfolio investment, remittances and generalized capital flows are not represented as trade values; those dropdown options are disabled until separate trustworthy datasets exist.
- Public source URLs are fetched by the serverless function rather than embedding API keys in browser code. There are no required private keys.

## Browser and deployment testing
GitHub Actions (`.github/workflows/globe-smoke.yml`) performs:
1. Chromium test of the real static HTML page and CDN globe with a **test-only** trade/GDP fixture.
2. Country choice, filters, reset, and mobile canvas checks.
3. Live UN Comtrade and World Bank public API response tests.
4. Live calls to the project's actual Netlify function handler for trade normalization and GDP.
5. Screenshot artifact from the Chromium test.

The browser test fixtures are never shipped as production data. GitHub Actions running this suite does not prove the Netlify deployment itself is live; after merging, verify `/api/markets?dataset=trade&reporter=36&year=2023` and the homepage on the published domain.

## Known limitations
- The initial view shows a selected reporter's bilateral observations (US by default), not exhaustive global corridors.
- Some partners are absent from the 110m geographic layer; those arcs cannot be mapped accurately and are excluded from the visual.
- Public preview API rate limits, availability, and source coverage are outside the site's control.
- Country center points are approximate geometry-derived coordinates, not financial centers.
- The globe requires WebGL and the Globe.gl CDN; when unavailable, the original homepage is still accessible and the globe displays a clear failure state.
