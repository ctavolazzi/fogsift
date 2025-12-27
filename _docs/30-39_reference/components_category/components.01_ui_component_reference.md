---
created: '2025-12-27T02:25:04Z'
id: components.01
links:
- '[[00.00_index]]'
- '[[components_category_index]]'
related_work_efforts: []
title: UI Component Reference
updated: '2025-12-27T02:25:04Z'
---

# UI Component Reference

## Overview

This document catalogs all UI components available in Fogsift. Components are defined in `src/css/components.css` and used in `src/index.html`.

---

## Navigation Components

### Main Navigation (`.main-nav`)
Fixed top navigation bar with brand, menu items, and controls.

```html
<div class="main-nav">
    <div class="brand">FOGSIFT</div>
    <div class="menu-items">...</div>
    <div class="nav-controls">...</div>
</div>
```

### Dropdown Menu (`.dropdown`)
Hover-activated dropdown for navigation items.

```html
<div class="menu-item">
    <span class="menu-link">MENU</span>
    <div class="dropdown">
        <a href="#" class="dropdown-link">
            Link Text <span>Description</span>
        </a>
    </div>
</div>
```

### Breadcrumb Bar (`.breadcrumb-bar`)
Dynamic breadcrumb showing current section.

```html
<nav class="breadcrumb-bar">
    <ol class="crumb-list">
        <li class="crumb-item"><a class="crumb-link">HOME</a></li>
        <li class="crumb-separator">/</li>
        <li class="crumb-item"><span class="crumb-current">SECTION</span></li>
    </ol>
</nav>
```

### Mobile Drawer (`.mobile-drawer`)
Slide-out navigation for mobile screens.

```html
<div class="mobile-drawer">
    <div class="mobile-close">[CLOSE]</div>
    <a class="mobile-link">LINK</a>
</div>
```

---

## Content Components

### Frame (`.frame`)
Main content container with border and shadow.

```html
<div class="frame">
    <!-- Page content -->
</div>
```

### Label (`.label`)
Section identifier tag with skewed design.

```html
<span class="label">SECTION TITLE</span>
```

### Card (`.card`)
Generic content card.

```html
<section class="card" id="section-id">
    <span class="label">TITLE</span>
    <!-- Content -->
</section>
```

---

## Interactive Components

### Hotline Button (`.hotline-button`)
Primary CTA with hover lift effect.

```html
<a href="mailto:..." class="hotline-button">
    Button Text
</a>
<div class="hotline-subtext">Supporting text</div>
```

### Secondary Button (`.btn-secondary`)
Underlined text link.

```html
<a href="#" class="btn-secondary">Link text →</a>
```

### Theme Toggle (`.theme-toggle`)
Light/dark mode button with sun/moon icons.

```html
<button class="theme-toggle" onclick="Theme.toggle()">
    <svg class="icon-sun">...</svg>
    <svg class="icon-moon">...</svg>
</button>
```

### Checkbox Item (`.check-item`)
Interactive checkbox for diagnostic.

```html
<li class="check-item">
    <span class="check-box">[ ]</span> Label text
</li>
```

---

## Grid Components

### Specs Grid (`.specs-grid`)
Auto-fit grid for specification cards.

```html
<div class="specs-grid">
    <div class="spec-item">
        <h4>Title</h4>
        <p>Description</p>
    </div>
</div>
```

### Deliverables Grid (`.deliv-grid`)
3-column grid for deliverable cards.

```html
<div class="deliv-grid">
    <div class="deliv-card">
        <div class="deliv-icon"></div>
        <h4>Title</h4>
        <p>Description</p>
    </div>
</div>
```

### Theatre Grid (`.theatre-grid`)
Grid for operational sector cards.

```html
<div class="theatre-grid">
    <div class="theatre-card">
        <div class="theatre-header">
            <span class="theatre-id">SECTOR 01</span>
            <span class="theatre-status">ACTIVE</span>
        </div>
        <h4>Title</h4>
        <p>Description</p>
    </div>
</div>
```

### Log Grid (`.log-grid`)
Grid for blog/field notes entries.

```html
<div class="log-grid">
    <div class="log-entry band-strategy" onclick="Modal.open('001')">
        <div class="log-header">
            <span class="log-time">READ: 2M</span>
            <span>LOG: 001</span>
        </div>
        <div class="log-title">Article Title</div>
        <div class="log-footer">
            <span class="log-id">SEC-A</span>
            <span class="log-arrow">→</span>
        </div>
    </div>
</div>
```

**Band Variants:**
- `.band-strategy` - Copper top border
- `.band-fab` - Ink top border
- `.band-systems` - Electric top border

---

## Timeline Component

### Timeline Grid (`.timeline-grid`)
Vertical timeline with markers.

```html
<div class="timeline-grid">
    <div class="timeline-line"></div>
    
    <div class="timeline-marker shape-circle">01</div>
    <div class="timeline-content">
        <h3>Step Title</h3>
        <p>Description</p>
        <div class="io-box">
            <div class="io-item"><strong>INPUT</strong>Value</div>
            <div class="io-item"><strong>OUTPUT</strong>Value</div>
        </div>
    </div>
</div>
```

**Marker Shapes:**
- `.shape-circle` - Round marker
- `.shape-square` - Square marker

---

## Panel Components

### Exclusion Panel (`.exclusion-panel`)
Warning/rejection criteria panel.

```html
<section class="exclusion-panel">
    <span class="label">CRITERIA</span>
    <ul>
        <li class="check-item">
            <span class="cross-box">[!]</span> Warning text
        </li>
    </ul>
</section>
```

### Contact Box (`.contact-box`)
CTA contact section with decorative corner.

```html
<div class="contact-box">
    <h3>Ready?</h3>
    <p>Email me at <a href="mailto:...">email</a></p>
</div>
```

### Comms Panel (`.comms-panel`)
Newsletter signup form.

```html
<section class="comms-panel">
    <span class="label">JOIN</span>
    <input type="email" class="comms-input" placeholder="EMAIL">
    <button class="comms-btn">SUBMIT</button>
</section>
```

---

## Utility Components

### Toast (`.toast`)
Notification popup (created dynamically by JS).

### Modal (`#article-modal`)
Article overlay modal.

```html
<div id="article-modal">
    <div class="modal-content">
        <button class="close-modal" onclick="Modal.close()">[CLOSE]</button>
        <h2 id="modal-title">Title</h2>
        <div id="modal-body">Content</div>
    </div>
</div>
```

### Progress Bar (`#progress-bar`)
Scroll progress indicator at top of page.

```html
<div id="progress-bar"></div>
```

---

## Related Documents

- [[31.01_css-architecture|CSS Architecture]]
- [[31.02_javascript-modules|JavaScript Modules]]