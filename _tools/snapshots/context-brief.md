# FogSift Context Brief
Generated: 2026-02-14T00:04:05.933Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.1.0 |
| Branch | main |
| Last release | v0.1.0 |
| Commits since release | 4 |
| Uncommitted files | 20 |
| Unpushed commits | 2 |
| Built pages | 83 |
| Wiki pages | 45 |
| Source: 19 CSS, 18 JS | dist: 175.3KB CSS, 62.3KB JS |

## Test Results
104 pass / 0 fail / 13 warn (88.9%)
Lighthouse: Perf 62 | A11y 87 | BP 81 | SEO 100

## Uncommitted Changes
Modified: tools/snapshots/context-brief.md, _tools/snapshots/latest.json
Untracked: _AI_Journal/012-the-friction-engine.md, _AI_Journal/012-waft-awakens.md, dist/queue/FSQ-001.html, dist/queue/FSQ-002.html, dist/queue/FSQ-003.html, dist/queue/FSQ-004.html, dist/queue/FSQ-005.html, dist/queue/FSQ-006.html, dist/queue/FSQ-007.html, dist/queue/FSQ-008.html, dist/queue/FSQ-009.html, dist/queue/FSQ-010.html, dist/wiki/content-creation-pipeline.html, dist/wiki/creative-pipeline.html, fogsift-ai-learning-lab/, fogsift-crash-course/, src/wiki/content-creation-pipeline.md, src/wiki/creative-pipeline.md

## Recent Commits
- 5b79352 feat: The Lighthouse Wakes — automated dev environment with self-reflecting journals
- c78613d Compress images (-18.7MB) and add automated session startup
- b464b7e Fix test suite: pa11y and Lighthouse now use Node.js APIs
- 1020ab1 Fix HTML validation and ESLint errors from v0.1.0 release
- 0a568f9 release: v0.1.0 — The Lighthouse

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
- `scripts/build.js` — Build system (55KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance