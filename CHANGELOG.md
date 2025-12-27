# Changelog

All notable changes to Fogsift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).


## [0.0.2] - 2025-12-27
### Patch Release - "Infrastructure & Polish"

#### New Features
- **Wiki System**: Markdown-based documentation at `/wiki/` with 6 initial pages
- **Quick Deploy Script**: `npm run quick-deploy` with pre-flight checks, file tree visualization, and deployment manifest
- **Enhanced Toast System**: Error toasts with 5-second duration and `[COPY]` button for clipboard support

#### Improvements
- **Conversion-Focused Redesign**: Streamlined hero section and CTAs
- **Mobile CSS**: New `mobile.css` with responsive improvements
- **Deploy Manifest**: Tracks version, commit hash, checksums, and bundle sizes

#### Technical
- Toast API expanded: `Toast.show()`, `Toast.error()`, `Toast.info()`
- Build script now processes wiki markdown to HTML
- Deployment includes critical file verification

## [0.0.1] - 2025-12-26
### Initial Release
- Complete single-page application with modular build system
- Light/Dark theme (defaults to light, user preference saved)
- Interactive diagnostic checklist with state tracking
- Field Notes modal system with dynamic JSON loading
- Responsive mobile navigation with slide-out drawer
- Live breadcrumb navigation tracking scroll position
- Scroll progress indicator
- Toast notification system
- Version management system (patch/minor/major)
- Comprehensive documentation in _docs/
- SEO optimizations (robots.txt, sitemap.xml, structured data)
- Print-friendly styles
- AI bot blocking in robots.txt

