# Journal Entry 007: CSS & Theme Architecture

**Date:** 2026-02-08
**Author:** Claude (AI Development Partner)
**Context:** Design token system, theme architecture, and animation catalog

---

## Design Tokens (tokens.css)

| Token | Light Value | Purpose |
|-------|-------------|---------|
| `--ink` | #4a2c2a | Primary text (dark chocolate) |
| `--paper` | #f5f0e6 | Page background (warm parchment) |
| `--cream` | #faf6ef | Card backgrounds |
| `--burnt-orange` | #e07b3c | Primary accent / CTA |
| `--chocolate` | #6b3a2a | Secondary accent |
| `--muted` | #8b7355 | Secondary text |
| `--line` | #e0d5c1 | Borders |
| `--canvas` | #eee8da | Section backgrounds |

**Typography Scale:** 7 levels (12px to 32px) using `clamp()` for fluid sizing.
**Font Stack:** Outfit (display), Inter (sans), JetBrains Mono (mono).
**Shadows:** 5 levels (soft, card, elevated, hard, hover).

## 11 Themes

Each theme overrides CSS custom properties via `[data-theme="name"]`:

1. **light** (default) - Warm parchment/chocolate
2. **dark** - Deep charcoal/amber
3. **industrial-punchcard** - IBM card aesthetic
4. **matrix** - Green-on-black digital rain (has canvas animation)
5. **sky** - T-800 Terminator HUD blue
6. **synthwave** - 80s neon purple/pink
7. **pipboy** - Fallout CRT green phosphor
8. **rivendell** - Elvish emerald/gold
9. **camo** - Military woodland green/brown
10. **barbie** - Hot pink dream house
11. **ocean** - Deep sea bioluminescence
12. **aurora** - Northern lights purple/green (has `@keyframes auroraDrift`)

## Theme Switching

- **Storage:** localStorage key `"theme"`, default `"light"`
- **Cross-tab sync:** `window.addEventListener('storage', ...)`
- **FOUC prevention:** `theme-init.js` runs in `<head>` (blocking, no defer)
- **Transition class:** `html.theme-transitioning` adds 0.3s transitions to all properties
- **Demo mode:** Press `D` to auto-cycle themes every 4s

## CSS File Order (19 files)

```
tokens.css -> base.css -> navigation.css -> components.css
-> 11 theme files (industrial, matrix, sky, synthwave, pipboy,
   rivendell, camo, barbie, ocean, aurora)
-> sleep.css -> wiki.css -> mobile.css (MUST BE LAST)
```

## Key Animations

| Name | Duration | Use |
|------|----------|-----|
| `heroEntrance` | 0.5s | Hero badge fade-in |
| `ticker` | 35s linear infinite | Testimonial scroll |
| `emoji-waft` | 7s infinite | Hero emoji float |
| `monte-celebrate` | 0.6s 2x | Three-card monte win |
| `buttonSleep` / `breathe` | 1.2s / 3s | Sleep mode |
| `ferro-move` | 10s cubic-bezier | Ferrofluid morph (GPU) |
| `blob-morph` | 10s infinite | Lava lamp |
| `auroraDrift` | 20s alternate | Aurora theme background |

## Accessibility

- **Focus:** `3px solid var(--burnt-orange)`, offset 2px on `:focus-visible`
- **Touch targets:** `--touch-min: 44px` on all interactive elements
- **Skip link:** `.skip-link` hidden until focused
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations, sets timing vars to 0s
- **High contrast:** `@media (prefers-contrast: high)` widens focus ring to 4px

## Responsive Breakpoints

- `320px` - Extreme small (minimum supported)
- `375px` - Standard phone
- `569px` - Landscape phone
- `768px` - Tablet (major layout shift)
- `1024px` - Desktop (full layout)
