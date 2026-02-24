# FogSift Context Brief
Generated: 2026-02-24T06:04:42.997Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | main |
| Last release | v0.2.0 |
| Commits since release | 8 |
| Uncommitted files | 40 |
| Unpushed commits | 0 |
| Built pages | 77 |
| Wiki pages | 45 |
| Source: 21 CSS, 23 JS | dist: 190.3KB CSS, 65.7KB JS |

## Test Results
110 pass / 1 fail / 12 warn (89.4%)
Lighthouse: Perf 49 | A11y 88 | BP 81 | SEO 100

## Uncommitted Changes
Modified: DS_Store, _tools/snapshots/context-brief.md, _tools/snapshots/latest.json, dist/api/articles.json, dist/api/meta.json, dist/api/wiki/index.json, dist/api/wiki/sitemap.json, dist/app.js, dist/favicon.png, dist/index.html, dist/og-image.png, dist/search-index.json, dist/styles.css, eslint.config.js, src/assets/.DS_Store, src/assets/Move-The-Needle-Computer-Pixel-Art-Square-1024x1024px.png, src/assets/johnny_autoseed_site_screenshot.png, src/css/components.css, src/favicon.png, src/ferrofluid-demo.html, src/gallery.html, src/index.html, src/js/_archived/achievement.js, src/js/_archived/queue-widget.js, src/js/cache.js, src/js/cookie-consent.js, src/js/debug.js, src/js/main.js, src/js/queue-ui.js, src/js/svg-components.js, src/js/theme-init.js, src/js/theme.js, src/js/white-rabbit.js, src/lava-demo.html, src/og-image.png, tests/lighthouse-report.json, tests/report.json, tests/report.txt
Untracked: dist/svg-components-demo.html, src/svg-components-demo.html

## Recent Commits
- 1ce91c1 fix: center rotating highlight using flex wrap on hero-prompt
- 4c80b79 fix: center rotating hero prompt on wrap + SVG icons in flip panels
- ef88621 feat: hero flip panels — 2×2 grid cycling phrases in + rotation order
- 6421f0e fix: extract WikiNav inline script → external wiki-nav.js (CSP compliance)
- 8d0604b fix: iso-square layout bounds, caret gradient, food security cycle

## Development Infrastructure
| Port | Tool | Status |
|------|------|--------|
| 5001 | AI Journal (13 entries) | Active |
| 5030 | Component Library | Available |
| 5050 | Dev Server | Default |
| 5065 | Test Suite Viewer | Available |

## First Steps for a New Session
1. Read this brief: `node _tools/scripts/context-brief.js`
2. Health check: `node _tools/scripts/health-check.js`
3. Build: `node scripts/build.js`
4. Dev server: `npx browser-sync start --server dist --port 5050 --no-open`
5. Run tests: `npm test`
6. Full snapshot: `node _tools/scripts/project-snapshot.js`

## Key Files to Read First
- `V0.1.0-RELEASE-PLAN.md` — Current release plan
- `TECH_DEBT.md` — Known issues and priorities
- `_AI_Journal/` — AI development notes and reflections
- `tests/report.json` — Latest test results
- `scripts/build.js` — Build system (57KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance