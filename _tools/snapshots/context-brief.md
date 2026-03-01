# FogSift Context Brief
Generated: 2026-03-01T19:53:41.114Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | claude/integrate-credos-mcp-bh8yF |
| Last release | none |
| Commits since release | 0 |
| Uncommitted files | 0 |
| Unpushed commits | 0 |
| Built pages | 80 |
| Wiki pages | 47 |
| Source: 22 CSS, 26 JS | dist: 199.2KB CSS, 81.7KB JS |

## Test Results
110 pass / 1 fail / 11 warn (90.2%)
Lighthouse: Perf ? | A11y ? | BP ? | SEO ?

## Recent Commits
- e14d9ab Merge pull request #22 from ctavolazzi/claude/fogsift-engine-lkdbO
- c91ed56 feat: add FogSift Engine page and build integration
- d06e1d7 Merge pull request #21 from ctavolazzi/claude/setup-fastapi-memory-nqvQa
- 679dcaf fix: accessibility and keyboard interaction improvements
- 055e547 fix: resolve HTML validation errors in index.html

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