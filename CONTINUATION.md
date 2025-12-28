# FogSift Master Continuation Prompt

**Last Updated:** 2025-12-28
**Version:** 0.0.5

Copy this entire document to start a new AI session with full project context.

---

## Project Overview

| Field | Value |
|-------|-------|
| **Repo** | `/Users/ctavolazzi/Code/fogsift` |
| **Version** | 0.0.5 (released 2025-12-28) |
| **Stack** | Static HTML5/CSS3/Vanilla JS with Node.js build |
| **Hosting** | Cloudflare Pages |
| **Live Site** | https://fogsift.pages.dev |
| **Wiki** | https://fogsift.pages.dev/wiki/ |

---

## Visual Design: 70's/80's Retro-Modern

The site now uses a warm, confident aesthetic matching the logo and profile badge:

### Color Palette
```css
--cream: #f5f0e6;           /* Primary background */
--cream-dark: #e8e0d0;      /* Secondary background */
--chocolate: #4a2c2a;       /* Primary text, borders */
--chocolate-light: #6b4423; /* Secondary text */
--burnt-orange: #e07b3c;    /* CTA, accents */
--rust: #c2410c;            /* Hover states */
--teal: #0d9488;            /* Links */
```

### Typography
- **Display font:** Outfit (bold, confident headings)
- **Body font:** Inter
- **Mono font:** JetBrains Mono (labels, footer)

### Design Elements
- Badge-style cards with rounded corners (`border-radius: 16px`)
- Pill-shaped CTA buttons (`border-radius: 24px`)
- Soft shadows (no hard offset shadows)
- Clean horizontal section dividers

---

## Site Structure (5 Sections)

```
┌─────────────────────────────────────┐
│            NAVIGATION               │  Logo left, links right, theme toggle
├─────────────────────────────────────┤
│              HERO                   │  Badge-style card, headline, CTA
├─────────────────────────────────────┤
│           THE PROCESS               │  3 numbered step cards
├─────────────────────────────────────┤
│             ABOUT                   │  Photo + bio in badge card
├─────────────────────────────────────┤
│            PRICING                  │  3 tier cards
├─────────────────────────────────────┤
│          CONTACT/FOOTER             │  Final CTA + footer links
└─────────────────────────────────────┘
```

---

## Tech Stack

### CSS Architecture (Modular)
```
src/css/
├── tokens.css      # Design tokens (colors, spacing, typography)
├── base.css        # Reset, typography, layout
├── components.css  # All component styles (~500 lines)
├── mobile.css      # Mobile-first responsive overrides
```

### JavaScript Modules
```
src/js/
├── main.js      # App init (~190 lines)
├── theme.js     # Theme module with custom picker (~462 lines)
├── toast.js     # Toast notifications (~84 lines)
├── modal.js     # Article modal (~106 lines)
├── nav.js       # Mobile menu handling (~37 lines)
├── sleep.js     # Sleep mode easter egg (~596 lines)
├── cache.js     # API caching layer (~205 lines)
├── debug.js     # Debug utilities (~193 lines)
├── wiki-api.js  # Wiki API client (~125 lines)
```

### Build System
- **Build Script:** `scripts/build.js` - concatenates CSS/JS, processes wiki markdown
- **Markdown Parser:** `marked` v15.0.4
- **Deploy:** Wrangler CLI to Cloudflare Pages

---

## Commands

```bash
# Development
npm run build          # Build to dist/
npm run dev            # Start local server (port 5050)
npm run preview        # Build and preview locally

# Deployment
npm run deploy         # Build and deploy to Cloudflare Pages

# Version Management
npm run version:patch  # Bump 0.0.X
npm run version:minor  # Bump 0.X.0
npm run version:major  # Bump X.0.0
```

---

## Recent Work

### Theme System Enhancements (2025-12-28)
- Custom theme picker with dropdown UI (☀ Light, ● Dark, ▣ Industrial)
- Keyboard shortcut "T" to cycle themes
- System theme auto-detection (respects OS prefers-color-scheme)
- Smooth CSS transitions on theme changes
- Reduced motion accessibility support
- DRY refactoring: Wiki pages now use shared app.js (-2,044 lines)

### CSS Error Handling (2025-12-28)
- Added defensive CSS load verification for Cloudflare deployment
- Fallback inline styles if CSS fails to load

### 70's/80's Retro Visual Overhaul (2025-12-27)
- Warm retro-modern aesthetic matching logo
- Badge-style cards with rounded corners
- Industrial theme with amber/teal accents

### Wiki System (2025-12-27)
- Markdown-based wiki at `src/wiki/`
- 30+ pages organized by category
- Custom wiki styling matching site aesthetic

---

## Key Files

| File | Purpose |
|------|---------|
| `src/index.html` | Main page (5 sections) |
| `src/css/tokens.css` | Design tokens |
| `src/css/components.css` | Component styles |
| `src/wiki/` | Wiki content |
| `scripts/build.js` | Build script |

---

## Work Efforts

Work efforts use the v0.3.0 system with `WE-YYMMDD-xxxx` format.

**Active:** None (all completed)

**Archived in `_work_efforts/_archive/2025-12/`:**

| ID | Description | Tickets |
|----|-------------|---------|
| WE-251227-fmhx | MCP System Dashboard | 4 |
| WE-251227-giok | MCP Integration Test Task | 2 |
| WE-251227-uzo7 | Work Effort System Rules Setup | 5 |
| WE-251227-x7k9 | API Architecture | 8 |

**Legacy work efforts archived in `_work_efforts/_archive/legacy/`**

---

## User Preferences

- **Documentation:** Johnny Decimal system
- **Versioning:** Semantic (0.0.X patches, 0.X.0 features, X.0.0 breaking)
- **Code Style:** Direct, minimal (no over-abstraction)
- **Default Theme:** Light mode

---

## Suggested Next Steps

1. **Analytics** - Add Plausible or Cloudflare Analytics (TD-008)
2. **Build Optimization** - Add CSS/JS minification (TD-005)
3. **Testing** - Add basic test coverage (TD-019)
4. **Content** - Add more wiki articles
5. **Lead Capture** - See FEATURE_VOID_AUDIT.md for priority features
