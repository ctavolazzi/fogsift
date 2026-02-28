# FogSift Context Brief
Generated: 2026-02-28T23:17:18.923Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | claude/setup-fastapi-memory-nqvQa |
| Last release | none |
| Commits since release | 0 |
| Uncommitted files | 4 |
| Unpushed commits | 0 |
| Built pages | 78 |
| Wiki pages | 46 |
| Source: 22 CSS, 24 JS | dist: 197.0KB CSS, 74.6KB JS |

## Test Results
110 pass / 1 fail / 12 warn (89.4%)
Lighthouse: Perf 49 | A11y 88 | BP 81 | SEO 100

## Uncommitted Changes
Modified: rc/css/terminal.css, src/js/terminal-demo.js, src/wiki/architecture/memory-system.md, src/wiki/index.json

## Recent Commits
- aaffcb6 feat: memory system v2 — hardening, tests, wiki architecture page + CRT terminal
- 10e4771 feat: replace memory system with canonical L1/L2 implementation
- 41e6698 chore: update auto-generated session snapshots
- 8e861ca feat: add FastAPI memory system (fogsift-api)
- f4eb995 feat: process steps timeline, accordion redesign, stat cards, connectors

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