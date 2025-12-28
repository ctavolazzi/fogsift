# Changelog

All notable changes to Fogsift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).



## [0.1.0] - 2025-12-27
### Minor Release - "Trust & Credibility"

This release marks a significant milestone: FogSift now includes social proof and trust signals,
addressing the #1 priority from the Feature Void Audit. The site is now ready for lead generation.

#### Milestone Highlights
- **Testimonials Section**: Complete social proof implementation
- **Feature Void Audit**: Comprehensive analysis of 42 missing features
- **Documentation**: Full feature specification and implementation guides
- **Quality**: Fully tested, accessible, and responsive

#### What's New Since v0.0.3
- Testimonials section with 3 client quotes
- Stats row (15+ engagements, 100% satisfaction, 8+ industries)
- Feature void audit documentation
- Feature development workflow and tracking

#### Next Steps (from Feature Void Audit)
- Email capture with lead magnet
- Calendly/booking integration
- Contact form
- Analytics integration

---

## [0.0.4] - 2025-12-27
### Patch Release - "Social Proof"

#### New Features
- **Testimonials Section**: Added social proof section between About and Pricing
  - Three client testimonial cards with quotes, names, and industries
  - Animated hover effects matching the retro-modern design system
  - Decorative quote marks in burnt-orange accent color
  - Stats row showing: 15+ Engagements, 100% Satisfaction, 8+ Industries

#### Design
- Semantic HTML with `<blockquote>`, `<cite>`, and `<footer>` elements
- Full dark mode support
- Responsive grid layout:
  - Desktop: 3-column grid
  - Tablet: 2-column grid with centered third card
  - Mobile: Single column stack

#### Accessibility
- ARIA labels for section and stats
- Proper heading hierarchy
- Semantic blockquote structure for screen readers

#### Technical
- Added `.section-testimonials`, `.testimonial-card`, `.testimonials-stats` components
- Added responsive styles for testimonials in mobile.css
- Feature void audit addressed: #1 priority item (social proof)

---

## [0.0.3] - 2025-12-27
### Patch Release - "Secret Sleep Mode"

#### New Features
- **Secret Sleep Mode**: Hidden easter egg screensaver that activates after 5 minutes on page + 30 seconds idle
  - Flying toasters animation (classic Mac screensaver homage) in 8-bit pixel art style
  - Floating "Z" letters in burnt-orange with glow effects
  - CRT scanline overlay for authentic retro feel
  - TV flash wake-up effect when clicking to dismiss
  - Console easter egg messages
  - Respects `prefers-reduced-motion` accessibility setting
  - Debug: `SleepMode._debugSleep()` in console to test

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

