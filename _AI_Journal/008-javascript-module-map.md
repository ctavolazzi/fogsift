# Journal Entry 008: JavaScript Module Map

**Date:** 2026-02-08
**Author:** Claude (AI Development Partner)
**Context:** Complete client-side JS architecture reference

---

## Module Dependency Graph

```
Infrastructure (no deps):
  Toast, Cache, Debug, CopyPageText

Core (use Toast):
  Theme (localStorage, CustomEvent, MutationObserver)
    ThemePicker (uses Theme.set)
    MatrixRain (subscribes to Theme)
  Nav (DOM manipulation)
  Modal (async fetch, DOM)
  SiteSearch (lazy-loads index, keyboard nav)

Features (independent):
  QueueUI + QueueWidget (fetch /api/queue)
  CookieConsent (localStorage)
  SleepMode (activity tracking)
  Monte (three-card game, independent)
  Achievement (animations)

Orchestrator:
  main.js (DOMContentLoaded -> init all)
```

**Zero runtime dependencies.** All vanilla JS, concatenated (no module system).

## Key Modules

### Theme.js (549 lines)
- `Theme.set(name, {notify, broadcast, preserveScroll})` - Apply + persist
- `Theme.cycle()` / `Theme.toggle()` - Next theme in array
- `Theme.subscribe(callback)` - Returns unsubscribe fn
- **Demo mode:** `D` to start, `T` to stop, 4s auto-cycle with countdown
- **Cross-tab:** `storage` event listener syncs theme changes
- **12 themes:** light, dark, industrial-punchcard, matrix, sky, synthwave, pipboy, rivendell, camo, barbie, ocean, aurora

### SiteSearch.js (411 lines)
Two-phase search:

1. **Local (current page):** Scans DOM sections, scores heading (10x) + text (1x), top 5
2. **Site-wide (index):** Lazy-loads `search-index.json`, scores title (10x) + description (5x) + headings (3x) + content (1x), deprioritizes current page (0.3x)

**Activation:** `/` key, `Cmd+K`, or search icon in nav.

### QueueUI.js (428 lines)
- Fetches `/api/queue`, falls back to production URL, then sample data
- Filter tabs: all / pending / in_progress / completed
- Modal preview with safe DOM creation (no innerHTML)
- Polls every 60s for updates

### SleepMode.js
- Tracks `mousemove`, `keydown`, `scroll`, `touchstart` (all `{passive: true}`)
- After inactivity: `document.body.classList.add('page-sleeping')`, buttons "fall asleep"
- Elements get `.sleepy` + `.sleepy-breathing` classes
- ZZZ floating particles, snore bubble animations

### MatrixRain.js
- Canvas-based green character rain for Matrix theme
- Only renders on-screen columns
- Efficient fade: single `rgba(13, 2, 8, 0.05)` fillRect per frame
- Starts/stops via Theme.subscribe

## Event Patterns

- **Theme change:** `CustomEvent('themechange', {detail: {theme, previousTheme}})`
- **Cross-tab:** `window.addEventListener('storage', ...)` for theme sync
- **Keyboard shortcuts:** `T`=cycle theme, `D`=demo, `/`=search, `Cmd+K`=search, `Escape`=close, Konami code=easter egg
- **ARIA updates:** MutationObserver on `data-theme` keeps `aria-pressed` in sync

## Error Handling

- `try/catch` on all localStorage access
- Async fetch with fallback chains (local API -> production -> sample data)
- `typeof Module !== 'undefined'` checks before cross-module calls
- Toast notifications for user-facing errors with copy button

## Performance

- Passive event listeners for scroll/touch tracking
- `requestAnimationFrame` for animations and focus management
- Lazy-loaded search index (fetched on first search open)
- Cache.js: localStorage-based with TTL (1hr default), build-timestamp invalidation
