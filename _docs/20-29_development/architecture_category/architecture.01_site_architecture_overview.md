---
created: '2025-12-27T02:23:33Z'
id: architecture.01
links:
- '[[00.00_index]]'
- '[[architecture_category_index]]'
related_work_efforts: []
title: Site Architecture Overview
updated: '2025-12-27T02:23:33Z'
---

# Fogsift Site Architecture Overview

## System Summary

Fogsift is a static single-page application (SPA) built with vanilla HTML5, CSS3, and JavaScript. No frameworks or build-time dependencies are required beyond Node.js for the build script.

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Markup | HTML5 | Semantic structure |
| Styling | CSS3 + Custom Properties | Theming, responsive design |
| Logic | Vanilla JavaScript | Interactivity, state management |
| Build | Node.js | Asset bundling, templating |
| Hosting | Cloudflare Pages | Static deployment |

## Directory Structure

```
fogsift/
├── src/                    # Source files (development)
│   ├── css/
│   │   ├── tokens.css      # Design system variables
│   │   ├── base.css        # Reset, typography, layout
│   │   └── components.css  # UI component styles
│   ├── js/
│   │   ├── toast.js        # Notification system
│   │   ├── theme.js        # Light/dark mode
│   │   ├── modal.js        # Article modal
│   │   ├── nav.js          # Navigation + breadcrumbs
│   │   └── main.js         # App initialization
│   ├── content/
│   │   └── articles.json   # Field notes data
│   ├── index.html          # HTML template
│   ├── 404.html            # Error page
│   ├── robots.txt          # Bot control
│   ├── sitemap.xml         # SEO sitemap
│   ├── favicon.png         # Site icon
│   └── og-image.png        # Social share image
├── dist/                   # Production output (built)
├── scripts/
│   ├── build.js            # Build script
│   └── version.js          # Version management
├── _docs/                  # Documentation (this folder)
├── _work_efforts_/         # Task tracking
├── CHANGELOG.md            # Release history
├── version.json            # Version state
└── package.json            # Project config
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    BUILD PROCESS                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   src/css/*.css ──┬──> dist/styles.css                 │
│                   │                                     │
│   src/js/*.js ────┼──> dist/app.js                     │
│                   │                                     │
│   src/index.html ─┼──> dist/index.html (processed)     │
│                   │                                     │
│   src/*.png ──────┴──> dist/*.png (copied)             │
│   src/*.txt            dist/*.txt                       │
│   src/*.xml            dist/*.xml                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. No Framework
- Zero runtime dependencies
- Fast initial load (~25KB CSS, ~10KB JS)
- No build complexity
- Easy to maintain long-term

### 2. CSS Custom Properties
- Single source of truth for design tokens
- Runtime theme switching without reload
- Semantic variable naming

### 3. Modular JavaScript
- Each module has single responsibility
- Global objects for inter-module communication
- No module bundler required (script concatenation)

### 4. Progressive Enhancement
- Works without JavaScript (basic content)
- Enhanced experience with JS enabled
- Print styles for offline access

## Related Documents

- [[21.01_build-system|Build System Documentation]]
- [[31.01_css-architecture|CSS Architecture]]
- [[31.02_javascript-modules|JavaScript Modules]]