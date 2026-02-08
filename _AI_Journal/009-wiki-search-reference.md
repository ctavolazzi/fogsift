# Journal Entry 009: Wiki & Search System Reference

**Date:** 2026-02-08
**Author:** Claude (AI Development Partner)
**Context:** Wiki compilation pipeline and search index architecture

---

## Wiki System

### Source Structure

`src/wiki/` contains 44 markdown files in 6 categories:

| Category | Pages | Topic |
|----------|-------|-------|
| Documentation | 4 | Getting started, how-we-work, diagnostic-process, FAQ |
| Concepts | 10 | Root cause, mental models, systems thinking, cognitive biases, etc. |
| Frameworks | 7 | TRACE protocol, decision matrix, SWOT, risk assessment, etc. |
| Field Notes | 10 | Numbered 001-010, anonymized observations with metadata |
| Case Studies | 5 | Manufacturing, communication, data migration, startup pivot |
| Tools | 7 | Five whys, fishbone, Pareto, process mapping, etc. |

### Key Facts

- **No YAML frontmatter** - metadata embedded in markdown body
- **Title extraction:** First `# Heading` line
- **Description extraction:** First paragraph after title (max 160 chars)
- **Category metadata:** `src/wiki/index.json` drives navigation and builds
- **Compiler:** `marked` with `gfm: true, breaks: false, headerIds: true, mangle: false`

### Compilation Pipeline

```
For each .md in src/wiki/:
  1. Read markdown
  2. marked() -> HTML
  3. extractTitle(), extractDescription()
  4. Calculate depth from slug (concepts/root-cause = depth 1)
  5. Generate relative paths (../../../) based on depth
  6. Generate wiki sidebar nav (active state detection)
  7. Generate breadcrumb, JD sitemap
  8. Replace all {{PLACEHOLDERS}} in wiki-template.html
  9. Write to dist/wiki/[slug].html
```

### Johnny Decimal Ranges

| Range | Category |
|-------|----------|
| 10-19 | Documentation |
| 20-29 | Concepts |
| 30-39 | Frameworks |
| 40-49 | Field Notes |
| 50-59 | Case Studies |
| 60-69 | Tools |

## Search System

### Index Schema (`dist/search-index.json`, 292KB, 56 entries)

```json
{
  "url": "wiki/concepts/root-cause.html",
  "title": "Root Cause Analysis",
  "description": "First paragraph excerpt",
  "headings": ["H1", "H2", ...],
  "content": "First 500 chars of main text",
  "category": "Wiki"
}
```

**Indexed:** 12 main pages + 44 wiki pages = 56 total.
**Not indexed:** Queue item pages, 404, API endpoints.

### Build Process

1. Hardcoded list of 12 main pages (index, about, offers, queue, faq, portfolio, contact, vision, terms, privacy, disclaimer, your-data)
2. Recursive walk of `dist/wiki/` for all .html files
3. Extract: `<title>`, `<meta description>`, headings from `<main>`, first 500 chars of text content
4. Write as flat JSON array to `dist/search-index.json`
5. **Must run after all HTML is compiled** (last build step)

### Client Search Algorithm (SiteSearch.js)

**Phase 1 - Current Page:**
- Scans DOM for `section`, `.process-step`, `.pricing-card`, `details`, `.about-card`
- Scores: heading match = 10 points, text match = 1 point
- Shows top 5 results under "ON THIS PAGE"

**Phase 2 - Site-Wide:**
- Lazy-loads `search-index.json` on first search
- Scores: title = 10, description = 5, headings = 3, content = 1
- Current page score multiplied by 0.3 (deprioritized)
- Results grouped under "ALL PAGES"

**Keyboard:** `/` or `Cmd+K` to open, `Escape` to close, `ArrowDown`/`ArrowUp` to navigate results.
