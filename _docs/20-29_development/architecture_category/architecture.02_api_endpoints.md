---
id: architecture.02
title: API Endpoint Schema
created: 2025-12-27T22:55:00-08:00
updated: 2026-03-01T11:32:00-08:00
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

### GET /api/empirica/cognitive-tests.json

Empirica cognitive diagnostics and workflow-engine visualization payload.

**Response:**
```typescript
interface EmpiricaCognitiveReport {
  generatedAt: string | null;
  project: string;
  projectPath: string;
  status: 'healthy' | 'degraded' | 'uninitialized' | 'error';
  summary: {
    total: number;
    pass: number;
    fail: number;
    warn: number;
  };
  tests: CognitiveTest[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  oracleRecommendation: string;
}

interface CognitiveTest {
  name: string;
  command: string;
  status: 'pass' | 'fail' | 'warn';
  detail: string;
}

interface GraphNode {
  id: string;
  type: string; // Maps to workflow-engine node type
  label: string;
  status: 'pass' | 'fail' | 'warn';
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
}
```

**Generation flow:**
```bash
npm run test:empirica:cognitive
node scripts/build.js
```

---

### GET /api/realms/topology.json

Realm/room topology payload for workflow-engine interop on localhost `:5050`.

**Response:**
```typescript
interface RealmTopology {
  title: string;
  description: string;
  version: string;
  nodes: RealmNode[];
  edges: RealmEdge[];
  buildDate: string;
  buildTimestamp: number;
}

interface RealmNode {
  id: string;
  type: string; // Prefer existing workflow-engine node types
  label: string;
  port?: number;
  x: number;
  y: number;
}

interface RealmEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
```

**Example Response:**
```json
{
  "title": "Realm Topology",
  "description": "Interop topology for localhost:5050 control plane and external realm systems.",
  "version": "1.0.0",
  "nodes": [
    { "id": "control_5050", "type": "trigger", "label": "Control Plane :5050", "port": 5050, "x": 80, "y": 40 },
    { "id": "agentchattr_8300", "type": "agent", "label": "AgentChattr :8300", "port": 8300, "x": -180, "y": 260 }
  ],
  "edges": [
    { "id": "re1", "source": "control_5050", "target": "agentchattr_8300", "label": "dispatch" }
  ],
  "buildDate": "2026-03-01T18:48:00.000Z",
  "buildTimestamp": 1772390880000
}
```

**Generation flow:**
```bash
node scripts/build.js
```

---

### GET /api/apps/index.json

App registry index used by CivicOS to discover development surfaces and manifest locations.

**Response:**
```typescript
interface AppsRegistry {
  title: string;
  description: string;
  version: string;
  apps: RegistryApp[];
  buildDate: string;
  buildTimestamp: number;
}

interface RegistryApp {
  id: string;
  label: string;
  manifest: string; // /api/apps/<id>.json
  category: string;
}
```

**Example Response:**
```json
{
  "title": "CivicOS App Registry",
  "description": "Registry of development surfaces exposed through localhost:5050.",
  "version": "1.0.0",
  "apps": [
    {
      "id": "workflow-engine",
      "label": "Workflow Engine",
      "manifest": "/api/apps/workflow-engine.json",
      "category": "execution"
    }
  ],
  "buildDate": "2026-03-01T19:20:00.000Z",
  "buildTimestamp": 1772392800000
}
```

---

### GET /api/apps/<id>.json

App manifest contract for each CivicOS-visible development surface.

**Response:**
```typescript
interface AppManifest {
  id: string;
  label: string;
  description: string;
  icon: string;
  entrypoint: string;
  actions: ManifestAction[];
  checks: ManifestCheck[];
  buildDate: string;
  buildTimestamp: number;
}

interface ManifestAction {
  id: string;
  label: string;
  href: string;
  method: 'GET' | 'POST';
}

interface ManifestCheck {
  id: string;
  label: string;
  endpoint: string;
  expectedStatus: number;
}
```

**Generation flow:**
```bash
node scripts/build.js
```

Source files:
- `src/content/apps/index.json`
- `src/content/apps/*.json`

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

