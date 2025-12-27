---
created: '2025-12-27T02:25:21Z'
id: guides.01
links:
- '[[00.00_index]]'
- '[[guides_category_index]]'
related_work_efforts: []
title: Quickstart Guide
updated: '2025-12-27T02:25:21Z'
---

# Fogsift Quickstart Guide

## Prerequisites

- Node.js (any recent version)
- Git
- Text editor (VS Code recommended)

## First Time Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/fogsift.git
cd fogsift

# Build the project
npm run build

# Start local server
npm run dev
```

Visit `http://localhost:5050` to see the site.

## Project Structure (Quick Reference)

```
fogsift/
├── src/           # Edit these files
│   ├── css/       # Stylesheets
│   ├── js/        # JavaScript modules
│   └── index.html # HTML template
├── dist/          # Built files (don't edit)
├── scripts/       # Build tools
└── _docs/         # Documentation
```

## Common Tasks

### Make a Style Change

1. Edit `src/css/components.css` (or appropriate file)
2. Run `npm run build`
3. Refresh browser

### Add a New Component

1. Add HTML to `src/index.html`
2. Add styles to `src/css/components.css`
3. Run `npm run build`

### Change Theme Colors

1. Edit `src/css/tokens.css`
2. Update both `:root` and `[data-theme="dark"]` sections
3. Run `npm run build`

### Add JavaScript Functionality

1. Create/edit file in `src/js/`
2. Add to `JS_FILES` array in `scripts/build.js`
3. Run `npm run build`

### Release a New Version

```bash
# For bug fixes or new components
npm run version:patch

# For new pages or features
npm run version:minor

# Push to remote
git push && git push --tags

# Deploy
npm run deploy
```

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build src → dist |
| `npm run dev` | Start local server (port 5050) |
| `npm run preview` | Build + start server |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run version:patch` | Bump patch version |
| `npm run version:minor` | Bump minor version |
| `npm run version:major` | Bump major version |

## File Edit → Build → Preview Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: After making changes
npm run build

# Browser: Refresh to see changes
```

## Getting Help

- Architecture: See [[21.00_site-architecture-overview|Architecture Overview]]
- CSS: See [[31.01_css-architecture|CSS Architecture]]
- JavaScript: See [[31.02_javascript-modules|JavaScript Modules]]
- Components: See [[31.03_ui-component-reference|Component Reference]]
- Versioning: See [[11.01_version-management|Version Management]]