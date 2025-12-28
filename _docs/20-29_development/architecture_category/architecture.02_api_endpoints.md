---
id: architecture.02
title: API Endpoint Schema
created: 2025-12-27T22:55:00-08:00
updated: 2025-12-27T22:55:00-08:00
links:
  - '[[architecture_category_index]]'
  - '[[architecture.01_site_architecture_overview]]'
related_work_efforts:
  - WE-251227-x7k9
---

# API Endpoint Schema

## Overview

Fogsift uses a static API layer generated at build time. All endpoints return JSON and are served from `/api/`.

## Base URL

```
Production: https://fogsift.com/api/
Development: http://localhost:5050/api/
```

---

## Endpoints

### GET /api/wiki/index.json

Full wiki structure with categories and pages.

**Response:**
```typescript
interface WikiIndex {
  title: string;
  description: string;
  buildDate: string;  // ISO 8601
  categories: Category[];
}

interface Category {
  id: string;         // "docs", "concepts", etc.
  title: string;      // "Documentation"
  icon: string;       // "book", "lightbulb", etc.
  pages: Page[];
}

interface Page {
  slug: string;       // "getting-started" or "concepts/root-cause"
  title: string;      // "Getting Started"
}
```

**Example Response:**
```json
{
  "title": "Fogsift Wiki",
  "description": "Knowledge base and documentation",
  "buildDate": "2025-12-27T22:55:00.000Z",
  "categories": [
    {
      "id": "docs",
      "title": "Documentation",
      "icon": "book",
      "pages": [
        { "slug": "getting-started", "title": "Getting Started" },
        { "slug": "how-we-work", "title": "How We Work" }
      ]
    }
  ]
}
```

---

### GET /api/wiki/sitemap.json

Pre-computed Johnny Decimal sitemap data.

**Response:**
```typescript
interface Sitemap {
  title: string;
  buildDate: string;
  categories: SitemapCategory[];
}

interface SitemapCategory {
  id: string;
  title: string;
  range: string;      // "10-19"
  rangeStart: number; // 10
  pages: SitemapPage[];
}

interface SitemapPage {
  slug: string;
  title: string;
  jdNumber: string;   // "10.01"
  href: string;       // Relative URL
}
```

**Example Response:**
```json
{
  "title": "Fogsift Wiki Sitemap",
  "buildDate": "2025-12-27T22:55:00.000Z",
  "categories": [
    {
      "id": "docs",
      "title": "Documentation",
      "range": "10-19",
      "rangeStart": 10,
      "pages": [
        {
          "slug": "getting-started",
          "title": "Getting Started",
          "jdNumber": "10.01",
          "href": "getting-started.html"
        }
      ]
    }
  ]
}
```

---

### GET /api/articles.json

Field notes and article content.

**Response:**
```typescript
interface ArticlesResponse {
  buildDate: string;
  articles: Article[];
}

interface Article {
  id: string;         // "001"
  title: string;
  date: string;       // "2025-12-01"
  sector: string;     // "SECTOR-7"
  body: string;       // Full content
}
```

---

### GET /api/meta.json

Site metadata for version checking and cache invalidation.

**Response:**
```typescript
interface SiteMeta {
  name: string;       // "Fogsift"
  version: string;    // "0.0.3"
  buildDate: string;  // ISO 8601
  buildTimestamp: number; // Unix timestamp for cache invalidation
}
```

**Example Response:**
```json
{
  "name": "Fogsift",
  "version": "0.0.3",
  "buildDate": "2025-12-27T22:55:00.000Z",
  "buildTimestamp": 1735365300000
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 404 | Endpoint not found (static file missing) |
| 500 | Server error (shouldn't happen with static files) |

Since these are static JSON files, errors typically mean the build failed or the file path is wrong.

---

## Client Usage

```javascript
// Using WikiAPI module (src/js/wiki-api.js)
const index = await WikiAPI.loadIndex();
const sitemap = await WikiAPI.loadSitemap();

// Direct fetch
const response = await fetch('/api/wiki/index.json');
const data = await response.json();
```

---

## Related

- [[architecture.01_site_architecture_overview]]
- Work Effort: WE-251227-x7k9 (API Architecture)
- Ticket: TKT-x7k9-001

