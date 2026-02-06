# Fogsift Site Architecture

## Design Hierarchy (Build Order)

### 1. Semantic HTML Structure
Use correct HTML5 semantic elements:
- `<header>` - Site header/navigation
- `<nav>` - Navigation sections
- `<main>` - Primary content
- `<article>` - Self-contained content
- `<section>` - Thematic grouping
- `<aside>` - Sidebar/supplementary
- `<footer>` - Site footer

### 2. Component Architecture
Reusable components with clear naming:
- `.site-header` - Global header
- `.site-nav` - Primary navigation
- `.site-footer` - Global footer
- `.page-content` - Main content wrapper
- `.card` - Content card
- `.banner` - Alert/notice banner

### 3. Layout System (CSS Grid + Flexbox)
- Grid for page-level layout (header/main/footer)
- Grid for content areas (sidebar + main)
- Flexbox for component internals (nav items, cards)

### 4. Box Model
Every element follows:
```
margin (outer spacing)
  border (visible edge)
    padding (inner spacing)
      content
```

### 5. Content & Styling
Applied last:
- Typography
- Colors
- Decorative elements
- Animations

---

## Page Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta, styles -->
</head>
<body>
  <header class="site-header">
    <nav class="site-nav">...</nav>
  </header>

  <main class="page-content">
    <article>
      <!-- Primary content -->
    </article>
    <aside>
      <!-- Optional sidebar -->
    </aside>
  </main>

  <footer class="site-footer">...</footer>
</body>
</html>
```

## Wiki Page Structure

```html
<body class="wiki-page">
  <header class="site-header">
    <nav class="site-nav">...</nav>
    <nav class="breadcrumb" aria-label="Breadcrumb">...</nav>
  </header>

  <div class="wiki-container">
    <aside class="wiki-sidebar">
      <nav class="wiki-nav">...</nav>
    </aside>

    <main class="wiki-content">
      <div class="content-banner content-banner--warning">
        <!-- AI disclaimer -->
      </div>
      <article>
        <!-- Wiki content -->
      </article>
    </main>
  </div>

  <footer class="site-footer">...</footer>
</body>
```

## CSS Organization

1. **tokens.css** - Variables (colors, spacing, fonts)
2. **base.css** - Reset, typography, root styles
3. **layout.css** - Grid systems, page structure
4. **components.css** - Reusable components
5. **utilities.css** - Helper classes
6. **pages/*.css** - Page-specific overrides
