# FogSift Context Brief
Generated: 2026-02-28T22:34:26.847Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | claude/setup-fastapi-memory-nqvQa |
| Last release | none |
| Commits since release | 0 |
| Uncommitted files | 0 |
| Unpushed commits | 0 |
| Built pages | 77 |
| Wiki pages | 45 |
| Source: 21 CSS, 23 JS | dist: 192.5KB CSS, 65.8KB JS |

## Test Results
110 pass / 1 fail / 12 warn (89.4%)
Lighthouse: Perf 49 | A11y 88 | BP 81 | SEO 100

## Recent Commits
- f4eb995 feat: process steps timeline, accordion redesign, stat cards, connectors
- 1ce91c1 fix: center rotating highlight using flex wrap on hero-prompt
- 4c80b79 fix: center rotating hero prompt on wrap + SVG icons in flip panels
- ef88621 feat: hero flip panels — 2×2 grid cycling phrases in + rotation order
- 6421f0e fix: extract WikiNav inline script → external wiki-nav.js (CSP compliance)

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