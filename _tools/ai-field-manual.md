# The Lighthouse — AI Field Manual

**For:** Future Claude sessions working on FogSift
**Last updated:** 2026-02-07

---

## How to Start a New Session

Run these in order. Total time: ~15 seconds.

```bash
# 1. Quick health check (< 1s)
node _tools/scripts/health-check.js

# 2. Context brief — concise project state for your context window
node _tools/scripts/context-brief.js

# 3. If you need deep data, run the full snapshot
node _tools/scripts/project-snapshot.js
# Output: _tools/snapshots/latest.json (machine-readable)
```

**After running these, you know:**
- Current version, branch, uncommitted work
- Test results and Lighthouse scores
- What tools exist and their ports
- What to read first

---

## The Three Scripts

### `health-check.js` — "Am I broken?"
- **Speed:** < 1 second
- **Purpose:** Fast pass/fail on 15 structural checks
- **When to run:** Start of every session, before and after major changes
- **Exit code:** 0 = healthy, 1 = failures exist

### `context-brief.js` — "What do I need to know?"
- **Speed:** < 2 seconds
- **Purpose:** Generates a ~100-line markdown summary optimized for LLM consumption
- **When to run:** Start of every session
- **Output:** Prints to stdout AND saves to `_tools/snapshots/context-brief.md`
- **Design:** Under 200 lines, actionable, temporal, honest

### `project-snapshot.js` — "Tell me everything"
- **Speed:** 2-5 seconds
- **Purpose:** Comprehensive JSON snapshot of the entire project
- **When to run:** Before releases, after major changes, for deep analysis
- **Output:** `_tools/snapshots/latest.json` + timestamped backup
- **Contains:** Git state, package info, file inventory with line counts, test results, wiki stats, infrastructure map

---

## Port System (Johnny Decimal)

```
00xx — System / AI Operations
  5001 — AI Journal ("The Keeper's Log")
         Server: node _AI_Journal/serve.js

03xx — Component Library
  5030 — Component Library ("The Signal Workshop")
         Server: node _tools/component-library/serve.js

05xx — Main Application
  5050 — FogSift dev server ("The Lighthouse")
         Server: npx browser-sync start --server dist --port 5050

06xx — Testing
  5065 — Test Suite Viewer ("Captain FogLift's Quality Report")
         Server: node _tools/test-viewer/serve.js

08xx — Cloud Functions
  8788 — Wrangler dev server ("The Harbor")
         Server: npx wrangler pages dev dist
```

**To start all tools:**
```bash
node _tools/test-viewer/serve.js &
node _tools/component-library/serve.js &
node _AI_Journal/serve.js &
npx browser-sync start --server dist --port 5050 --no-open &
```

---

## Build & Deploy Cheat Sheet

```bash
# Build
node scripts/build.js

# Dev (build + watch + serve)
npm run dev

# Test
npm test

# Lint
npm run lint

# Deploy to production
npm run deploy

# Quick deploy with pre-flight
npm run quick-deploy
```

---

## Workflow Patterns That Work

### Before Making Changes
1. Run health check
2. Read context brief
3. Check git status — understand what's uncommitted
4. Build and verify the dev server shows correctly

### Before Committing
1. Run `npm test` — check the full suite
2. Review git diff — understand every change
3. Health check — verify nothing is broken

### Before Releasing
1. Full snapshot for the record
2. All tests passing
3. Health check fully green
4. Update CHANGELOG.md
5. Bump version in package.json
6. Build, tag, push, create GitHub release

### When Adding a New Page
1. Create HTML in `src/`
2. Add to build.js page list (the `pages` array)
3. Add to sitemap.xml
4. Build and check link integrity
5. Test search index includes the new page

### When Adding a New Tool
1. Create in `_tools/<tool-name>/`
2. Include `serve.js` for consistency
3. Assign a port following the Johnny Decimal convention
4. Update this field manual
5. Update the port map in `project-snapshot.js`

---

## Lessons Learned (Accumulated)

- `dist/` conflicts during merges are irrelevant — just rebuild from source
- Cloudflare redirects `.html` to clean URLs (308 redirect)
- `wrangler.toml` missing `pages_build_output_dir` — warning but deploys fine
- The `THEME_INIT_SCRIPT` constant was refactored to `generateThemeInitScript()` — always check call sites when renaming
- Two queue schemas exist: Ko-fi webhook schema vs display schema (need standardization)
- KV namespace IDs in wrangler.toml are PLACEHOLDERS — need real Cloudflare KV values
- Performance score is primarily driven by image sizes — compress portfolio images first
- Accessibility issues are mostly contrast ratios and missing ARIA labels — fixable without redesign
- The build script (1,291 lines) is monolithic but reliable — don't split it unless it causes real problems

---

## FogSift Lore (Quick Reference)

- **The Lighthouse** = Development utility suite
- **Captain FogLift** = Quality, testing, rigor ("The fog doesn't lift itself.")
- **Foggie Sifter** = UX, components, developer experience ("Have I got a signal for you!")
- **The Keeper's Log** = AI Journal (port 5001)
- **The Signal Workshop** = Component Library (port 5030)
- **The Lens Room** = Test Viewer (port 5065)
- **The Harbor** = Cloudflare dev server (port 8788)

Full lore: `_AI_Journal/002-lore-bible.md`

---

*This manual is maintained by Claude sessions working on FogSift. If something here is wrong, fix it and note the change.*
