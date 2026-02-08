# FogSift — Claude Code Instructions

## What This Is
Diagnostic consulting site for FogSift ("Straight answers to complicated questions").
Live at https://fogsift.com. Deployed on Cloudflare Pages.

## Stack
Vanilla HTML/CSS/JS — no frameworks, by design.
- **Build:** `node scripts/build.js` → output to `dist/`
- **Dev server:** `npx browser-sync start --server dist --port 5050`
- **Test:** `npm test` (9 suites, ~116 tests)
- **Deploy:** `wrangler pages deploy dist --project-name fogsift`
- **Image compression:** `node scripts/compress-images.js`

## Session Startup
A `SessionStart` hook runs `.claude/hooks/startup.sh` automatically. It executes:
1. `health-check.js` — structural pass/fail checks (<1s)
2. `context-brief.js` — markdown state summary (<2s)
3. `project-snapshot.js` — full JSON snapshot (2-5s)

Read the output. It tells you the current state of the project: version, test results, recent commits, pending issues, and what to work on next.

If the hook didn't fire (resumed session, etc.), run manually:
```bash
node _tools/scripts/health-check.js && node _tools/scripts/context-brief.js && node _tools/scripts/project-snapshot.js
```

## Architecture
- Template system: `{{PLACEHOLDER}}` regex replacement in build.js
- Key generators: `generateNavHeader()`, `generateFooter()`, `generateThemeInitScript(pathPrefix)`
- 11 themes, `theme-init.js` loaded externally for CSP compliance
- Wiki: 44 markdown pages in `src/wiki/`, compiled by `marked` at build time
- Search: full-text index built at compile time (`search-index.json`)
- Queue: `src/content/queue.json` + Ko-fi webhook → Cloudflare KV

## Key Rules
- Always rebuild (`node scripts/build.js`) after changing source files
- Run `npm test` before committing to verify nothing broke
- `dist/` is tracked in git — commit rebuilt dist with source changes
- Cloudflare redirects `.html` to clean URLs (308 redirect) — use clean URLs in links
- The build script is monolithic but reliable — don't split it

## Key Docs
- `_tools/ai-field-manual.md` — detailed workflow patterns and process docs
- `TECH_DEBT.md` — known issues and priorities
- `FEATURE_VOID_AUDIT.md` — missing features, prioritized
- `_AI_Journal/` — AI dev notes, reflections, FogSift lore

## Port System
| Port | Service |
|------|---------|
| 5050 | Dev server (browser-sync) |
| 5001 | AI Journal |
| 5030 | Component Library |
| 5065 | Test Suite Viewer |
| 8788 | Wrangler dev (Cloudflare Functions) |
