# FOGSIFT // TECH DEBT & PRIORITIES

**Version:** 0.0.1
**Audit Date:** 2025-12-26
**Status:** LAUNCH COMPLETE — REFACTOR QUEUE INITIATED

---

## CURRENT ARCHITECTURE

```
dist/
├── index.html     # 985 lines — CSS + JS + HTML monolith
├── 404.html       # 150 lines — standalone error page
├── favicon.png
├── og-image.png
├── robots.txt
└── sitemap.xml
```

**Stack:** Vanilla HTML/CSS/JS (no build, no dependencies)

---

## TECH DEBT INVENTORY

### 🔴 CRITICAL (Fix before next feature)

| ID | Issue | Impact | Lines |
|----|-------|--------|-------|
| TD-001 | **Monolith file** — All CSS/JS/HTML in one 985-line file | Can't reuse, hard to maintain | 985 |
| TD-002 | **Global scope JS** — All functions pollute window | Collision risk, no encapsulation | 160 |
| TD-003 | **Hardcoded articles** — Content baked into JS `openArticle()` | Can't add content without code change | 520-533 |

### 🟡 MODERATE (Fix in next sprint)

| ID | Issue | Impact |
|----|-------|--------|
| ~~TD-004~~ | ~~**Inline manifest** — Base64 PWA manifest in `<head>`~~ | ✅ Fixed 2025-12-26 |
| TD-005 | **No build process** — Unminified CSS/JS | Larger payload (~40KB vs ~15KB) |
| ~~TD-006~~ | ~~**Fake email form** — Subscription shows "DB_FULL" toast~~ | ✅ Fixed 2025-12-26 |
| ~~TD-007~~ | ~~**Calendly placeholder** — Contact box has `[CALENDLY EMBED]` text~~ | ✅ Fixed 2025-12-26 |
| TD-008 | **No analytics** — Zero visibility into traffic | Can't measure anything |

### 🟢 LOW (Nice to have)

| ID | Issue | Impact |
|----|-------|--------|
| TD-009 | **No version indicator** — No way to tell deployed version | Debug difficulty |
| TD-010 | **Duplicated theme logic** — Theme init in both index.html and 404.html | DRY violation |
| TD-011 | **No CSS custom property fallbacks** — Old browsers break | ~2% user impact |
| TD-012 | **Console graffiti** — Dev logs in production | Unprofessional |

---

## REFACTOR PRIORITY QUEUE

### Phase 1: STRUCTURE (Next)
Split the monolith into composable files:

```
src/
├── index.html          # Clean HTML only
├── css/
│   ├── tokens.css      # Design tokens (colors, spacing, fonts)
│   ├── base.css        # Reset, typography, utilities
│   └── components.css  # All component styles
├── js/
│   ├── theme.js        # Theme toggle + persistence
│   ├── nav.js          # Mobile menu + breadcrumbs
│   ├── modal.js        # Article modal system
│   ├── toast.js        # Toast notification system
│   └── main.js         # Init + event bindings
└── content/
    └── articles.json   # Article content (title, body, metadata)
```

**Benefit:** Each file has one job. Easy to find, easy to change.

### Phase 2: BUILD (After structure)
Add minimal build tooling:

```
package.json           # Just for scripts, no frameworks
├── build              # Concat + minify CSS/JS
├── dev                # Local server with watch
└── deploy             # Build + wrangler pages deploy
```

**Tooling:**
- `esbuild` (fast JS bundling)
- `lightningcss` (CSS minification)
- No React, no Vite, no webpack

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

| Component | Reusable? | Target |
|-----------|-----------|--------|
| Toast system | ❌ Inline | ✅ `toast.js` module |
| Theme toggle | ❌ Inline | ✅ `theme.js` module |
| Modal system | ❌ Inline | ✅ `modal.js` module |
| Breadcrumb tracker | ❌ Inline | ✅ `nav.js` module |
| Design tokens | ❌ In `<style>` | ✅ `tokens.css` |
| Article content | ❌ In JS | ✅ `articles.json` |

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
| index.html size | ~40KB | <15KB (minified) |
| Lighthouse Performance | Unknown | >90 |
| Time to Interactive | Unknown | <1.5s |
| Files in dist/ | 6 | 10-15 (after split) |

---

*Last updated: 2025-12-26*

