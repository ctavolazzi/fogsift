# Changelog

All notable changes to FogSift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.2.0] - 2026-02-23
### Minor Release — "The White Rabbit"

Platform stability, performance, and debugging infrastructure. Introduces the White Rabbit
debugger, supply chain visualization, service worker caching, and a raft of bug fixes.

#### New Features
- **🐰 White Rabbit debugger** (`white-rabbit.js`) — Universal tracing utility loaded on every page
  - Instruments all `fetch()` and `XMLHttpRequest` calls silently
  - Detects browser surface: Chrome, Safari, Firefox, Facebook/Instagram/Threads/TikTok in-app browsers
  - Console API: `WhiteRabbit.activate()`, `.warren()`, `.sniff()`, `.probe(url)`, `.follow()`, `.hop()`
  - Activate via `?debug=rabbit` or `localStorage.setItem('white-rabbit', '1')`
  - Shorthand alias: `🐰.sniff()` in DevTools
- **Supply chain visualization** — Interactive Three.js r150 node graph on the homepage
  - 7 nodes (Source → Processing → Manufacturing → Distribution → Retail → Consumer → Data → loop)
  - Animated particle flow along edges, click/tap nodes for descriptions
  - Lazy-loaded via IntersectionObserver (Three.js ~614KB only loads when section is visible)
  - Mobile-first: adapts layout orientation based on viewport aspect ratio
  - Theme-reactive: reads CSS custom properties, updates on `data-theme` changes
  - `prefers-reduced-motion`: canvas hidden, text fallback shown
- **Service worker cache** (`sw.js`) — Offline support and performance
  - Cache-first for static assets (CSS, JS, images)
  - Network-first for HTML and API routes
  - Pre-caches core assets on install, evicts stale caches on activate
  - Offline fallback page (`offline.html`)
- **Offline page** — Clean branded fallback when network is unavailable

#### Bug Fixes
- **Step-card connector overflow** — Added `overflow-x: clip` to `.process-steps` to prevent
  dashed connector lines from protruding past the last card in a flex-wrapped row
- **`ScriptProcessorNode` deprecation** — Replaced with `AnalyserNode` + `setTimeout` polling
  in `your-data.html` audio fingerprint. Eliminates console deprecation warning
- **`AudioContext` cannot close closed** — Fixed by scoping `ctx.close()` to `finally` block
  only after oscillator has been stopped cleanly
- **Dead CoinDesk API** — Replaced `api.coindesk.com` (DNS failure) with CoinGecko free public
  API (`api.coingecko.com/api/v3/simple/price`) — no API key required

#### Infrastructure
- **Security headers activated** (`_headers`) — CSP now live with full `connect-src` whitelist
  covering all external APIs used by `your-data.html`
- **`sw.js` cache headers** — Service worker set to `no-cache` so updates deploy immediately
- **HTML cache headers** — All `.html` files set to `no-cache` for fresh navigation
- **Twitter/X card meta tags** added to homepage (`twitter:card`, `twitter:site`, `twitter:image`)
- **`og:site_name`** and **`og:locale`** added to homepage Open Graph block
- **White Rabbit injected on all pages** — Including all 46 wiki pages (path-prefix aware)
- **`three.min.js` + `supply-chain-sim.js`** added to `STATIC_ASSETS`
- **Build: `injectWhiteRabbit()`** helper injects WR script on every processed page

## [0.1.0] - 2026-02-08
### Minor Release - "The Lighthouse"

The first minor version bump. 101 commits since v0.0.5, marking the transition from "initial experiments" (0.0.x) to "functional product" (0.1.x).

#### New Features
- **Full-text search** with animated overlay, compiled search index (56 pages)
- **11 themes**: Default, Dark, Synthwave, Ocean, Aurora, Barbie, Camo, Rivendell, Pip-Boy, Matrix, Sky
- **Theme demo mode**: Cycles through all themes automatically
- **Portfolio page** with YouTube showcase and responsive grid
- **Queue system** with Ko-fi webhook integration and animated modal
- **Data awareness page** with homepage footprint widget
- **Cookie consent banner** (GDPR/CCPA compliant)
- **Secret Keeper's Log** easter egg: password-protected splash page (Meow Wolf-inspired)
- **Hidden footer link** to the Keeper's Log (find the "5001")
- **Konami code** easter egg with fortune cookies

#### Development Infrastructure
- **The Lighthouse** (`npm start`): Full dev suite startup script
  - Health check, build, test suite, snapshot diffing, work effort tracking
  - ASCII art banner with version/branch/commit info
  - Launches 4 servers: site (:5050), journal (:5001), components (:5030), test viewer (:5065)
- **The Keeper's Log** (:5001): AI development journal viewer
- **The Signal Workshop** (:5030): Component library
- **Captain FogLift's Quality Report** (:5065): Test suite viewer
- **Test suite**: 9 suites, 116 tests (HTML validation, a11y, Lighthouse, links, images, security)
- **Session state tracking**: Snapshot diffing between dev sessions
- **WAFT work effort system**: Daily tracking with templates and verification checklists

#### Wiki Expansion
- Expanded from 29 to 44 pages
- Redesigned wiki section into 3-card content grid with daily rotation
- Added wiki stats and quotes to homepage

#### Design & UX
- Mobile search panel: bouncy floating card animation (matches desktop)
- Landscape phone support: rotate iPhone to see desktop layout
- Redesigned Why This Works section
- Redesigned contact page with SVG icons
- Redesigned concerns section
- 3-column footer link grid
- Behind the Build section on portfolio page
- Site-wide polish: SEO, accessibility, design, security

#### Technical
- Image compression: 70MB to 15MB
- CSS modularization with design tokens
- HTTPS compatibility fixes
- localStorage caching for API calls
- HTML validation fixes (escaped wiki descriptions, aria-label usage)
- Honeypot bot protection on contact forms
- CSP-compliant theme initialization
- Build script: nav/footer injection, search index generation, template system
- Deploy script with pre-flight checks

#### Documentation
- Developer-facing README rewrite with Lighthouse showcase
- Ideas & Planning section with links to planning docs
- AI Journal with lore bible and session reflections
- WAFT work effort templates and standards

---

## [0.0.5] - 2025-12-28
### Patch Release - "Consolidation"

This release consolidates multiple feature branches and syncs all version sources.

#### New Features
- **Testimonials Section**: Social proof with 3 client quotes and stats row
- **Feature Void Audit**: Comprehensive analysis of 42 missing features (FEATURE_VOID_AUDIT.md)
- **ESLint Configuration**: Static analysis for code quality
- **Error Handling**: Improved try-catch for localStorage, fetch, clipboard operations

#### Technical
- Version sync: package.json, version.json, and git tags now aligned
- Merged 3 feature branches into main
- CSS modularization (navigation.css, sleep.css split from components.css)
- MCP status dashboard and monitoring system

#### Documentation
- Updated TECH_DEBT.md with fixed items
- Added API & data flow architecture documentation

---

## [0.0.4] - 2025-12-27
### Patch Release - "Minification & Cleanup"

#### Technical
- Build system minification improvements
- Configuration cleanup
- CSS refactoring (split components.css into modular files)
- Theme initialization consolidation via build injection

---

## [0.0.3] - 2025-12-27
### Patch Release - "Secret Sleep Mode"

#### New Features
- **Secret Sleep Mode**: Hidden easter egg screensaver (5 min page time + 30 sec idle)
  - Flying toasters animation (classic Mac homage) in 8-bit pixel art
  - Floating "Z" letters with glow effects
  - CRT scanline overlay
  - TV flash wake-up effect
  - Debug: `SleepMode._debugSleep()` in console

---

## [0.0.2] - 2025-12-27
### Patch Release - "Infrastructure & Polish"

#### New Features
- **Wiki System**: Markdown-based documentation at `/wiki/` with 31 pages
- **Quick Deploy Script**: `npm run quick-deploy` with pre-flight checks
- **Enhanced Toast System**: Error toasts with clipboard support

#### Improvements
- Conversion-focused redesign
- Mobile CSS improvements
- Deploy manifest with version tracking

---

## [0.0.1] - 2025-12-26
### Initial Release

- Single-page application with modular build system
- Light/Dark theme with user preference
- Interactive diagnostic checklist
- Field Notes modal system
- Responsive mobile navigation
- Toast notification system
- Version management system
- SEO optimizations
