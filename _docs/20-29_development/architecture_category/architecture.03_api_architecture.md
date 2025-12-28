---
id: architecture.03
title: API Architecture Overview
created: 2025-12-27T23:00:00-08:00
updated: 2025-12-27T23:00:00-08:00
links:
  - '[[architecture_category_index]]'
  - '[[architecture.01_site_architecture_overview]]'
  - '[[architecture.02_api_endpoints]]'
related_work_efforts:
  - WE-251227-x7k9
---

# API Architecture Overview

## Introduction

Fogsift uses a **build-time API** architecture. JSON endpoints are generated during the build process and served as static files. This provides:

- **Zero runtime dependencies** - No server-side processing needed
- **Fast responses** - Static files served via CDN
- **Easy caching** - Standard HTTP caching + client-side localStorage
- **Predictable data** - Single source of truth at build time

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD TIME                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   src/wiki/index.json ─────┬───→ dist/api/wiki/index.json       │
│                            │                                     │
│   JD_RANGES config ────────┼───→ dist/api/wiki/sitemap.json     │
│                            │                                     │
│   src/content/articles.json┼───→ dist/api/articles.json         │
│                            │                                     │
│   package.json version ────┴───→ dist/api/meta.json             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       RUNTIME (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Page Load                                                      │
│      │                                                           │
│      ↓                                                           │
│   WikiAPI.loadSitemap() ──→ Cache.get() ──→ hit? ──→ return     │
│      │                          │                                │
│      │                          ↓ miss                           │
│      │                     fetch('/api/...')                     │
│      │                          │                                │
│      │                          ↓                                │
│      │                     Cache.set()                           │
│      │                          │                                │
│      ↓                          ↓                                │
│   Render Component ←─────── JSON Data                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Build Script (`scripts/build.js`)

Generates API JSON files during `npm run build`:

```javascript
// In build() function:
console.log('\n🔌 API:');
const apiFiles = buildAPI();
console.log(`  ✓ Generated ${apiFiles} API endpoints`);
```

The `buildAPI()` function:
1. Reads source data (wiki index, articles)
2. Transforms data (adds JD numbers, build timestamps)
3. Writes to `dist/api/` directory

### 2. Debug Module (`src/js/debug.js`)

Toggleable logging for development:

```javascript
// Enable in browser console:
Debug.enable();

// Logs appear for all API calls, cache hits, etc.
Debug.api('/api/wiki/sitemap.json', 200, 45);
// Output: [FOGSIFT] [API] /api/wiki/sitemap.json 200 (45ms)
```

### 3. Cache Module (`src/js/cache.js`)

localStorage wrapper with TTL:

```javascript
// Auto-used by WikiAPI:
Cache.get('/wiki/sitemap.json');  // Returns cached data or null
Cache.set('/wiki/sitemap.json', data);  // Stores with timestamp
Cache.clear();  // Clears all Fogsift cache entries
```

Features:
- 1-hour default TTL
- Automatic invalidation on deploy (buildTimestamp check)
- Graceful degradation if localStorage unavailable

### 4. WikiAPI Module (`src/js/wiki-api.js`)

Client interface for API:

```javascript
// Load wiki structure:
const index = await WikiAPI.loadIndex();

// Load JD sitemap data:
const sitemap = await WikiAPI.loadSitemap();

// Load field notes:
const articles = await WikiAPI.loadArticles();

// Load site metadata:
const meta = await WikiAPI.loadMeta();
```

---

## API Endpoints

| Endpoint | Source | Description |
|----------|--------|-------------|
| `/api/wiki/index.json` | `src/wiki/index.json` | Full wiki structure |
| `/api/wiki/sitemap.json` | Computed from index | JD-numbered sitemap |
| `/api/articles.json` | `src/content/articles.json` | Field notes |
| `/api/meta.json` | `package.json` | Version, build date |

See [[architecture.02_api_endpoints]] for full schema documentation.

---

## Adding New Endpoints

1. **Add source data** in `src/content/` or appropriate location
2. **Update `buildAPI()`** in `scripts/build.js`:
   ```javascript
   // In buildAPI() function:
   if (fs.existsSync(newDataPath)) {
       const data = JSON.parse(fs.readFileSync(newDataPath, 'utf8'));
       fs.writeFileSync(
           path.join(apiDir, 'new-endpoint.json'),
           JSON.stringify({ buildDate, ...data }, null, 2)
       );
       filesCreated++;
   }
   ```
3. **Add method to WikiAPI**:
   ```javascript
   async loadNewData() {
       return this._fetch('/new-endpoint.json');
   }
   ```
4. **Document in** [[architecture.02_api_endpoints]]

---

## Caching Strategy

### Client-Side (localStorage)

```
┌───────────────────────────────────────────┐
│ localStorage                              │
├───────────────────────────────────────────┤
│ fogsift_build: "1735365300000"            │
│ fogsift_/wiki/index.json: {               │
│   data: {...},                            │
│   timestamp: 1735365300000,               │
│   buildTimestamp: 1735365300000           │
│ }                                         │
└───────────────────────────────────────────┘
```

- **TTL**: 1 hour (configurable via `Cache.ttl`)
- **Invalidation**: Automatic on new deploy
- **Manual clear**: `Cache.clear()` in console

### Server-Side (CDN)

Static files benefit from:
- Browser caching headers
- CDN edge caching
- Conditional requests (ETag/Last-Modified)

---

## Debug Logging

Enable debug mode to see all API activity:

```javascript
Debug.enable();

// Now all API calls, cache hits/misses, etc. are logged:
// [FOGSIFT] [Cache] hit: /wiki/sitemap.json
// [FOGSIFT] [API] /api/wiki/sitemap.json 200 (12ms)
// [FOGSIFT] [JDSitemap] rendered
```

Disable with `Debug.disable()`.

---

## Related Documents

- [[architecture.01_site_architecture_overview]] - Overall site structure
- [[architecture.02_api_endpoints]] - Endpoint schemas
- Work Effort: WE-251227-x7k9 (API Architecture)

