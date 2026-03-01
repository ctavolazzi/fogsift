# FogSift Context Brief
Generated: 2026-03-01T13:19:14.933Z

## Quick Status
| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Branch | claude/fogsift-engine-lkdbO |
| Last release | none |
| Commits since release | 0 |
| Uncommitted files | 74 |
| Unpushed commits | 0 |
| Built pages | 97 |
| Wiki pages | 62 |
| Source: 22 CSS, 28 JS | dist: 199.9KB CSS, 81.7KB JS |

## Test Results
129 pass / 0 fail / 9 warn (93.5%)
Lighthouse: Perf ? | A11y ? | BP ? | SEO ?

## Uncommitted Changes
Modified: tools/snapshots/context-brief.md, _tools/snapshots/latest.json, dist/api/articles.json, dist/api/meta.json, dist/api/wiki/index.json, dist/api/wiki/sitemap.json, dist/index.html, dist/rss.xml, dist/wiki/architecture/memory-system.html, dist/wiki/architecture/terminal-component.html, dist/wiki/case-studies/communication-breakdown.html, dist/wiki/case-studies/manufacturing-throughput.html, dist/wiki/case-studies/the-data-migration.html, dist/wiki/case-studies/the-invisible-process.html, dist/wiki/case-studies/the-startup-pivot.html, dist/wiki/concepts/anchoring-bias.html, dist/wiki/concepts/cognitive-biases.html, dist/wiki/concepts/compounding.html, dist/wiki/concepts/confirmation-bias.html, dist/wiki/concepts/dunning-kruger.html, dist/wiki/concepts/first-principles.html, dist/wiki/concepts/goodharts-law.html, dist/wiki/concepts/loss-aversion.html, dist/wiki/concepts/mental-models.html, dist/wiki/concepts/opportunity-cost.html, dist/wiki/concepts/planning-fallacy.html, dist/wiki/concepts/regression-to-mean.html, dist/wiki/concepts/root-cause.html, dist/wiki/concepts/second-order-effects.html, dist/wiki/concepts/signal-vs-noise.html, dist/wiki/concepts/survivorship-bias.html, dist/wiki/concepts/systems-thinking.html, dist/wiki/content-creation-pipeline.html, dist/wiki/creative-pipeline.html, dist/wiki/diagnostic-process.html, dist/wiki/faq.html, dist/wiki/field-notes/001-map-territory.html, dist/wiki/field-notes/002-precision-accuracy.html, dist/wiki/field-notes/003-entropy.html, dist/wiki/field-notes/004-bottlenecks.html, dist/wiki/field-notes/005-tribal-knowledge.html, dist/wiki/field-notes/006-incentive-alignment.html, dist/wiki/field-notes/007-documentation-debt.html, dist/wiki/field-notes/008-sunk-cost-trap.html, dist/wiki/field-notes/009-scope-creep.html, dist/wiki/field-notes/010-communication-overhead.html, dist/wiki/field-notes/011-vanishing-context.html, dist/wiki/field-notes/012-analysis-paralysis.html, dist/wiki/field-notes/013-expertise-trap.html, dist/wiki/field-notes/014-reorg-trap.html, dist/wiki/field-notes/015-messenger-problem.html, dist/wiki/frameworks/constraint-mapping.html, dist/wiki/frameworks/decision-matrix.html, dist/wiki/frameworks/feedback-loops.html, dist/wiki/frameworks/force-field-analysis.html, dist/wiki/frameworks/pre-mortem.html, dist/wiki/frameworks/prioritization-matrix.html, dist/wiki/frameworks/risk-assessment.html, dist/wiki/frameworks/stakeholder-mapping.html, dist/wiki/frameworks/swot-analysis.html, dist/wiki/frameworks/trace-protocol.html, dist/wiki/getting-started.html, dist/wiki/how-we-work.html, dist/wiki/index.html, dist/wiki/tools/assumption-mapping.html, dist/wiki/tools/fishbone-diagram.html, dist/wiki/tools/five-whys.html, dist/wiki/tools/pareto-analysis.html, dist/wiki/tools/process-mapping.html, dist/wiki/tools/retrospective.html, dist/wiki/tools/time-boxing.html, src/wiki/index.json, tests/report.json, tests/report.txt

## Recent Commits
- 6ac70b0 feat: wiki concept — Anchoring Bias
- 82bca4d feat: wiki concept — Dunning-Kruger Effect
- f73889d feat: wiki field note 015 — The Messenger Problem
- 6c33cf2 feat: wiki framework — Stakeholder Mapping
- f1db4e4 feat: wiki field note 014 — The Reorg Trap

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
- `scripts/build.js` — Build system (64KB)

## Architecture Cheat Sheet
- Build: `node scripts/build.js` → template replacement, CSS concat, JS minify via esbuild
- Deploy: `wrangler pages deploy dist --project-name fogsift`
- Themes: 11 total, CSS custom property overrides, cross-tab sync
- Wiki: Markdown in `src/wiki/` → HTML via `marked` at build time
- Search: Full-text index built at compile time (`search-index.json`)
- Queue: Ko-fi webhook → Cloudflare KV → queue display
- CSP: theme-init.js loaded externally for compliance