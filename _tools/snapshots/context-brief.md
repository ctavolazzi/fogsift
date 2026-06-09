# FogSift Context Brief
Generated: 2026-03-01T17:26:32.421Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | main |
| Last release | v0.2.0 |
| Commits since release | 26 |
| Uncommitted files | 26 |
| Unpushed commits | 7 |
| Built pages | 81 |
| Wiki pages | 47 |
| Source: 23 CSS, 28 JS | dist: 208.1KB CSS, 95.3KB JS |

## Test Results
112 pass / 1 fail / 10 warn (91.1%)
Lighthouse: Perf ? | A11y ? | BP ? | SEO ?

## Uncommitted Changes
Modified: empirica/sessions/sessions.db, _work_efforts/devlog.md, dist/api/articles.json, dist/api/meta.json, dist/api/wiki/index.json, dist/api/wiki/sitemap.json, dist/app.js, dist/portfolio.html, dist/queue/PST-102.html, dist/queue/PST-103.html, dist/search-index.json, dist/styles.css, scripts/build.js, src/css/components.css, src/js/main.js, src/portfolio.html, tests/report.json, tests/report.txt
Untracked: _AI_Journal/013-projects-modal-detail-flow.md, _pantheon/the_dealer/, _pyrite/journal/, _worktree_pr22_fix/, dist/project.html, src/js/projects-data.js, src/js/projects-flow.js, src/project.html

## Recent Commits
- e9533e8 Merge branch 'claude/workflow-visualization-engine-2qxSs' into main
- 59ccd52 chore: update session snapshots, API metadata, and test reports
- a3cf543 feat: add workflow visualization engine page
- 66516e5 chore: update test reports
- eea05af refactor: improve Projects page based on self-critique

## Development Infrastructure
| Port | Tool | Status |
|------|------|--------|
| 5001 | AI Journal (14 entries) | Active |
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
- `scripts/build.js` — Build system (59KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance