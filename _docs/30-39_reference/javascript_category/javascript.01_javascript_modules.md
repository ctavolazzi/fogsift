---
created: '2025-12-27T02:24:38Z'
id: javascript.01
links:
- '[[00.00_index]]'
- '[[javascript_category_index]]'
related_work_efforts: []
title: JavaScript Modules
updated: '2025-12-27T02:24:38Z'
---

# JavaScript Modules

## Overview

Fogsift uses a modular JavaScript architecture with global objects for inter-module communication. No bundler or module system required.

## Module Structure

```
src/js/
├── toast.js   # Notification system (no deps)
├── theme.js   # Theme switching (depends on Toast)
├── modal.js   # Article modal (depends on Toast)
├── nav.js     # Navigation (no deps)
└── main.js    # App init (depends on all)
```

## Load Order

Files are concatenated in this order (dependencies first):

```javascript
const JS_FILES = [
    'src/js/toast.js',   // 1. Base utility
    'src/js/theme.js',   // 2. Uses Toast
    'src/js/modal.js',   // 3. Uses Toast
    'src/js/nav.js',     // 4. Standalone
    'src/js/main.js',    // 5. Orchestrates all
];
```

---

## Module Reference

### Toast Module

**Purpose:** Display temporary notification messages.

**Global Object:** `Toast`

**API:**
```javascript
// Show a toast message
Toast.show('MESSAGE TEXT');

// With custom duration (ms)
Toast.show('MESSAGE TEXT', 5000);
```

**Configuration:**
```javascript
Toast.containerId = 'toast-container';  // Container element ID
Toast.defaultDuration = 2500;           // Default display time
```

---

### Theme Module

**Purpose:** Manage light/dark theme with persistence.

**Global Object:** `Theme`

**API:**
```javascript
// Toggle between light and dark
Theme.toggle();

// Get current theme
Theme.get();  // Returns 'light' or 'dark'

// Set specific theme
Theme.set('dark');
Theme.set('light', false);  // false = don't show toast
```

**Storage:** Uses `localStorage.theme`

**Auto-detection:** Respects `prefers-color-scheme` on first visit.

---

### Modal Module

**Purpose:** Display article content in overlay.

**Global Object:** `Modal`

**API:**
```javascript
// Open modal with article ID
Modal.open('001');

// Close modal
Modal.close();
```

**Article Data:** Currently hardcoded in module. TODO: Fetch from `articles.json`.

---

### Nav Module

**Purpose:** Handle mobile menu and breadcrumb tracking.

**Global Object:** `Nav`

**API:**
```javascript
// Toggle mobile drawer
Nav.toggleMobile();

// Initialize (called by App.init)
Nav.init();
```

**Features:**
- Mobile slide-out drawer
- Breadcrumb tracking via IntersectionObserver
- Scroll progress bar

---

### Main Module (App)

**Purpose:** Initialize application and bind events.

**Global Object:** `App`

**API:**
```javascript
// Manual init (auto-called on DOMContentLoaded)
App.init();
```

**Initialization Steps:**
1. `Nav.init()` - Set up navigation
2. `Modal.init()` - Set up modal listeners
3. `initClock()` - Start UTC clock
4. `initDiagnostic()` - Set up checkbox interactions
5. `initEventBindings()` - Bind buttons
6. `logBoot()` - Console branding

---

## Adding a New Module

1. Create file in `src/js/`:
```javascript
/* ============================================
   FOGSIFT MODULE_NAME MODULE
   Brief description
   ============================================ */

const ModuleName = {
    // Configuration
    config: {},

    // Methods
    init() {
        // Setup code
    },

    publicMethod() {
        // Public API
    }
};
```

2. Add to `build.js` (after dependencies):
```javascript
const JS_FILES = [
    // ... existing files
    'src/js/modulename.js',  // Add here
];
```

3. If needed, call init from `main.js`:
```javascript
init() {
    ModuleName.init();  // Add here
    // ...
}
```

4. Run `npm run build`

## HTML Integration

Modules are called directly in HTML event handlers:

```html
<!-- Theme toggle -->
<button onclick="Theme.toggle()">Toggle Theme</button>

<!-- Mobile menu -->
<div onclick="Nav.toggleMobile()">[MENU]</div>

<!-- Open article -->
<div onclick="Modal.open('001')">Read Article</div>

<!-- Show toast -->
<a onclick="Toast.show('Message')">Click me</a>
```

## Related Documents

- [[21.00_site-architecture-overview|Architecture Overview]]
- [[31.01_css-architecture|CSS Architecture]]