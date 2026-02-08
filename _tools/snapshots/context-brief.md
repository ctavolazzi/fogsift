# FogSift Context Brief
Generated: 2026-02-08T10:34:08.385Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.1.0 |
| Branch | main |
| Last release | v0.1.0 |
| Commits since release | 2 |
| Uncommitted files | 66 |
| Unpushed commits | 0 |
| Built pages | 71 |
| Wiki pages | 43 |
| Source: 19 CSS, 18 JS | dist: 175.3KB CSS, 62.3KB JS |

## Test Results
104 pass / 0 fail / 13 warn (88.9%)
Lighthouse: Perf 62 | A11y 87 | BP 81 | SEO 100

## Uncommitted Changes
Modified: gitignore, dist/api/articles.json, dist/api/meta.json, dist/api/wiki/index.json, dist/api/wiki/sitemap.json, dist/assets/icon-512.png, dist/assets/logo-mono.png, dist/assets/logo-patch.png, dist/assets/logo.png, dist/images/portfolio/TMGotcha-Banner-Image.jpg, dist/images/portfolio/TMGotcha-Build-Cycle-Banner.jpg, dist/images/portfolio/TMGotcha-Cube-Concept-Art.jpg, dist/images/portfolio/TMGotcha-Cube-Pepper-Ghost-Concept-Art.jpeg, dist/images/portfolio/TMGotcha-Cube-Wall-Grid-Concept-Art.jpeg, dist/images/portfolio/TMGotcha-Hardware-Concept-Art.jpg, dist/images/portfolio/TMGotcha-Idle-Desktop-Demo-Concept.jpeg, dist/images/portfolio/TMGotcha-Limited-Editions.jpeg, dist/images/portfolio/TMGotcha-Main-Advert-Image.jpg, dist/images/portfolio/TMGotcha-Product-Grid-Cycle-Concept.jpeg, dist/images/portfolio/TMGotcha-Starter-Expansion-Cube-Minifigure-Concept.jpg, dist/images/portfolio/TMGotcha-Toy-Editions-Banner.jpg, dist/images/portfolio/TMGotya-Box-Concept.jpeg, dist/images/portfolio/WAFT_Profile_Default.png, dist/images/portfolio/fogsift-logo-transparent-rectangle.png, dist/index.html, dist/og-image.png, dist/search-index.json, package-lock.json, package.json, src/FS-Default-Image-Circle.png, src/FS-Default-Image-Circle_500x500px.png, src/assets/FogSift-Banner-Large.PNG, src/assets/FogSift-Fancy-Logo_500x500px.png, src/assets/Move-The-Needle-Computer-Pixel-Art-Square-1024x1024px.png, src/assets/badge-orange-line.png, src/assets/badge-owner.png, src/assets/badge-profile.png, src/assets/icon-512.png, src/assets/logo-01.png, src/assets/logo-color-transparent.png, src/assets/logo-color.png, src/assets/logo-mono.png, src/assets/logo-patch.png, src/images/portfolio/TMGotcha-Banner-Image.jpg, src/images/portfolio/TMGotcha-Build-Cycle-Banner.jpg, src/images/portfolio/TMGotcha-Cube-Concept-Art.jpg, src/images/portfolio/TMGotcha-Cube-Pepper-Ghost-Concept-Art.jpeg, src/images/portfolio/TMGotcha-Cube-Wall-Grid-Concept-Art.jpeg, src/images/portfolio/TMGotcha-Hardware-Concept-Art.jpg, src/images/portfolio/TMGotcha-Idle-Desktop-Demo-Concept.jpeg, src/images/portfolio/TMGotcha-Limited-Editions.jpeg, src/images/portfolio/TMGotcha-Main-Advert-Image.jpg, src/images/portfolio/TMGotcha-Product-Grid-Cycle-Concept.jpeg, src/images/portfolio/TMGotcha-Starter-Expansion-Cube-Minifigure-Concept.jpg, src/images/portfolio/TMGotcha-Toy-Editions-Banner.jpg, src/images/portfolio/TMGotya-Box-Concept.jpeg, src/images/portfolio/WAFT_Profile_Default.png, src/images/portfolio/fogsift-logo-transparent-rectangle.png, src/og-image.png, tests/lighthouse-report.json, tests/report.json, tests/report.txt
Untracked: .claude/, CLAUDE.md, scripts/compress-images.js

## Recent Commits
- b464b7e Fix test suite: pa11y and Lighthouse now use Node.js APIs
- 1020ab1 Fix HTML validation and ESLint errors from v0.1.0 release
- 0a568f9 release: v0.1.0 — The Lighthouse
- f96cb34 Enhance dev startup with tests, snapshot diffing, and pyrite work efforts
- 94d58e2 Add dev startup script with full Lighthouse suite

## Development Infrastructure
| Port | Tool | Status |
|------|------|--------|
| 5001 | AI Journal (4 entries) | Active |
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
- `scripts/build.js` — Build system (55KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance