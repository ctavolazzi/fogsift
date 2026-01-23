# FogSift Development Log

This file tracks development activity, decisions, and changes across sessions.

---

## 2025-12-27 23:05 PST

### MCP Work-Efforts Server Folder Name Fix

**Issue:** The MCP work-efforts server (v0.3.0) was looking for `_work_efforts_` (with trailing underscore) but the actual folder in fogsift is `_work_efforts` (no trailing underscore). This caused `list_work_efforts` to return "No work efforts found" even though 4 work efforts existed.

**Root Cause:** Hardcoded path mismatch in `/Users/ctavolazzi/Code/.mcp-servers/work-efforts/server.js`

**Fix Applied:** Updated 6 occurrences in server.js:
- Line 12 (comment): `_work_efforts_/` → `_work_efforts/`
- Line 357 (create_work_effort): `'_work_efforts_'` → `'_work_efforts'`
- Line 435 (list_work_efforts): `'_work_efforts_'` → `'_work_efforts'`
- Line 473 (error message): Updated to match
- Line 631 (search_work_efforts): `'_work_efforts_'` → `'_work_efforts'`
- Line 681 (error message): Updated to match

**Files Changed:**
- `/Users/ctavolazzi/Code/.mcp-servers/work-efforts/server.js`

**Verification:** After Cursor restart, `list_work_efforts` should find:
- WE-251227-x7k9 (API Architecture)
- WE-251227-uzo7 (Work Effort System Rules Setup)
- WE-251227-fmhx (MCP System Dashboard)
- WE-251227-giok (MCP Integration Test Task)

**Related Plan:** `fix_mcp_folder_name_b817668c.plan.md`

---

## Session Summary: 2025-12-27

### Completed Today
1. Version bumped to 0.0.5
2. Merged 3 feature branches
3. Created GitHub releases (v0.0.4, v0.0.5)
4. Deployed to Cloudflare Pages
5. Added Konami code easter egg (↑↑↓↓←→←→BA)
6. Fixed `_work_efforts_` → `_work_efforts` folder naming
7. Fixed MCP work-efforts server to use correct folder name

### Current State
- **Version:** 0.0.5
- **Live site:** https://fogsift.pages.dev
- **MCP Servers:** 11/11 healthy (pending restart for folder name fix)
- **Git:** Clean, up to date with origin

### Work Efforts (4 total)
| ID | Title | Status |
|----|-------|--------|
| WE-251227-x7k9 | API Architecture | Active (all tickets done) |
| WE-251227-uzo7 | Work Effort System Rules Setup | Completed |
| WE-251227-fmhx | MCP System Dashboard | Completed |
| WE-251227-giok | MCP Integration Test Task | Completed |


[2025-12-28 07:19:40] SESSION UPDATE: Fixed MCP work-efforts server folder name (_work_efforts_ → _work_efforts). Built and deployed dev-log MCP server (12/12 servers healthy). Marked WE-251227-x7k9 (API Architecture) as completed. All work efforts now discoverable via list_work_efforts.

[2025-12-28 07:21:49] PERSIST: Created memory entities (FogSift_Workflow, Work_Effort_System, MCP_Servers_FogSift) and relations. Note: Memory MCP has read schema error (-32602) but write operations succeeded.

[2025-12-28 08:31:19] ## Theme Switcher UX Improvement

**Task:** Make theme dropdown always visible in header across all viewports

**Changes:**
1. Remove theme selector from mobile drawer
2. Keep theme dropdown visible in header on mobile (next to hamburger)
3. Apply to main site and wiki templates

**Files to modify:**
- src/index.html
- src/css/navigation.css  
- src/wiki-template.html
- src/wiki-index-template.html

[2025-12-28 08:34:47] ## Theme Switcher UX Improvement - COMPLETED

**Status:** ✅ Complete

### Changes Made
1. Removed theme selector from mobile drawer in:
   - `src/index.html`
   - `src/wiki-template.html`  
   - `src/wiki-index-template.html`

2. Updated CSS to keep theme dropdown visible on mobile:
   - `src/css/navigation.css` - Made `.nav-controls .theme-selector` visible at 800px breakpoint
   - `src/css/mobile.css` - Changed rule at 768px from `display: none` to `display: inline-flex`
   - Added compact styling for mobile dropdown (80px min-width, smaller font)

### Verification Results
- ✅ Theme dropdown visible in header on mobile (375px)
- ✅ Theme dropdown visible in header on desktop (1280px)
- ✅ Mobile drawer no longer has theme selector
- ✅ Theme switching works on all viewports
- ✅ All three themes (Light, Dark, Industrial) functional
- ✅ Wiki pages have consistent header layout
- ✅ No console errors

### Layout
- Mobile: [Logo] [Theme Dropdown] [Hamburger]
- Desktop: [Logo] [Nav Links] [Theme Dropdown]

[2025-12-28 08:48:57] ## DRY Code Refactoring - Custom Theme Picker

**Task:** Implement custom styled dropdown for theme picker + DRY refactoring

### Custom Theme Picker
- Replaced native `<select>` with custom dropdown component
- Three themes with icons: ☀ Light, ● Dark, ▣ Industrial
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click-outside-to-close behavior
- Proper ARIA attributes for accessibility

### DRY Refactoring
Wiki templates now load shared `app.js` instead of duplicating inline JS:

**Before:** ~250 lines of inline JS per wiki template (Theme, ThemePicker, Nav, Toast duplicated)

**After:** 
- Wiki templates load `{{APP_PATH}}` which resolves to correct relative path
- Only wiki-specific code (WikiNav) remains inline (~50 lines)
- Theme, ThemePicker, Nav, Toast shared via app.js

### Files Modified
| File | Changes |
|------|---------|
| `scripts/build.js` | Added `appPath` variable + `{{APP_PATH}}` replacement |
| `src/index.html` | Custom theme picker HTML |
| `src/wiki-template.html` | Load app.js, keep only WikiNav inline |
| `src/wiki-index-template.html` | Load app.js, removed all inline JS |
| `src/js/theme.js` | Added ThemePicker component |
| `src/css/navigation.css` | Custom dropdown styles |

### Benefits
- Single source of truth for Theme/ThemePicker/Nav/Toast
- Bug fixes propagate to all pages automatically
- Easier to maintain and extend

[2025-12-28 08:53:25] ## Theme System Enhancements - DEPLOYED ✅

### PR #10 Merged
**Commit:** fd54a89 (squash merge)
**Branch:** feature/theme-system-enhancements → main

### Changes Summary

**Custom Theme Picker**
- Replaced native `<select>` with custom styled dropdown
- Icons: ☀ Light, ● Dark, ▣ Industrial
- Full keyboard navigation (Arrow keys, Enter, Escape)
- Click-outside-to-close behavior

**DRY Refactoring**
- Wiki templates now load shared `app.js`
- Removed ~200 lines duplicate JS per template
- Added `{{APP_PATH}}` build variable
- **Net result: -2,044 lines of code**

**New Features**
- System theme auto-detection (`prefers-color-scheme`)
- Keyboard shortcut: Press `T` to cycle themes
- Smooth theme transitions (0.3s ease)
- Console hint for keyboard shortcut

**Accessibility**
- Respects `prefers-reduced-motion`
- ARIA roles on custom dropdown

### Files Modified
- `src/js/theme.js` - ThemePicker + system detection
- `src/js/main.js` - Console hint
- `src/css/tokens.css` - Smooth transitions
- `src/css/navigation.css` - Custom dropdown styles
- `scripts/build.js` - APP_PATH variable
- Wiki templates - Load app.js

### Deployment
- **Production:** https://fogsift.com
- **Preview:** https://0d69d168.fogsift.pages.dev

[2025-12-28 08:59:55] ## Repository Cleanup Complete

**Commit:** `ed50783`

### Actions Taken

1. **Archived 4 completed work efforts** to `_work_efforts/_archive/2025-12/`:
   - WE-251227-fmhx (MCP System Dashboard)
   - WE-251227-giok (MCP Integration Test Task)
   - WE-251227-uzo7 (Work Effort System Rules Setup)
   - WE-251227-x7k9 (API Architecture)

2. **Archived 21 legacy work efforts** to `_work_efforts/_archive/legacy/`:
   - 00-09_category/ (12 files)
   - 00-09_site_improvements/ (9 files)

3. **Pruned stale git branches:**
   - origin/feature/theme-switcher-ux-improvements
   - origin/feature/theme-system-enhancements

4. **Updated TECH_DEBT.md:**
   - Resolved TD-010 (theme logic now DRY with shared app.js)
   - Added TD-020 (wiki.css at 1,135 lines)
   - Updated file sizes to reflect current state
   - Bumped version to 0.0.5

5. **Updated CONTINUATION.md:**
   - Updated to v0.0.5
   - Updated JS modules section with current file list
   - Updated work efforts section to reflect archive
   - Updated recent work section with theme enhancements

### Final State
- **Work Efforts:** Clean root with only devlog.md
- **Archive:** 2025-12/ (4 WEs, 19 tickets) + legacy/ (21 files)
- **Git:** Single main branch, no stale remotes
- **Docs:** TECH_DEBT.md and CONTINUATION.md current

[2025-12-28 09:15:43] CSS REFACTOR: Removed all 56 !important declarations

**Files Changed:**
- `src/css/wiki.css` - Fixed .wiki-nav-active specificity (1 instance)
- `src/css/components.css` - Refactored honeypot field selectors (10 instances)
- `src/css/industrial-theme.css` - Fixed rotating-highlight reset (7 instances)
- `src/css/sleep.css` - Refactored animation state selectors (25 instances)
- `src/css/base.css` - Fixed print stylesheet specificity (12 instances)
- `src/css/tokens.css` - Fixed reduced motion specificity (1 instance)

**Techniques Used:**
- `html body` prefix for print/accessibility overrides
- `body.page-sleeping` / `body.page-waking` for animation states
- Compound selectors `.hp-field.hp-field` for security fields
- Parent context selectors for theme overrides

**Verification:** `grep -r "!important;" src/css/` returns zero results

[2025-12-28 20:46:49] ## WE-251228-c824: Optimize Sleep Mode for Lightweight Deep Sleep

### Summary
Implemented "deep sleep" mode that kicks in 3 seconds after entering sleep mode. This maintains the charming "falling asleep" visual while eliminating CPU/GPU usage once settled.

### Changes Made

**src/js/sleep.js:**
- Added `DEEP_SLEEP_DELAY: 3000` constant
- Added `isDeepSleep` state flag and `deepSleepTimeout` timer
- Added `enterDeepSleep()` method that:
  - Cancels the requestAnimationFrame loop (no more flying toasters)
  - Hides the canvas element
  - Removes floating Z elements from overlay
  - Cleans up element decorations (zzz, caps, bubbles)
  - Adds `deep-sleep` class to body and overlay
- Updated `wakeUp()` to clear deep sleep state and timeout

**src/css/sleep.css:**
- Added deep sleep CSS rules that:
  - Set `animation: none` on all breathing elements
  - Hold elements at their final sleeping positions (rotated/tilted)
  - Hide canvas, floating Zs, and scanlines
  - Set `will-change: auto` to release GPU memory
  - Keep static "tap to wake" message visible

### Resource Usage
- **Before:** Continuous requestAnimationFrame loop + 10+ CSS animations running
- **After:** Near-zero CPU/GPU usage (static CSS only)

### Timeline
- 0s: Elements start falling asleep (one-shot animations)
- 1.5s: Breathing animations begin
- 3s: Deep sleep activates, everything freezes

Status: ✅ Completed

[2025-12-28 21:00:57] ## Sleep Mode Polish - Made Deep Sleep Cozy

### Problem
Deep sleep mode looked glitchy - animations stopped abruptly instead of settling peacefully.

### Solution
Added smooth transition into deep sleep:

1. **Settling Phase** (1.5s): 
   - Canvas and Zs fade out smoothly
   - Elements transition gracefully to final positions

2. **Deep Sleep Visual**:
   - Darker overlay (92% opacity) - like a quiet room at night
   - Gentle vignette effect for coziness
   - Very slow, dreamy glow on the 💤 icon (6-8s cycle)
   - Subtle text pulse on "tap to wake"
   - Scanlines at 10% opacity for atmosphere

3. **Elements**: More dimmed (40-60% opacity) to feel truly asleep

The deep sleep animations are intentionally VERY slow (6-8 second cycles) - this is GPU friendly while still feeling alive.

[2025-12-29 00:54:49] ## Tech Debt Pass - 2025-12-28

### Summary
Full tech debt cleanup pass addressing TD-015 (magic numbers) and TD-010 (theme duplication).

### Changes Made
- **src/index.html**: Removed MCP test marker artifact
- **src/js/main.js**: Added TIMING constants, removed hardcoded version
- **src/js/toast.js**: Added TIMING constants, fixed ARIA on dynamic container, explicit window export
- **src/js/modal.js**: Added TIMING constants, explicit window export
- **src/js/nav.js**: Added JSDoc for init(), explicit window export
- **src/js/cache.js**: Added ESLint global declaration for Debug
- **src/js/wiki-api.js**: Added ESLint global declaration for Debug
- **src/js/debug.js**: Removed unused timestamp variable
- **src/wiki-template.html**: Replaced inline theme init with {{THEME_INIT}}
- **src/wiki-index-template.html**: Replaced inline theme init with {{THEME_INIT}}
- **scripts/build.js**: Added THEME_INIT injection to wiki builds
- **src/css/tokens.css**: Removed unused --bar-* and --breadcrumb-height variables
- **TECH_DEBT.md**: Marked TD-015 resolved, updated TD-010 description

### Tech Debt Status
- TD-015 ✅ RESOLVED - Magic numbers consolidated into TIMING constants
- TD-010 ✅ RESOLVED - Theme init now single source of truth in build.js
- Lint: 0 errors, 9 warnings (intentional silent catches)

### Build
- All 29 wiki pages built successfully
- 4 API endpoints generated
- Version: 0.0.5

[2026-01-22 03:35:47] ## FogSift Services PDF Generated

- Created `src/content/fogsift_services.md` with "$20 Problem Shark Tank" marketing copy
- Updated `scripts/generate_fogsift_pdf.py` with CLI args, error handling, and WAFT import check
- Generated `fogsift_services.pdf` (2 pages, ~45KB) using `PDF.from_markdown()` with `style='premium'`
- Content includes: The Offer, How It Works, The Three Outcomes, The Fine Print, Submit CTA

**Files created:**
- `src/content/fogsift_services.md` - Marketing content
- `fogsift_services.pdf` - Generated PDF (44,972 bytes)

[2026-01-22 03:38:31] ## Full Site Update: Problem Shark Tank Model

Updated the entire FogSift site to reflect the new $20 "Problem Shark Tank" business model.

### Changes Made:

**index.html:**
- Updated process section from 3 steps (Listen/Research/Deliver) to 5 steps (Submit/Review/Work/Deliver/Next Steps)
- Replaced 3-tier pricing with single $20 "Problem Shark Tank" offer
- Added "What Happens After" section with three outcomes

**pricing.html:**
- Complete overhaul to new model
- Added "What You Get (Always)" section - video + report
- Added "Three Outcomes" section
- Added "Fine Print" with consent model
- Updated FAQ (Why $20? What if you don't solve it? Why no face?)
- Updated meta description

**process.html:**
- Updated to 5-step process
- Added "Problem Shark Tank: The $20 Gamble" tagline
- Added sections: What You Always Get, Three Outcomes, Why No Face?, Why Daily?
- Updated meta description

**contact.html:**
- Primary CTA now points to Ko-fi ($20 submission)
- Secondary option for free email questions
- Updated "What to Include" with anonymization option
- Added "What Happens Next" explaining the flow

### New Model Summary:
- $20 entry fee via Ko-fi
- 75 minutes of filmed work (no face, Wilson style)
- Always get: video + written report
- Three outcomes: Go deeper / I know people / This is sick
- Consent: Submit = agree to become content (anonymization available)

[2026-01-22 03:41:48] ## Queue System Implementation

### Created:
- `src/queue.html` - New queue page showing pending and completed problems
- `src/content/queue.json` - Queue data file with mock submissions

### Updated:
- All CTAs now say "Join the Queue" instead of "Submit Your Problem"
- All pages now mention "adds you to the queue" in pricing copy
- Added Queue link to navigation and all footers
- Hero section now has "Join the Queue" as primary CTA and "See the Queue" as secondary

### Queue Features:
- Stats display (in queue, completed, avg days to pickup)
- Mock data banner (clearly labeled as examples)
- Pending queue with position numbers
- Completed section with outcomes shown
- Responsive design
- Dynamic loading from queue.json

### Mock Data Includes:
- 3 problems in queue (various categories)
- 4 completed problems showing all three outcomes:
  - "Let's go deeper" (contract work)
  - "I know people" (referral)
  - "This is sick" (encouragement)

### Next Steps for Ko-fi Integration:
1. Create Ko-fi Commission listing for "$20 Problem Shark Tank"
2. Set up webhook endpoint to receive payment notifications
3. Auto-populate queue.json from webhook data

[2026-01-22 03:54:15] ## FAQ Page Created

### Created:
- `src/faq.html` - Comprehensive FAQ page covering:
  - What $20 gets you (queue position, up to 1 hour, reply)
  - How the queue works
  - "Up to 1 hour" explanation
  - Refusal rights
  - Refund policy (encouraged!)
  - Queue bumping mechanism
  - Working together more
  - Direct contact (easter egg for readers)

### Updated:
- Navigation: Simplified to Wiki | Process | Queue | FAQ | Pricing | Contact
- Removed PAPERBIN and ABOUT from main nav (less clutter)
- All footers now include FAQ link
- Queue page "How It Works" updated to match FAQ content
- Added link from Queue page to FAQ

### Key Business Model Clarifications:
1. $20 = queue position + up to 1 hour + reply
2. Daily selection: one from top, one random
3. Bump fee available daily (prevents queue buying)
4. Refunds encouraged if time-sensitive
5. Direct email buried as easter egg for readers

[2026-01-22 04:05:26] ## FogSift Manager MCP Server Created

### Location:
`.mcp-servers/fogsift-manager/`

### Tools Available:

**Build & Deploy:**
- `fogsift_build` - Build the site
- `fogsift_deploy` - Build and deploy to Cloudflare

**Dev Server:**
- `fogsift_dev_start` - Start dev server on port 5050
- `fogsift_dev_stop` - Stop dev server

**Queue Management:**
- `fogsift_queue_list` - List all queue items
- `fogsift_queue_add` - Add new problem to queue
- `fogsift_queue_complete` - Mark item as completed with outcome
- `fogsift_queue_remove` - Remove item (refund)
- `fogsift_queue_bump` - Move item up in queue
- `fogsift_queue_go_live` - Remove mock data flag

**Content & Status:**
- `fogsift_content_update` - Update content JSON files
- `fogsift_status` - Get project status

### Configuration:
Added to `~/.cursor/mcp.json` as "fogsift"

### To Activate:
Restart Cursor IDE

[2026-01-22 14:36:30] ## Plan: Mobile-first Shark Tank Offer Polish

Objective: fix mobile layout for the $20 offer, restore theme/copy tools, update Ko-fi PDF link, then QA + sync dist.

Plan:
1. Update v2 header to include theme toggle + copy button (mobile-friendly).
2. Fix pricing-card mobile layout (badge, spacing, full-width CTA).
3. Reorder mobile tiers to show $20 offer first and update PDF link to https://ko-fi.com/s/23e227d00b.
4. Mobile QA, update dist, and verify no console errors.

[2026-01-22 15:05:33] ## Mobile Shark Tank Offer Polish (v2)

- Restored theme toggle + copy button in v2 header (mobile-friendly)
- Fixed mobile pricing card spacing, badge placement, and CTA width
- Updated Ko-fi PDF links to https://ko-fi.com/s/23e227d00b
- Mobile tier ordering prioritizes $20 offer
- Synced updated v2 files to dist; QA on mobile viewport (no console errors)

**Files updated:**
- `src/v2/index.html`
- `src/v2/app.js`
- `src/css/v2/styles.css`
- `dist/v2/index.html`
- `dist/v2/app.js`
- `dist/css/v2/styles.css`

[2026-01-22 19:15:10] ## Plan: Merge v2 into src (single source)

Objective: consolidate v2 improvements into main `src/`, polish mobile $20 offer, add entry + premium options, update Ko-fi product link, and QA via localhost.

Plan:
1. Merge v2 homepage content into `src/index.html` (keep NAV_HEADER + existing tooling).
2. Fix mobile $20 pricing card layout (badge spacing, CTA width, alignment) in `src/css/mobile.css` + `components.css`.
3. Add $5 entry PDF + $500 premium options with Ko-fi link https://ko-fi.com/s/23e227d00b.
4. QA on `http://localhost:5050` with screenshots and sync dist.

[2026-01-22 19:33:20] ## Merge v2 Into src (Single Source)

- Replaced The Deal cards with $5 entry, $20 main, $500 premium offers
- Updated Ko-fi product link to https://ko-fi.com/s/23e227d00b
- Fixed mobile pricing badge overlap and made CTAs full width
- Forced light mode on load while keeping theme picker available
- Built dist with updated HTML/CSS/JS
- Captured mobile screenshots via localhost:5050

**Files updated:**
- `src/index.html`
- `src/css/components.css`
- `src/css/mobile.css`
- `src/js/theme.js`
- `scripts/build.js`
- `dist/index.html`
- `dist/styles.css`
- `dist/app.js`

[2026-01-22 19:35:57 PST] ## Plan: Focus Session Rename

Objective: rename "Problem Shark Tank" to "Focus Session" across source + content, update research-squad copy, and manually sync dist.

Plan:
1. Update WE-260122-m9k2 scope + add a ticket for the rename work.
2. Replace offer naming + copy in src pages and content files.
3. Manually sync dist HTML equivalents (no build).
4. Verify zero Shark Tank references and update devlog/ticket status.

[2026-01-22 19:36:30 PST] ## Focus Session Rename - COMPLETE

- Renamed the $20 offer to "Focus Session" across src pages and content files.
- Updated research-squad framing and accessibility filter language.
- Manually synced dist HTML equivalents (no build scripts).
- Verified zero "Shark Tank" references in src/dist.
- Updated WE-260122-m9k2 with ticket TKT-m9k2-005.

**Files updated:**
- `src/index.html`
- `src/pricing.html`
- `src/process.html`
- `src/faq.html`
- `src/content/site-data.json`
- `src/content/handout_content.md`
- `src/content/fogsift_services.md`
- `dist/index.html`
- `dist/pricing.html`
- `dist/process.html`
- `dist/faq.html`

[2026-01-22 15:13 PST] ## Plan: Homepage Consolidation + Queue/YT Funnel

Objective: Consolidate homepage into a single source of truth, strengthen queue submission and YouTube delivery messaging, and remove all v2 artifacts.

Plan:
1. Update WE-260122-m9k2 scope + tickets.
2. Consolidate persuasive v2 sections into `src/index.html` with queue/YT/friction copy.
3. Delete v2 source/output dirs with backup check + deletion manifest.
4. Sync `dist/index.html` to match `src/index.html` (no npm build).
5. Quick QA pass + update work effort.

[2026-01-22 15:19 PST] ## Homepage Consolidation + Queue/YT Funnel - COMPLETE

- Updated homepage copy to center the queue, friction filter, and YouTube delivery.
- Added "Why this works", "Examples from the queue", and "Common concerns" sections.
- Removed all v2 source/output directories; deletion manifest created.
- Synced `dist/index.html` to match `src/index.html` (no build scripts).

**Files updated:**
- `src/index.html`
- `dist/index.html`
