# FOGSIFT // TECH DEBT & PRIORITIES

**Version:** 0.2.0
**Audit Date:** 2026-03-01
**Last Cleanup:** 2026-03-01 (Major cleanup pass — many items resolved)
**Status:** ACTIVE DEVELOPMENT

---

## CURRENT ARCHITECTURE

```
src/                          # Source files (edit here)
├── index.html               # Main page
├── css/
│   ├── tokens.css           # Design tokens
│   ├── base.css             # Reset, typography
│   ├── components.css       # Component styles
│   ├── navigation.css       # Nav styles
│   ├── mobile.css           # Mobile responsive
│   ├── industrial-theme.css # Industrial theme
│   ├── wiki.css             # Wiki styles (~1,135 lines)
│   └── sleep.css            # Sleep mode
├── js/
│   ├── main.js              # App init
│   ├── theme.js             # Theme module
│   ├── toast.js             # Toast module
│   ├── modal.js             # Modal module
│   ├── nav.js               # Navigation module
│   ├── sleep.js             # Sleep mode (~596 lines)
│   ├── cache.js             # Caching layer
│   ├── search.js            # Nav search overlay (bundled into app.js)
│   ├── search-page.js       # Dedicated /search page (served as static asset)
│   └── engine.js            # Engine visualization page (~1063 lines)
└── wiki/
    └── [categories]/        # Markdown source files — auto-discovered by build
```

**Stack:** Vanilla HTML/CSS/JS with build script (Node.js)
**Build:** `node scripts/build.js` → `dist/` (esbuild for JS, concat for CSS)
**Tests:** 138 pass / 0 fail (as of 2026-03-01)

---

## TECH DEBT INVENTORY

### 🔴 CRITICAL (Fix before next feature)

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| TD-016 | **No CI integration** — ESLint configured but not run in CI | Bugs slip through | Open |

### 🟡 MODERATE (Fix in next sprint)

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| TD-008 | **No analytics** — Zero visibility into traffic | Can't measure anything | Open |
| TD-017 | **Bloated CSS** — wiki.css ~1,135 lines, sleep.css ~779 lines | Maintenance overhead | Open |
| TD-018 | **Large sleep.js** — 596 lines | Should be split | Open |

### 🟢 LOW (Nice to have)

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| TD-011 | **No CSS custom property fallbacks** — Old browsers break | ~2% user impact | Open |
| TD-021 | **Wiki cross-links use .html extension** — creates redirect chains | SEO/perf minor cost | Open |

---

## RESOLVED DEBT (for reference)

| ID | Issue | Resolution |
|----|-------|------------|
| TD-001 | Monolith file | ✅ Split into src/ modules |
| TD-002 | Global scope JS | ✅ Module pattern |
| TD-003 | Hardcoded articles | ✅ articles.json content system |
| TD-004 | Inline manifest | ✅ manifest.json file |
| TD-005 | No build process / no minification | ✅ esbuild (49% JS savings, 33% CSS) |
| TD-006 | Fake email form | ✅ Ko-fi webhook + KV queue |
| TD-007 | Calendly placeholder | ✅ Queue system built |
| TD-009 | No version indicator | ✅ Version in footer + version.json |
| TD-010 | Duplicated theme logic | ✅ Canonical THEME_INIT in build.js |
| TD-012 | Console graffiti | ✅ Only styled branding remains |
| TD-013 | Missing error handling | ✅ Fixed |
| TD-014 | Memory leaks | ✅ Fixed |
| TD-015 | Magic numbers | ✅ TIMING constants |
| TD-019 | No tests | ✅ 138 tests (9 suites) |
| TD-RSS | No RSS feed | ✅ buildRSSFeed() → dist/rss.xml |
| TD-SITEMAP | No XML sitemap | ✅ buildSitemap() → dist/sitemap.xml |
| TD-SEARCH | No search | ✅ Full-text search at /search |
| TD-READTIME | No reading time estimates | ✅ {{READ_TIME}} on wiki pages |
| TD-INDEX | wiki/index.json manually maintained | ✅ Replaced with buildWikiIndex() — filesystem-driven |

---

## FEATURE GAPS (highest business impact)

These are not tech debt but missing product features. Ordered by conversion impact:

| Feature | Priority | Notes |
|---------|----------|-------|
| Analytics (Plausible / CF Analytics) | 🔴 High | Flying blind on all traffic |
| Contact form (not mailto) | 🔴 High | Mailto has 50%+ drop-off vs form |
| Email capture / newsletter | 🔴 High | No passive lead gen |
| Calendly / booking widget | 🔴 High | No frictionless booking |
| Testimonials section | 🟡 Medium | Social proof gap |
| Social sharing on wiki | 🟡 Medium | Amplify reach |
| LinkedIn / social profile links | 🟡 Medium | Credibility verification |

See `FEATURE_VOID_AUDIT.md` for the full analysis.

---

## DRY CODE RULES

1. **One source of truth** — Design tokens in `tokens.css`, nowhere else
2. **Extract at 3** — If code appears 3x, extract to function/component
3. **Content ≠ Code** — Text lives in data files, not in JS
4. **No magic numbers** — All spacing/colors via CSS variables
5. **Flat > Nested** — Avoid deep nesting in CSS and JS
6. **Wiki pages auto-discovered** — Drop `.md` in a category dir; `buildWikiIndex()` handles the rest

---

## DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-26 | No frameworks | Site is simple enough. Frameworks add complexity. |
| 2025-12-26 | Keep vanilla JS | Content site doesn't need React. |
| 2025-12-26 | esbuild over webpack | 100x faster, zero config. |
| 2025-12-26 | Cloudflare Pages | Free, fast, already deployed. |
| 2026-03-01 | Filesystem-driven wiki nav | Eliminates wiki/index.json manual maintenance risk. |

---

*Last updated: 2026-03-01*
