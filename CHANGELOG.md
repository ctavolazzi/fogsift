# Changelog

All notable changes to FogSift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.0.5] - 2025-12-28
### Patch Release - "Consolidation"

This release consolidates multiple feature branches and syncs all version sources.

#### New Features
- **Testimonials Section**: Social proof with 3 client quotes and stats row
- **Feature Void Audit**: Comprehensive analysis of 42 missing features (FEATURE_VOID_AUDIT.md)
- **ESLint Configuration**: Static analysis for code quality
- **Error Handling**: Improved try-catch for localStorage, fetch, clipboard operations

#### Technical
- Version sync: package.json, version.json, and git tags now aligned
- Merged 3 feature branches into main
- CSS modularization (navigation.css, sleep.css split from components.css)
- MCP status dashboard and monitoring system

#### Documentation
- Updated TECH_DEBT.md with fixed items
- Added API & data flow architecture documentation

---

## [0.0.4] - 2025-12-27
### Patch Release - "Minification & Cleanup"

#### Technical
- Build system minification improvements
- Configuration cleanup
- CSS refactoring (split components.css into modular files)
- Theme initialization consolidation via build injection

---

## [0.0.3] - 2025-12-27
### Patch Release - "Secret Sleep Mode"

#### New Features
- **Secret Sleep Mode**: Hidden easter egg screensaver (5 min page time + 30 sec idle)
  - Flying toasters animation (classic Mac homage) in 8-bit pixel art
  - Floating "Z" letters with glow effects
  - CRT scanline overlay
  - TV flash wake-up effect
  - Debug: `SleepMode._debugSleep()` in console

---

## [0.0.2] - 2025-12-27
### Patch Release - "Infrastructure & Polish"

#### New Features
- **Wiki System**: Markdown-based documentation at `/wiki/` with 31 pages
- **Quick Deploy Script**: `npm run quick-deploy` with pre-flight checks
- **Enhanced Toast System**: Error toasts with clipboard support

#### Improvements
- Conversion-focused redesign
- Mobile CSS improvements
- Deploy manifest with version tracking

---

## [0.0.1] - 2025-12-26
### Initial Release

- Single-page application with modular build system
- Light/Dark theme with user preference
- Interactive diagnostic checklist
- Field Notes modal system
- Responsive mobile navigation
- Toast notification system
- Version management system
- SEO optimizations
