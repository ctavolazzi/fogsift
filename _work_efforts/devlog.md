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
