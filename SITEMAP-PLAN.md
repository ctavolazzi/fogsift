# FogSift Site Architecture Plan

## Current State Analysis

### Problems Identified
1. **Duplicate content** - `about.html`, `process.html`, `pricing.html` all duplicate homepage sections
2. **Orphan pages** - `faq.html` exists but not in navigation
3. **Inconsistent voice** - `process.html` uses "he" instead of "we"
4. **Navigation mismatch** - Nav doesn't reflect actual site structure
5. **Unclear page purposes** - `hi.html` has no clear role

### Current Navigation
```
WIKI | PORTFOLIO | QUEUE | PRICING | CONTACT
```

### Current Pages (18 total)
- **Public pages**: index, about, contact, faq, portfolio, pricing, process, queue
- **Legal pages**: disclaimer, privacy, terms
- **Utility pages**: 404, hi, system-status
- **Demo pages**: ferrofluid-demo, lava-demo
- **Templates**: wiki-template, wiki-index-template

---

## Proposed Architecture

### Design Principles
1. **Single source of truth** - No duplicate content between homepage and subpages
2. **Clear user journeys** - Every page has a purpose in the conversion funnel
3. **Uniform navigation** - One nav component, consistent across all pages
4. **Progressive disclosure** - Homepage = overview, subpages = depth

### Primary Navigation (5 items max)
```
OFFERS | QUEUE | WIKI | PORTFOLIO | CONTACT (CTA)
```

### Site Map

```
fogsift.com/
├── index.html          [HOME] - Landing page, all key info at a glance
│
├── offers.html         [OFFERS] - What you can buy (was pricing.html)
│   ├── Field Guide PDF ($5)
│   ├── Queue Response ($20)
│   ├── Deep Dive ($500)
│   └── Custom Engagement (by quote)
│
├── queue.html          [QUEUE] - Submit to queue + see current queue
│   ├── How it works (expanded)
│   ├── What to include
│   ├── Submission form/link
│   └── Current queue status (if public)
│
├── wiki/               [WIKI] - Knowledge base (existing, good structure)
│   ├── index.html      - Wiki home
│   ├── getting-started.html
│   ├── concepts/       - Mental models, systems thinking, etc.
│   ├── frameworks/     - Trace protocol, decision matrix, etc.
│   ├── tools/          - Five whys, fishbone, etc.
│   ├── field-notes/    - Blog-style articles
│   └── case-studies/   - Example problems solved
│
├── portfolio.html      [PORTFOLIO] - Past work, YouTube builds
│
├── contact.html        [CONTACT] - How to reach us
│
├── faq.html            [FAQ] - Link from footer, not main nav
│
├── legal/              [LEGAL] - Footer links only
│   ├── terms.html
│   ├── privacy.html
│   └── disclaimer.html
│
└── utility/            [HIDDEN] - Not in nav or footer
    ├── 404.html
    ├── system-status.html
    ├── ferrofluid-demo.html
    └── lava-demo.html
```

### Pages to DELETE or MERGE
| Page | Action | Reason |
|------|--------|--------|
| `about.html` | DELETE | Duplicates homepage "Who is FogSift" section |
| `process.html` | DELETE | Duplicates homepage "How it Works" section |
| `hi.html` | DELETE | No clear purpose |
| `pricing.html` | RENAME | Becomes `offers.html` |

### Homepage Sections (Minimal)
The homepage should be a **landing page**, not a mini-site. Keep it focused:

1. **HERO** - Clear value prop + primary CTA
2. **HOW IT WORKS** - 3-5 step visual process
3. **SOCIAL PROOF** - Testimonials ticker
4. **OFFERS PREVIEW** - 3 tiers with "See all offers" link
5. **FINAL CTA** - Join the queue

Move detailed content to subpages:
- Examples → Queue page
- Portfolio preview → Portfolio page
- Watch it happen → Portfolio page
- Common concerns → FAQ page

---

## Implementation Plan

### Phase 1: Navigation Update
1. Rename `pricing.html` → `offers.html`
2. Update `NAV_LINKS` in `build.js`:
   ```javascript
   const NAV_LINKS = [
       { href: 'offers.html', label: 'OFFERS' },
       { href: 'queue.html', label: 'QUEUE' },
       { href: 'wiki/index.html', label: 'WIKI' },
       { href: 'portfolio.html', label: 'PORTFOLIO' },
       { href: 'contact.html', label: 'CONTACT', cta: true },
   ];
   ```

### Phase 2: Delete Redundant Pages
1. Delete `about.html`
2. Delete `process.html`
3. Delete `hi.html`
4. Update sitemap.xml

### Phase 3: Enhance Key Pages
1. **Queue page** - Add examples section, expand how-it-works
2. **Offers page** - Clean pricing menu, clear CTAs
3. **FAQ page** - Consolidate all common concerns

### Phase 4: Simplify Homepage
1. Remove duplicate content
2. Add "Learn more" links to subpages
3. Keep it as a conversion-focused landing page

---

## Navigation Component Spec

### Requirements
- Same HTML structure on every page
- Path-aware (highlights current page)
- Mobile responsive (hamburger menu)
- Single source of truth in `build.js`

### Current Implementation (Good)
The `generateNavHeader()` function in `build.js` already handles this correctly.
Just need to update `NAV_LINKS` array.

---

## Priority Order

1. **HIGH** - Rename pricing → offers, update nav
2. **HIGH** - Delete redundant pages (about, process, hi)
3. **MEDIUM** - Enhance Queue page with more content
4. **MEDIUM** - Enhance Offers page design
5. **LOW** - Simplify homepage (careful - it works well now)

---

## Questions for Owner

1. Should FAQ be in main nav or just footer?
2. Any pages to add? (e.g., testimonials page, case studies page)
3. Queue page - show live queue status or keep private?
4. Legal pages - keep at root or move to `/legal/` folder?
