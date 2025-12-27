---
created: '2025-12-27T21:00:00Z'
id: architecture.02
links:
- '[[00.00_index]]'
- '[[architecture_category_index]]'
- '[[architecture.01_site_architecture_overview]]'
related_work_efforts: []
title: API & Data Flow Architecture
updated: '2025-12-27T21:00:00Z'
---

# API & Data Flow Architecture

This document provides a comprehensive overview of Fogsift's data architecture, API structure, and data transformation pipeline. It is intended to support integration with MCP-based monitoring systems and browser-based development tools.

## Architecture Pattern

**Pattern Type:** JAMstack (JavaScript, APIs, Markup)

Fogsift is a **static site with client-side module architecture** and **build-time content processing**. There is no traditional REST/GraphQL/tRPC API server. Instead, all "API" interactions are client-side data fetching from static JSON files served via CDN.

```
┌─────────────────────────────────────────────────────────────┐
│                        JAMstack                              │
├─────────────────────────────────────────────────────────────┤
│  J = JavaScript (client-side modules)                        │
│  A = APIs (static JSON files on CDN)                         │
│  M = Markup (pre-rendered HTML at build time)                │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints (Static JSON)

### Primary Data Sources

| Endpoint | Purpose | Location | Cache Strategy |
|----------|---------|----------|----------------|
| `/content/articles.json` | Field note articles | `src/content/articles.json` | In-memory (Modal.articles) |
| `/content/status.json` | MCP system status | `src/content/status.json` | Cache-busted (timestamp param) |
| `/wiki/index.json` | Wiki navigation | `src/wiki/index.json` | Build-time only |
| `/manifest.json` | PWA manifest | `src/manifest.json` | Browser cached |

### Data Structure: articles.json

```json
{
  "articles": [
    {
      "id": "unique-slug",
      "title": "Article Title",
      "date": "2025-01-15",
      "sector": "Category Name",
      "body": "Full article content..."
    }
  ]
}
```

### Data Structure: status.json

```json
{
  "servers": [
    { "name": "mcp-memory", "status": "online", "uptime": "99.9%" }
  ],
  "pipeline": [
    { "stage": "capture", "status": "active" }
  ],
  "activeWorkEffort": {
    "id": "WE-251227-xxxx",
    "title": "Current work effort title"
  },
  "lastUpdated": "2025-12-27T21:00:00Z"
}
```

### Data Structure: wiki/index.json

```json
{
  "categories": [
    {
      "id": "10",
      "title": "Getting Started",
      "description": "Introduction and guides",
      "pages": [
        { "id": "10.01", "title": "Quick Start", "slug": "getting-started" }
      ]
    }
  ]
}
```

## Data Flow Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT TIME                             │
│                                                                   │
│   Markdown Files ─────┐                                          │
│   JSON Content ───────┼───> BUILD SCRIPT ───> dist/              │
│   HTML Templates ─────┤      (scripts/build.js)                  │
│   CSS/JS Sources ─────┘                                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE PAGES CDN                         │
│                                                                   │
│   dist/index.html          dist/styles.css                       │
│   dist/app.js              dist/content/*.json                   │
│   dist/wiki/*.html         dist/assets/*                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER                                  │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  JavaScript Modules                       │   │
│   │                                                           │   │
│   │   Theme.js ◄── localStorage.theme                        │   │
│   │   Modal.js ◄── fetch('/content/articles.json')           │   │
│   │   Nav.js   ◄── DOM state                                  │   │
│   │   Toast.js ◄── In-memory queue                            │   │
│   │   Sleep.js ◄── State machine (idle detection)             │   │
│   │   Main.js  ◄── Orchestrator                               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                               │                                   │
│                               ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  DOM / UI Layer                           │   │
│   │                                                           │   │
│   │   Theme toggle, Article modals, Navigation drawer,        │   │
│   │   Toast notifications, Sleep mode animations              │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow: Article Modal

```
User Click → Modal.open(id)
                  │
                  ▼
        Modal.loadArticles()
                  │
        ┌─────────┴─────────┐
        │ Cache hit?        │
        │   YES → return    │
        │   NO  → fetch()   │
        └─────────┬─────────┘
                  │
                  ▼
        fetch('/content/articles.json')
                  │
                  ▼
        Transform: Array → Object (keyed by ID)
                  │
                  ▼
        Cache in Modal.articles
                  │
                  ▼
        Render article content to modal DOM
```

### Request Flow: Status Dashboard

```
Page Load → loadStatus()
                │
                ▼
    fetch('/content/status.json?' + Date.now())
                │              └── Cache bust
                ▼
    Parse JSON response
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
renderServers() renderPipeline() renderWorkEffort()
    │           │           │
    └───────────┴───────────┘
                │
                ▼
    Update DOM with status cards
```

## Data Transformations

### Build-Time Transformations

| Source | Process | Output |
|--------|---------|--------|
| `src/css/*.css` | Concatenate (order matters) + version inject | `dist/styles.css` |
| `src/js/*.js` | Concatenate (order matters) | `dist/app.js` |
| `src/index.html` | Template replacement `{{VERSION}}` | `dist/index.html` |
| `src/wiki/*.md` | Markdown → HTML via `marked()` | `dist/wiki/*.html` |
| `src/wiki/index.json` | Category cards + JD sitemap generation | `dist/wiki/index.html` |

**CSS Concatenation Order:**
1. `tokens.css` (design system variables)
2. `base.css` (reset, typography)
3. `components.css` (UI components)
4. `mobile.css` (responsive overrides)

**JS Concatenation Order:**
1. `toast.js` (notification system - no dependencies)
2. `theme.js` (theme toggle)
3. `modal.js` (article modal)
4. `nav.js` (navigation)
5. `sleep.js` (screensaver easter egg)
6. `main.js` (orchestrator - depends on all above)

### Runtime Transformations

| Module | Input | Transformation | Output |
|--------|-------|----------------|--------|
| Modal.js | JSON array | `array.forEach(a => obj[a.id] = a)` | Object keyed by ID |
| Theme.js | localStorage string | Parse → apply `data-theme` attr | CSS variable cascade |
| Toast.js | Message + type | Create DOM element | Auto-dismissing notification |
| SleepMode.js | Idle time detection | Animate DOM + canvas | Screensaver overlay |

## State Management

### Client-Side State Locations

| State | Storage | Persistence | Access Pattern |
|-------|---------|-------------|----------------|
| Theme preference | `localStorage.theme` | Cross-session | Sync read/write |
| Dashboard auth | `sessionStorage.mcp-auth` | Session only | Sync read/write |
| Article cache | `Modal.articles` object | Page lifetime | Async fetch, sync read |
| Sleep mode state | `SleepMode` properties | Page lifetime | State machine |
| Nav drawer state | DOM class `.open` | Page lifetime | Class toggle |
| Clock display | DOM innerHTML | Real-time | setInterval update |

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENT STATE                          │
│                                                               │
│   localStorage                    sessionStorage              │
│   ├── theme: "light" | "dark"    └── mcp-auth: "true"        │
│   └── (future: preferences)                                   │
└─────────────────────────────────────────────────────────────┘
                    ▲                     ▲
                    │ read/write          │ read/write
                    ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    RUNTIME STATE                             │
│                                                               │
│   Theme.get()              Modal.articles = {}               │
│   Theme.set(value)         SleepMode.isSleeping              │
│   Theme.toggle()           SleepMode.isWaking                │
│                            Nav.mobileDrawer.classList        │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ DOM mutations
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOM STATE                                 │
│                                                               │
│   <html data-theme="dark">                                   │
│   <nav class="open">                                         │
│   <div class="modal active">                                 │
│   <div class="toast-container">...</div>                     │
└─────────────────────────────────────────────────────────────┘
```

## Module Public API

### Global Window Objects

```javascript
window.App       // Main app singleton
window.Theme     // Theme toggle interface
window.Toast     // Toast notification system
window.Modal     // Article modal system
window.Nav       // Navigation module
window.SleepMode // Easter egg screensaver
```

### Theme Module API

```javascript
Theme.init()           // Initialize on page load
Theme.get()            // Returns: "light" | "dark"
Theme.set(theme)       // Set theme programmatically
Theme.toggle()         // Toggle between light/dark
```

### Toast Module API

```javascript
Toast.show(message)    // Success notification (green)
Toast.error(message)   // Error notification (red, copy button)
Toast.info(message)    // Info notification (blue)
```

### Modal Module API

```javascript
Modal.init()           // Setup modal event listeners
Modal.open(id)         // Open article by ID
Modal.close()          // Close modal
Modal.loadArticles()   // Preload/cache articles (returns Promise)
```

### Navigation Module API

```javascript
Nav.init()             // Setup navigation listeners
Nav.toggleMobile()     // Toggle mobile drawer
```

## Security Architecture

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self';  ← Only same-origin fetch allowed
```

### XSS Prevention

| Risk | Mitigation | Location |
|------|------------|----------|
| Article content injection | `textContent` not `innerHTML` | modal.js:75 |
| DOM creation | `document.createElement()` | All modules |
| Template injection | String replacement only | build.js |

### Authentication (Dashboard Only)

**Method:** Session-based (client-side only - development use)

```javascript
// src/system-status.html
const CORRECT_PASSWORD = 'courtneyishot';

function authenticate() {
    if (input.value === CORRECT_PASSWORD) {
        sessionStorage.setItem('mcp-auth', 'true');
        showDashboard();
    }
}
```

**Note:** This is NOT production-grade authentication. It is intended for internal/development dashboards only.

## Integration Points for MCP

### Status Dashboard Integration

The `/content/status.json` file is designed for MCP work effort monitoring:

```json
{
  "servers": [],           // MCP server status
  "pipeline": [],          // Work effort pipeline stages
  "activeWorkEffort": {},  // Currently active work effort
  "lastUpdated": ""        // ISO timestamp
}
```

**Update Pattern:**
1. MCP system writes to `src/content/status.json`
2. Build process copies to `dist/content/status.json`
3. Dashboard fetches with cache-busting parameter
4. Real-time updates via periodic polling (setInterval)

### Adding New Data Endpoints

To add a new JSON data source:

1. Create file at `src/content/[name].json`
2. Add to build.js copy list
3. Create client-side fetch module
4. Add to CSP if external sources needed

### Event Hooks for Monitoring

Consider adding event dispatching for MCP integration:

```javascript
// Example integration pattern
window.dispatchEvent(new CustomEvent('fogsift:article-opened', {
    detail: { articleId: id, timestamp: Date.now() }
}));

window.dispatchEvent(new CustomEvent('fogsift:theme-changed', {
    detail: { theme: Theme.get() }
}));
```

## Performance Characteristics

### Bundle Sizes (Unminified)

| File | Current Size | Target |
|------|--------------|--------|
| index.html | ~15KB | <10KB |
| styles.css | ~8KB | <5KB |
| app.js | ~10KB | <5KB |
| **Total** | **~33KB** | **<20KB** |

### Load Sequence

```
1. GET /index.html (13KB)
   ├── Parse HTML
   ├── Load styles.css (8KB) [parallel]
   ├── Load app.js (10KB) [parallel]
   └── Execute on DOMContentLoaded:
       ├── Theme.init() - 1ms (localStorage read)
       ├── Nav.init() - 1ms (DOM setup)
       ├── Modal.init() + preload - 2ms (fetch)
       ├── SleepMode.init() - 1ms (timer start)
       └── App.initClock() - 1ms (setInterval)

2. User opens article modal:
   └── Modal.open(id) - 1ms (in-memory lookup)

3. Status dashboard refresh:
   └── fetch() + render - network latency + 5ms
```

## File Reference Map

### Core Data Files
- `src/content/articles.json` - Article data source
- `src/content/status.json` - Dashboard status
- `src/wiki/index.json` - Wiki navigation

### Build System
- `scripts/build.js` - Main build orchestration
- `scripts/deploy.js` - Deployment pipeline
- `scripts/version.js` - Version management

### Client Modules
- `src/js/modal.js` - Article modal + fetch
- `src/js/theme.js` - Theme toggle
- `src/js/toast.js` - Notifications
- `src/js/nav.js` - Navigation
- `src/js/sleep.js` - Screensaver
- `src/js/main.js` - Orchestrator

### Configuration
- `src/_headers` - Cloudflare security headers
- `src/manifest.json` - PWA manifest

## Summary

| Aspect | Implementation |
|--------|----------------|
| **Architecture** | JAMstack - static site with client-side JS |
| **Server** | None - 100% static on Cloudflare Pages |
| **API Pattern** | Static JSON endpoints (REST-like) |
| **Data Flow** | Unidirectional: Build → CDN → Browser → DOM |
| **State** | localStorage + sessionStorage + in-memory |
| **Framework** | Vanilla JS with module pattern |
| **External APIs** | Google Fonts only |
| **Database** | None - content is static JSON |
| **Build Tool** | Custom Node.js script |
| **Deployment** | Cloudflare Pages via wrangler |

## Related Documents

- [[architecture.01_site_architecture_overview|Site Architecture Overview]]
- [[architecture.01_build_system_documentation|Build System Documentation]]
- [[javascript.01_javascript_modules|JavaScript Modules]]
- [[css.01_css_architecture|CSS Architecture]]
