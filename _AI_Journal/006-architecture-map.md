# Journal Entry 006: Architecture Map

**Date:** 2026-02-08
**Author:** Claude (AI Development Partner)
**Context:** Comprehensive build system and template architecture reference

---

## Build Pipeline

**Entry:** `node scripts/build.js` (1,291 lines)
**Output:** `dist/` directory

```
build()
  1. Ensure dist/ exists
  2. CSS Bundle (19 files -> dist/styles.css, minified via esbuild)
  3. JS Bundle (18 files -> dist/app.js, minified ES2020 via esbuild)
  4. HTML Templates (16 pages via processHtml/processSimpleHtml)
  5. Static Assets (16 items + dynamic portfolio images)
  6. Wiki Build (44 markdown -> 44 HTML via marked)
  7. Queue Pages (queue.json -> individual HTML per item)
  8. API Generation (4 JSON endpoints)
  9. Search Index (MUST BE LAST - indexes all built HTML)
```

## Template System

All pages use `{{PLACEHOLDER}}` regex replacement. Key generators:

| Generator | Purpose |
|-----------|---------|
| `generateThemeInitScript(prefix)` | CSP-compliant external theme script tag |
| `generateNavHeader(page, prefix)` | Full nav with mobile drawer, search, theme picker |
| `generateFooter(prefix, options)` | Footer with links, version, optional clock |

### Global Placeholders (every page)

- `{{THEME_INIT}}` - Theme init script tag
- `{{NAV_HEADER}}` - Navigation HTML
- `{{FOOTER}}` - Footer HTML
- `{{VERSION}}` - From package.json

### Wiki-Specific Placeholders

`{{PAGE_TITLE}}`, `{{PAGE_DESCRIPTION}}`, `{{PAGE_SLUG}}`, `{{BREADCRUMB}}`, `{{WIKI_NAV}}`, `{{CONTENT}}`, `{{JD_SITEMAP}}`, `{{BUILD_DATE}}`, plus depth-aware path placeholders (`{{ROOT_PATH}}`, `{{STYLES_PATH}}`, `{{APP_PATH}}`, etc.)

### Queue-Specific Placeholders

`{{ITEM_ID}}`, `{{PROBLEM_SUMMARY}}`, `{{STATUS_CLASS}}`, `{{STATUS_TEXT}}`, `{{DISPLAY_NAME}}`, `{{SUBMITTED_DATE}}`, `{{CATEGORY}}`, `{{POSITION_HTML}}`, `{{OUTCOME_SECTION}}`, `{{WORK_LOG_SECTION}}`, `{{PENDING_SECTION}}`, `{{PRIVACY_NOTICE}}`

## Output Structure

```
dist/
  index.html, 404.html, about.html, ... (16 main pages)
  styles.css (175KB minified), app.js (62KB minified)
  theme-init.js, queue-ui.js (external scripts)
  search-index.json (292KB, 56 pages indexed)
  wiki/ (44 compiled pages in category subdirs)
  queue/ (individual item pages)
  api/ (meta.json, articles.json, wiki/index.json, wiki/sitemap.json)
  assets/, images/, .well-known/
```

## Key Dependencies

- `marked` (^15.0.4) - Markdown to HTML
- `esbuild` (^0.27.2) - CSS/JS minification

## Key Rules

- CSS file order matters (tokens -> base -> components -> themes -> mobile LAST)
- JS file order matters (utilities -> features -> main.js LAST)
- Wiki cards on homepage rotate deterministically by `dayOfYear % bucketLength`
- Search index must build after all HTML (it reads from dist/)
- `theme-init.js` copied as-is (external for CSP compliance, runs in `<head>` blocking)
