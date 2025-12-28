# FOGSIFT // TECH DEBT & PRIORITIES

**Version:** 0.0.5
**Audit Date:** 2025-12-28
**Status:** LAUNCH COMPLETE — CLEANUP & MAINTENANCE

---

## CURRENT ARCHITECTURE

```
src/                          # Source files (edit here)
├── index.html               # Main page
├── css/
│   ├── tokens.css           # Design tokens (306 lines)
│   ├── base.css             # Reset, typography (216 lines)
│   ├── components.css       # Component styles (649 lines)
│   ├── navigation.css       # Nav styles (473 lines)
│   ├── mobile.css           # Mobile responsive (224 lines)
│   ├── industrial-theme.css # Industrial theme (493 lines)
│   ├── wiki.css             # Wiki styles (1,135 lines)
│   └── sleep.css            # Sleep mode (779 lines)
├── js/
│   ├── main.js              # App init (189 lines)
│   ├── theme.js             # Theme module (462 lines)
│   ├── toast.js             # Toast module (84 lines)
│   ├── modal.js             # Modal module (106 lines)
│   ├── nav.js               # Navigation module (37 lines)
│   ├── sleep.js             # Sleep mode (596 lines)
│   ├── cache.js             # Caching layer (205 lines)
│   ├── debug.js             # Debug utilities (193 lines)
│   └── wiki-api.js          # Wiki API client (125 lines)
└── content/
    └── articles.json        # Article content

dist/                         # Built output (auto-generated)
├── index.html               # Processed HTML
├── styles.css               # Concatenated CSS (~4.3KB)
├── app.js                   # Concatenated JS (~2KB)
└── [static assets]
```

**Stack:** Vanilla HTML/CSS/JS with build script (Node.js)

---

## TECH DEBT INVENTORY

### 🔴 CRITICAL (Fix before next feature)

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| ~~TD-001~~ | ~~**Monolith file** — All CSS/JS/HTML in one file~~ | ~~Can't reuse~~ | ✅ Split into src/ modules |
| ~~TD-002~~ | ~~**Global scope JS** — All functions pollute window~~ | ~~Collision risk~~ | ✅ Module pattern (Toast, Theme, etc) |
| ~~TD-003~~ | ~~**Hardcoded articles** — Content in modal.js~~ | ~~Can't add content without code change~~ | ✅ Fixed 2025-12-26 |
| ~~TD-013~~ | ~~**Missing error handling** — localStorage, fetch, clipboard~~ | ~~Silent failures~~ | ✅ Fixed 2025-12-28 |
| ~~TD-014~~ | ~~**Memory leaks** — Uncleared setInterval timers~~ | ~~Memory accumulation~~ | ✅ Fixed 2025-12-28 |
| TD-015 | **Magic numbers** — Hardcoded timing values (1000, 2500, 300) | Hard to maintain |
| TD-016 | **No static analysis** — ESLint now configured but needs CI integration | Bugs slip through |

### 🟡 MODERATE (Fix in next sprint)

| ID | Issue | Impact |
|----|-------|--------|
| ~~TD-004~~ | ~~**Inline manifest** — Base64 PWA manifest in `<head>`~~ | ✅ Fixed 2025-12-26 |
| TD-005 | **No build process** — Unminified CSS/JS | Larger payload (~40KB vs ~15KB) |
| ~~TD-006~~ | ~~**Fake email form** — Subscription shows "DB_FULL" toast~~ | ✅ Fixed 2025-12-26 |
| ~~TD-007~~ | ~~**Calendly placeholder** — Contact box has `[CALENDLY EMBED]` text~~ | ✅ Fixed 2025-12-26 |
| TD-008 | **No analytics** — Zero visibility into traffic | Can't measure anything |
| TD-017 | **Bloated CSS** — components.css is 649 lines (reduced from 2,222) | Partially addressed |
| TD-018 | **Large sleep.js** — 596 lines | Should be split |
| TD-019 | **No tests** — Zero test coverage | Can't refactor safely |
| TD-020 | **Large wiki.css** — 1,135 lines | Should be split or modularized |

### 🟢 LOW (Nice to have)

| ID | Issue | Impact |
|----|-------|--------|
| ~~TD-009~~ | ~~**No version indicator** — No way to tell deployed version~~ | ✅ Version in footer + version.json |
| ~~TD-010~~ | ~~**Duplicated theme logic** — Theme init in both index.html and 404.html~~ | ✅ Fixed 2025-12-28 - Wiki pages now use shared app.js |
| TD-011 | **No CSS custom property fallbacks** — Old browsers break | ~2% user impact |
| ~~TD-012~~ | ~~**Console graffiti** — Dev logs in production~~ | ✅ Reviewed - only styled branding |

---

## REFACTOR PRIORITY QUEUE

### Phase 1: STRUCTURE ✅ COMPLETE
Split the monolith into composable files:

```
src/
├── index.html          # ✅ Clean HTML only
├── css/
│   ├── tokens.css      # ✅ Design tokens
│   ├── base.css        # ✅ Reset, typography
│   └── components.css  # ✅ Component styles
├── js/
│   ├── theme.js        # ✅ Theme module
│   ├── nav.js          # ✅ Nav module
│   ├── modal.js        # ✅ Modal module
│   ├── toast.js        # ✅ Toast module
│   └── main.js         # ✅ App init
└── content/
    └── articles.json   # ✅ Created (not yet loaded by modal.js)
```

**Status:** ✅ Complete. Modal now fetches from articles.json.

### Phase 2: BUILD 🔄 IN PROGRESS
Build tooling:

```
package.json           # ✅ Scripts defined
├── build              # ✅ Concat CSS/JS (no minification yet)
├── dev                # ✅ Wrangler dev server
└── deploy             # ✅ Build + deploy to Cloudflare Pages
```

**Status:** Build works but no minification. Add esbuild/lightningcss for smaller bundles.

**Remaining:**
- [ ] Add CSS minification (lightningcss or clean-css)
- [ ] Add JS minification (esbuild --minify)

### Phase 3: CONTENT (After build)
Move content out of code:

```
content/
├── articles/
│   ├── 001-map-territory.md
│   ├── 002-precision-accuracy.md
│   └── 003-entropy.md
└── config.json         # Site metadata, nav structure
```

**Benefit:** Writers can add content without touching code.

### Phase 4: FEATURES (After content)
- Real email capture (Cloudflare Workers KV or external service)
- Calendly integration
- Analytics (Plausible or Cloudflare Analytics)
- RSS feed for field notes

---

## DRY CODE RULES

1. **One source of truth** — Design tokens in `tokens.css`, nowhere else
2. **Extract at 3** — If code appears 3x, extract to function/component
3. **Content ≠ Code** — Text lives in data files, not in JS
4. **No magic numbers** — All spacing/colors via CSS variables
5. **Flat > Nested** — Avoid deep nesting in CSS and JS

---

## COMPOSABILITY TARGETS

| Component | Status | Location |
|-----------|--------|----------|
| Toast system | ✅ Done | `src/js/toast.js` |
| Theme toggle | ✅ Done | `src/js/theme.js` |
| Modal system | ✅ Done | `src/js/modal.js` |
| Breadcrumb tracker | ✅ Done | `src/js/nav.js` |
| Design tokens | ✅ Done | `src/css/tokens.css` |
| Article content | ✅ Done | `src/content/articles.json` loaded by modal.js |

---

## QUICK WINS (< 30 min each)

- [x] Remove console.log statements (TD-012) ✅ Already clean - only styled branding remains
- [x] Add version comment to HTML ✅ Already present in footer (v0.0.1)
- [x] Add real manifest.json file (TD-004) ✅ 2025-12-26
- [x] Hide email form or add "coming soon" (TD-006) ✅ 2025-12-26
- [x] Replace Calendly placeholder with mailto link (TD-007) ✅ 2025-12-26

---

## DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-26 | No frameworks | Site is simple enough. Frameworks add complexity. |
| 2025-12-26 | Keep vanilla JS | 160 lines of JS doesn't need React. |
| 2025-12-26 | esbuild over webpack | 100x faster, zero config. |
| 2025-12-26 | Cloudflare Pages | Free, fast, already deployed. |

---

## METRICS TO TRACK

| Metric | Current | Target |
|--------|---------|--------|
| dist/index.html | ~15KB | <10KB (minified) |
| dist/styles.css | ~8KB | <5KB (minified) |
| dist/app.js | ~10KB | <5KB (minified) |
| Lighthouse Performance | Unknown | >90 |
| Time to Interactive | Unknown | <1.5s |
| Files in src/ | 12 | ✅ Achieved |

---

*Last updated: 2025-12-28*
*Cleanup: Archived work efforts, updated line counts, marked TD-010 resolved*

