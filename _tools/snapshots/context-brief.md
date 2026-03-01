# FogSift Context Brief
Generated: 2026-03-01T15:43:54.501Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | claude/fogsift-engine-lkdbO |
| Last release | none |
| Commits since release | 0 |
| Uncommitted files | 2 |
| Unpushed commits | 0 |
| Built pages | 109 |
| Wiki pages | 74 |
| Source: 22 CSS, 28 JS | dist: 200.8KB CSS, 81.7KB JS |

## Test Results
142 pass / 0 fail / 9 warn (94.0%)
Lighthouse: Perf ? | A11y ? | BP ? | SEO ?

## Uncommitted Changes
Modified: ests/report.json, tests/report.txt

## Recent Commits
- d131636 feat: social sharing buttons on all wiki article pages
- ed5bff4 feat: add LinkedIn to site-wide footer social links
- 68202f4 feat: real contact form with server-side submission via Cloudflare Function
- 7bd0d3f refactor: auto-generate wiki nav from filesystem, drop manual index.json
- a35096e chore: update test reports after wiki expansion

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
- `scripts/build.js` — Build system (66KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance