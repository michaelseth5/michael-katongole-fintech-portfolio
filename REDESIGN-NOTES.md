# Portfolio source map and redesign notes

Baseline: `8e83bbb` (November 17, 2026). Plain HTML/CSS/JS retained. No framework migration.

## Page map

| Route | Source section | Contents |
|---|---|---|
| Home | `#home`, `#portfolio-intro-grid` | Portrait, headline lanes, short welcome, trade globe, feedback notice, background, Mindset, Craft, education, career map, three featured previews |
| Projects | `#project-details` | Presentation launchers; Synapse, DemandSync, Financial Disclosure Data Pipeline, Oil Geo Signal Engine, ColorStack FinTech Workshop, LA Connect; BCOM assignment |
| Experience | `#experience`, `#achievements` | Professional experience; Milestones & Leadership tabs; ColorStack, Top Achievers, affiliations |
| Skills | `#skills` | Interactive desktop sphere / mobile icon grid; six readable skill categories; Figma retained |
| Networking | `#networking` | Original event albums, event tabs, captions and lightbox |
| Literature | `#listening-reading`, `#reading` | Original podcasts and books |
| Hobbies | `#hobbies` | Mentorship, travel, art, sports / games, food, R&B Concerts; unfinished sections retained |
| Contact | `#contact` | Contact links, prewritten FAQ, rotating quotes, footer |
| Standalone slides | `presentations/demandsync.html`, `presentations/synapse-solutions.html` | All original slides retained; noindex and shared muted palette added |

## All section elements

| ID | Class | Accessible label |
|---|---|---|
| `home` | `container hero mk-unified-hero` |  |
| `portfolio-intro-grid` | `mk-editorial-intro mk-bento-about` | More about Michael Katongole |
| `projects` | `fp` |  |
| `experience` | `section` | Experience |
| `(unnamed nested section)` | `container` |  |
| `project-details` | `section fp-vars` | Case studies |
| `(unnamed nested section)` | `container` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `(unnamed nested section)` | `project-framework-item` |  |
| `business-communication-assignment` | `bcom-project` |  |
| `networking` | `section seo-networking-section` | Networking events and professional conferences |
| `hobbies` | `section` | Personal hobbies and interests |
| `(unnamed nested section)` | `container` |  |
| `listening-reading` | `section tv-gallery-page` | Literature, podcasts and books |
| `achievements` | `section` | Achievements |
| `(unnamed nested section)` | `container` |  |
| `skills` | `section` |  |
| `contact` | `section` | About & contact |
| `(unnamed nested section)` | `container` |  |
| `mk-portfolio-chat` | `mk-chat-panel` | Ask Michael portfolio FAQ |
| `(unnamed nested section)` | `mk-footer-quotes` | Quotes that inspire me |

## JavaScript files

| File | Scope |
|---|---|
| `connect-chatbot.js` | Prewritten portfolio FAQ, input and suggested questions |
| `desktop-theatre.js` | See source |
| `experience-tabs.js` | Shared professional / leadership tabs, moved from desktop-only router |
| `globe.js` | Lazy Globe.gl, annual trade and GDP requests, zoom, drag, visibility pause, WebGL fallback |
| `home-scroll-cue.js` | Home landmarks, scroll cue, progress and up/down controls |
| `hover-personalities.js` | Legacy hover enhancement |
| `michael-tv.js` | Desktop Cinema / Instant selector, explicit playback, YouTube sequence, full voiceover, outro, skip and replay |
| `mindset-photo-rotation.js` | Mindset photo rotation with visibility checks |
| `mobile-audit.js` | Accessible mobile icon grid |
| `mobile-classic.js` | Classic mobile navigation and graphic-only Michael TV selector |
| `mobile-router.js` | Mobile page ownership, menu routes, history and scroll reset |
| `polish.js` | Legacy progressive reveals and title enhancement |
| `premium.js` | Hero tabs, accessible page focus, TV reentry and safe section layering |
| `scroll-flow.js` | Route-scoped progressive reveals and scroll arrivals |
| `shared-gallery.js` | Retained legacy gallery enhancement; not loaded by current HTML |
| `site-footer.js` | Footer injection on every non-Home route |
| `sports-emoji.js` | Sports card tap state and reveal |
| `tv-bezel.js` | Working TV frame, channel controls, volume, power and optional CRT effects |
| `tv-channels.js` | Desktop route ownership, channel transitions, keyboard navigation and deep links |
| `tv-remote-cursor.min.js` | Optional remote cursor (off by default for new visitors) |
| `unified-gallery.js` | Current album rendering, thumbnails, gallery tabs and lightbox |

## Inline scripts in execution order

| Index | ID / first source line |
|---|---|
| 0 | `mk-scroll-restoration` |
| 1 | `/* Run after viewport meta so phones report actual CSS width; before all styles and desktop scripts. */ (()=>{if(matchMedia('(max-width` |
| 2 | `sony-startup-controller` |
| 3 | `fp-scroll-reveal` |
| 4 | `(()=>{ const section=document.querySelector('.mk-footer-quotes'); if(!section)return; const quotes=[...section.querySelectorAll('.mk` |
| 5 | `mk-skills-sphere-v2` |
| 6 | `(()=>{const root=document.querySelector('.mk-editorial-intro');if(!root)return;const reduce=matchMedia('(prefers-reduced-motion: reduce` |
| 7 | `document.addEventListener('DOMContentLoaded', function(){ const track = document.querySelector('#hobbies .hobby-carousel-track'); c` |
| 8 | `(()=>{ const root=document.querySelector('#networking'); const track=root?.querySelector('.network-carousel-track'); const slides=Array` |
| 9 | `(()=>{ const init=()=>document.querySelectorAll('.photo-carousel-shell').forEach(shell=>{ const rail=shell.querySelector('.photo-` |
| 10 | `window.addEventListener('load',()=>{ const track=document.querySelector('#hobbies .hobby-carousel-track'); if(!track)return; const s` |
| 11 | `(()=>{'use strict'; // This site does not embed secrets. Frankfurter reference rates require no API key. const fx=document.querySelecto` |
| 12 | `(()=>{ const el=document.querySelector('#achievements .dev-carousel-disabled'); if(!el)return; const track=el.querySelector('.dev-track` |
| 13 | `/* Show only landscape photographs from the existing portfolio galleries. */ (()=>{ const card=document.querySelector('#portfolio-intr` |
| 14 | `/* A separate candid-photo slideshow; the existing landscape memories carousel is unchanged. */ (()=>{ const card=document.querySelect` |
| 15 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"https://unpkg.com/leaflet@1.9.4/dist/le` |
| 16 | `/* Aerial NYC overview is a local image, so no tile API or map library is needed. */` |
| 17 | `/* Editorial scroll arrivals: reveal only after a section becomes visible. */ (()=>{ const selector='#experience .page-hero,#project-d` |
| 19 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"tv-channels.js?v=3\" defer>"+"</scr"+"i` |
| 20 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"tv-bezel.js?v=5\" defer>"+"</scr"+"ipt>` |
| 21 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"tv-remote-cursor.min.js?v=1\" defer>"+"` |
| 22 | `document.write("<script src=\"home-scroll-cue.js?v=5\" defer>"+"</scr"+"ipt>");` |
| 23 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"michael-tv.js?v=13\" defer>"+"</scr"+"i` |
| 24 | `if(matchMedia('(min-width: 768px)').matches)document.write("<script src=\"globe.js?v=14\" defer>"+"</scr"+"ipt>");` |
| 25 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"polish.js\" defer>"+"</scr"+"ipt>");` |
| 26 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"hover-personalities.js\" defer>"+"</scr` |
| 27 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"mindset-photo-rotation.js\" defer>"+"</` |
| 29 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"sports-emoji.js?v=1\" defer>"+"</scr"+"` |
| 31 | `mk-gallery-deferred-loading` |
| 32 | `mk-email-click-to-compose` |
| 33 | `if(!document.documentElement.classList.contains("mobile-classic"))document.write("<script src=\"desktop-theatre.js?v=3\" defer>"+"</scr` |
| 35 | `mk-home-welcome-audio-script` |
| 36 | `synapse-inline-walkthrough-init` |
| 37 | `fp-case-lightbox-init` |
| 38 | `mk-reading-cover-recovery-v1` |
| 39 | `mk-hobbies-carousel-sync-v2` |
| 40 | `mk-hobbies-accessible-lightbox` |

The inline blocks include startup / scroll restoration; featured-card reveal; quote rotation; desktop skills orbit; bento reveals; Hobbies and Networking carousel engines; market/FX updates; affiliation carousel fallback; photo rotators; conditional script loading; deferred gallery images; email composition; short welcome audio; project walkthroughs and screenshot viewer; book-cover recovery; Hobbies lightbox. All remain attached to the original content.

## Stylesheets

`centered-ui-mindset.css`, `colorstack-fintech-project.css`, `connect-chatbot.css`, `desktop-theatre.css`, `editorial-titles.css`, `globe-teaser.css`, `globe.css`, `hero-legibility.css`, `hobbies-caption.css`, `home-globe-polish.css`, `home-scroll-cue.css`, `homepage-fixes.css`, `hover-personalities.css`, `la-connect-project.css`, `listening-reading.css`, `michael-tv.css`, `mobile-audit.css`, `mobile-classic.css`, `mobile-router.css`, `networking-presentation.css`, `polish.css`, `premium-decks.css`, `premium.css`, `scroll-flow.css`, `shared-gallery.css`, `site-footer.css`, `sports-emoji.css`, `tv-bezel.css`, `tv-channels.css`, `tv-remote-cursor.css`, `unified-gallery.css`, `ux.css`

`styles/manifest.json` records all 110 former inline style blocks and existing stylesheets in their exact original order. Readable inline sources are in `styles/inline-*.css`; `scripts/build-styles.py` creates the committed `portfolio.css` bundle. Run that command after editing a CSS source. The two fonts are subsetted, self-hosted WOFF2 files with their OFL licenses. `premium.css` is an explicit cascade layer: its important design rules take precedence over historical important overrides, without deleting them. Cinema effects and the TV functionality remain available.

## Server scripts and test scripts

- `api/markets.js`: best-effort Yahoo/Coinbase quotes and Treasury data.
- `api/financial.js`: Vercel adapter for the shared annual trade/GDP handler.
- `netlify/functions/markets.js`: shared UN Comtrade and World Bank normalization, caches, timeouts and honest unavailable states.
- `tests/portfolio-audit.cjs`: markup, privacy metadata, source assets and preserved content checks. Two obsolete baseline expectations updated to the current authored education copy.
- `tests/globe-smoke.cjs`: retained historic test; several assertions target a pre-November-17 mobile canvas and older Skills layout. Not used to validate this redesign.
- `tests/live-data-smoke.cjs`: retained upstream read-only financial-source test.
- `tests/performance-server.cjs`: gzip-enabled static test server reflecting deployment text compression; API responses are empty, labeled test fixtures.
- `tests/premium-quality.cjs`: seven viewport widths, route ownership, hero fit, intro gating, globe startup, tabs, footers, chat, runtime exceptions and reduced motion.
- `.github/workflows/premium-quality.yml`: isolated browser tests plus first-visit mobile Lighthouse report. Financial figures in browser tests are clearly marked fixtures and never enter production data.

## Globe history

| Commit | Evidence |
|---|---|
| `ff97b3c` (Nov 15) | Explicit performance patch: 14 route cores + 8 pulses; wheel input coalesced into one frame; stroke meshes rebuilt only at coarse zoom bands; DPR capped at 1.5; ResizeObserver cleanup. This is the selected performance baseline. |
| `2565265` | Increased rendered routes to 25, with up to 50 arc objects. |
| `c0c398c` | Modifier-wheel / pinch zoom retained; ordinary wheel scroll stays native. |
| Current redesign | Restores the 14 + 8 mesh budget; retains bright green exports and red imports, zoom controls, directional tooltips, real API data, offscreen/channel pause and native scrolling. Adds deferred initialization and a static fallback for disabled WebGL. |

Git history proves the implementation difference; it does not contain comparable historical frame-time benchmarks. No unmeasured claim that a commit was the fastest is made.

## Welcome recording

`welcome (1).m4a` is 12.735 seconds. Its original transcript is recoverable from `6283450`. Home now uses that matching recording/transcript. The longer Cinema voiceover and its matching captions remain intact. Neither mode autoplays before the visitor requests playback.

## Content preservation

A text-node comparison against the baseline showed removals only from the authorized hero copy, the restored short-audio transcript, and requested Hobbies / leadership heading changes. Bio, employer, project-detail, gallery-caption and affiliation text remain in source.

## Manual acceptance checklist

- Fresh tab: select Cinema, verify PRESS PLAY, full video/voiceover/outro sequence, small Skip Intro and Escape.
- Fresh tab: select Instant and confirm Home opens at the top without audio.
- Home: play / pause / replay the 13-second recording; open and close its transcript.
- Desktop WebGL: rotate, zoom, reset, select a country, inspect green/red routes, and leave Home to verify rendering pauses.
- Open each nav route; switch Professional / Milestones; check the three project previews, Star links, walkthroughs, screenshots, gallery categories and R&B Under Construction.
- On mobile: menu navigation, no trade globe / Sony bezel / retro toggle / intro-video requests; readable text and 44px controls.
- Contact: enter several questions, scroll the conversation, verify input stays at the bottom, quotes and footer share the light canvas.
- Keyboard: visible focus, hero tab arrows, Experience tab arrows, gallery and modal Escape behavior.
- CI outputs: inspect seven viewport screenshots and measured Lighthouse results.

## Additional performance work

Project screenshots now use local WebP copies of the same source images. `assets/project-previews/sources.json` records their original URLs and encoded file sizes. The first mobile selector gates the mounted page to prevent an initial Home flash and unnecessary early image rendering. Gallery setup waits for its authored tabs to exist, so only the active album remains exposed to keyboard and screen-reader navigation.
