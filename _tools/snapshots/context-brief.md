# FogSift Context Brief
Generated: 2026-02-07T21:37:27.293Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.0.5 |
| Branch | main |
| Last release | v0.0.5 |
| Commits since release | 94 |
| Uncommitted files | 18 |
| Unpushed commits | 1 |
| Built pages | 70 |
| Wiki pages | 43 |
| Source: 19 CSS, 17 JS | dist: 172.7KB CSS, 60.2KB JS |

## Test Results
103 pass / 0 fail / 13 warn (88.8%)
Lighthouse: Perf 58 | A11y 87 | BP 81 | SEO 100

## Uncommitted Changes
Modified: ist/api/articles.json, dist/api/meta.json, dist/api/wiki/index.json, dist/api/wiki/sitemap.json, dist/app.js, dist/index.html, dist/search-index.json, dist/styles.css, src/css/components.css, src/index.html, src/js/main.js, tests/lighthouse-report.json, tests/report.json, tests/report.txt
Untracked: V0.1.0-RELEASE-PLAN.md, _AI_Journal/, _tools/, src/shouse.html

## Recent Commits
- 764a6f7 Redesign wiki section into 3-card content grid with real excerpts
- 0a7da9b Add homepage wiki section with daily rotation, stats, and quotes
- 1a4804c Expand wiki from 29 to 44 pages, fix link integrity test
- 524c421 Polish newsletter signup and switch footer links to 3-column grid
- ab199e4 Fix HTTPS compatibility and add localStorage caching for all API calls

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
- `scripts/build.js` — Build system (54KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance