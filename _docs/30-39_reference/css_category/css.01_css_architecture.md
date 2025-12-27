---
created: '2025-12-27T02:24:20Z'
id: css.01
links:
- '[[00.00_index]]'
- '[[css_category_index]]'
related_work_efforts: []
title: CSS Architecture
updated: '2025-12-27T02:24:20Z'
---

# CSS Architecture

## Overview

Fogsift uses a three-file CSS architecture with CSS Custom Properties for theming:

1. **tokens.css** - Design system variables
2. **base.css** - Reset, typography, layout primitives
3. **components.css** - UI component styles

## File Structure

```
src/css/
├── tokens.css       # Design tokens (load first)
├── base.css         # Base styles
└── components.css   # Component styles
```

## Design Tokens (tokens.css)

### Color Palette

```css
/* Light Mode */
--ink: #18181b;      /* Primary text */
--paper: #f4f4f5;    /* Background */
--canvas: #e4e4e7;   /* Page background */
--copper: #d97706;   /* Accent (orange) */
--electric: #0891b2; /* Accent (cyan) */
--muted: #52525b;    /* Secondary text */
--line: #d4d4d8;     /* Borders */

/* Dark Mode - Swapped and adjusted */
--ink: #f4f4f5;
--paper: #18181b;
--canvas: #09090b;
--copper: #fbbf24;   /* Brighter orange */
--electric: #22d3ee; /* Brighter cyan */
```

### Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs: 0.7rem;
--text-sm: 0.8rem;
--text-base: 1rem;
--text-lg: 1.25rem;
--text-xl: 1.5rem;
--text-headline: clamp(2.5rem, 5vw, 3.5rem);
```

### Spacing

```css
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 2rem;     /* 32px */
--space-xl: 4rem;     /* 64px */
```

### Effects

```css
--border-width: 2px;
--radius: 4px;

--shadow-hard: 4px 4px 0 var(--ink);
--shadow-hover: 6px 6px 0 var(--electric);
--shadow-active: 0px 0px 0 var(--ink);

--snap: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Layout

```css
--nav-height: 70px;
--breadcrumb-height: 44px;
--frame-max-width: 800px;
```

## Theme Switching

Themes are controlled by the `data-theme` attribute on `<html>`:

```html
<html data-theme="light">  <!-- Light mode -->
<html data-theme="dark">   <!-- Dark mode -->
```

CSS uses attribute selectors:

```css
:root { /* Light mode defaults */ }

[data-theme="dark"] {
    /* Dark mode overrides */
    --ink: #f4f4f5;
    --paper: #18181b;
    /* etc. */
}
```

## Component Naming Convention

Components use flat class names (no BEM):

```css
/* Component */
.log-entry { }

/* Variants */
.band-strategy { }
.band-fab { }
.band-systems { }

/* Child elements */
.log-header { }
.log-title { }
.log-footer { }
```

## Responsive Breakpoints

Single breakpoint at 800px:

```css
@media (max-width: 800px) {
    /* Mobile styles */
}
```

## Print Styles

Print styles reset colors and hide interactive elements:

```css
@media print {
    body { background: #fff !important; }
    .nav-wrapper, .theme-toggle { display: none !important; }
}
```

## Adding New Styles

1. **New token** → Add to `tokens.css`
2. **New base style** → Add to `base.css`
3. **New component** → Add to `components.css`
4. Run `npm run build`

## Related Documents

- [[21.00_site-architecture-overview|Architecture Overview]]
- [[31.02_javascript-modules|JavaScript Modules]]