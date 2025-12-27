---
created: '2025-12-27T02:23:46Z'
id: architecture.01
links:
- '[[00.00_index]]'
- '[[architecture_category_index]]'
related_work_efforts: []
title: Build System Documentation
updated: '2025-12-27T02:23:46Z'
---

# Build System Documentation

## Overview

The Fogsift build system is a single Node.js script (`scripts/build.js`) that:
1. Concatenates CSS files into `dist/styles.css`
2. Concatenates JS files into `dist/app.js`
3. Processes the HTML template with version injection
4. Copies static assets to `dist/`

## Running the Build

```bash
# Build only
npm run build

# Build and preview locally
npm run preview

# Build and deploy to Cloudflare
npm run deploy
```

## Build Script Internals

### File Processing Order

**CSS Files** (order matters for cascade):
```javascript
const CSS_FILES = [
    'src/css/tokens.css',      // Design tokens first
    'src/css/base.css',        // Reset and typography
    'src/css/components.css',  // UI components
];
```

**JavaScript Files** (order matters for dependencies):
```javascript
const JS_FILES = [
    'src/js/toast.js',   // No dependencies
    'src/js/theme.js',   // Depends on Toast
    'src/js/modal.js',   // Depends on Toast
    'src/js/nav.js',     // No dependencies
    'src/js/main.js',    // Depends on all above
];
```

### Template Processing

The HTML template (`src/index.html`) supports placeholders:

| Placeholder | Replaced With |
|-------------|---------------|
| `{{VERSION}}` | Current version from package.json |

### Static Assets

These files are copied as-is from `src/` to `dist/`:
- `404.html` - Custom error page
- `robots.txt` - Bot access control
- `sitemap.xml` - Search engine map
- `favicon.png` - Site icon (64x64)
- `og-image.png` - Social share image (1200x630)

## Build Output

```
dist/
├── index.html     # Processed HTML (~22KB)
├── styles.css     # Bundled CSS (~25KB)
├── app.js         # Bundled JS (~10KB)
├── 404.html       # Error page
├── robots.txt     # Bot control
├── sitemap.xml    # SEO sitemap
├── favicon.png    # Site icon
└── og-image.png   # Social image
```

## Adding New Files

### Adding a CSS File

1. Create file in `src/css/`
2. Add to `CSS_FILES` array in `build.js`
3. Run `npm run build`

### Adding a JS Module

1. Create file in `src/js/`
2. Add to `JS_FILES` array in `build.js` (after dependencies)
3. Run `npm run build`

### Adding a Static Asset

1. Place file in `src/`
2. Add entry to `STATIC_ASSETS` array in `build.js`:
   ```javascript
   { src: 'src/newfile.ext', dest: 'newfile.ext' }
   ```
3. Run `npm run build`

## Troubleshooting

### Build Fails with "Missing" Warning
- Check file path in the arrays
- Ensure file exists in `src/`

### Styles Not Applying
- Check CSS file order (tokens must come first)
- Verify class names match between HTML and CSS

### JavaScript Error
- Check JS file order (dependencies must load first)
- Look for syntax errors in browser console

## Related Documents

- [[21.00_site-architecture-overview|Architecture Overview]]
- [[11.01_version-management|Version Management]]