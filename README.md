# FogSift

**Straight answers to complicated questions.**

A diagnostic consulting site built with vanilla HTML/CSS/JS — no frameworks, no bundlers, just a clean build script and a dev suite called **The Lighthouse**.

**[fogsift.com](https://fogsift.com)**

---

## Quick Start

```bash
git clone https://github.com/ctavolazzi/fogsift.git
cd fogsift
npm install
npm start
```

That's it. `npm start` launches The Lighthouse — FogSift's full development suite:

```
     ___           ___           ___
    /\  \         /\  \         /\  \
   /::\  \       /::\  \       /::\  \     THE LIGHTHOUSE
  /:/\:\  \     /:/\:\  \     /:/\:\  \    FogSift Development Suite
 /::\~\:\  \   /:/  \:\  \   /:/  \:\  \   v0.1.0  main@a1b2c3d
/:/\:\ \:\__\ /:/__/ \:\__\ /:/__/_\:\__\
\/__\:\ \/__/ \:\  \ /:/  / \:\  /\ \/__/  "The fog doesn't lift itself."
     \:\__\    \:\  /:/  /   \:\ \:\__\
      \/__/     \:\/:/  /     \:\/:/  /
                 \::/  /       \::/  /
                  \/__/         \/__/

  [1] Health check       All systems nominal
  [2] Build              71 pages, 43 wiki, 174KB CSS, 60KB JS
  [3] Test suite         103 pass, 13 warn, 0 fail
  [4] Snapshot & diff    2 changes: Version 0.0.5 -> 0.1.0, 3 new commits
  [5] Work effort        Resumed WE-260208-0vyf_dev_session
  [6] Launching servers  All servers launched

  ════════════════════════════════════════════════════
    READY (3.1s startup)
  ════════════════════════════════════════════════════

  * FogSift              http://localhost:5050
  * Keeper's Log         http://localhost:5001
  * Signal Workshop      http://localhost:5030
  * Quality Report       http://localhost:5065
```

### What The Lighthouse Does

1. **Health check** — Verifies project structure and integrity
2. **Build** — Compiles `src/` to `dist/` (HTML templates, CSS concat, JS bundle, wiki markdown)
3. **Test suite** — Runs 116 tests across 9 suites (HTML validation, accessibility, Lighthouse, links, images)
4. **Snapshot & diff** — Compares current state against your last dev session (catches regressions)
5. **Work effort** — Creates or resumes a daily work tracking entry
6. **Launch** — Starts 4 servers with file watching and hot reload

### Ports

| Port | Service | What It Is |
|------|---------|------------|
| 5050 | FogSift | The main site with hot reload |
| 5001 | The Keeper's Log | AI development journal |
| 5030 | The Signal Workshop | Component library |
| 5065 | Captain FogLift's Quality Report | Test suite viewer |

### Flags

```bash
npm start                    # Full suite — site + all dev tools
npm run start:site           # Site only (skip helper servers)
npm start -- --skip-tests    # Skip test suite for faster boot
```

---

## What's Inside

### The Site

- **44-page wiki** — Markdown compiled at build time, full-text search
- **11 themes** — Synthwave, Ocean, Aurora, Barbie, Rivendell, Pip-Boy, Matrix, and more
- **Theme demo mode** — Cycles through all themes automatically
- **Full-text search** — Compiled search index, animated overlay
- **Portfolio** — YouTube showcase with responsive grid
- **Queue system** — Ko-fi webhook integration
- **Easter eggs** — Secret sleep mode, hidden Keeper's Log entrance

### The Build

No webpack. No vite. Just `node scripts/build.js` (1,291 lines):

- `{{PLACEHOLDER}}` template replacement
- CSS concatenation from modular files
- JS bundling with source order
- Markdown wiki compilation via `marked`
- Search index generation (56 pages indexed)
- Nav/footer injection across all pages
- Theme initialization script (CSP-compliant external load)

### The Tests

```bash
npm test
```

9 suites, 116 tests:
- HTML validation
- Accessibility (pa11y)
- Lighthouse performance
- Link checking
- Image optimization
- Security headers
- Build output verification

---

## Project Structure

```
fogsift/
├── src/                        # Source files
│   ├── index.html              # Homepage
│   ├── css/                    # Modular stylesheets
│   │   ├── tokens.css          # Design tokens (colors, spacing, type scale)
│   │   ├── base.css            # Reset, typography, utilities
│   │   ├── components.css      # Cards, buttons, grids
│   │   ├── navigation.css      # Nav, search panel, theme picker
│   │   ├── mobile.css          # Responsive breakpoints
│   │   ├── search.css          # Search overlay
│   │   ├── sleep.css           # Sleep mode easter egg
│   │   └── themes/             # 11 theme files
│   ├── js/                     # JavaScript modules
│   │   ├── main.js             # App initialization
│   │   ├── theme.js            # Theme system + demo mode
│   │   ├── search.js           # Full-text search
│   │   ├── modal.js            # Modal system
│   │   ├── toast.js            # Notifications
│   │   └── sleep.js            # Sleep mode
│   └── wiki/                   # 44 markdown pages
├── dist/                       # Built output (deploy this)
├── scripts/                    # Build & dev tooling
│   ├── build.js                # Main build script
│   ├── dev-start.js            # The Lighthouse startup
│   ├── deploy.js               # Cloudflare deployment
│   └── version.js              # Semver management
├── tests/                      # Test suite
│   └── suite.js                # 9 suites, 116 tests
├── _AI_Journal/                # The Keeper's Log (dev journal)
├── _tools/                     # Dev utilities
│   ├── component-library/      # The Signal Workshop
│   ├── test-viewer/            # Captain FogLift's Quality Report
│   ├── scripts/                # Health check, snapshots
│   └── snapshots/              # Session state tracking
├── _work_efforts/              # WAFT work effort tracking
│   └── .tool_bag_template/     # Templates for new efforts
├── _pyrite/                    # Active work tracking
│   ├── active/                 # Current work efforts
│   ├── backlog/                # Queued work
│   └── standards/              # Process documentation
└── functions/                  # Cloudflare Pages Functions
    └── api/                    # Ko-fi webhook handler
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | The Lighthouse — full dev suite |
| `npm run start:site` | Site only, no helper servers |
| `npm run build` | Build `src/` to `dist/` |
| `npm test` | Run test suite (9 suites, 116 tests) |
| `npm run deploy` | Build + deploy to Cloudflare Pages |
| `npm run quick-deploy` | Deploy with pre-flight checks |
| `npm run lint` | ESLint on `src/js/` |
| `npm run audit` | Full audit (build + Lighthouse + pa11y) |

---

## Forking FogSift

Want to use this as a starting point for your own site?

1. **Fork & clone** the repo
2. **Run `npm start`** — The Lighthouse will verify everything works
3. **Edit `src/`** — all source files are plain HTML/CSS/JS
4. **Add wiki pages** — drop `.md` files in `src/wiki/`
5. **Pick your themes** — edit files in `src/css/themes/` or add your own
6. **Deploy** — `npm run deploy` pushes to Cloudflare Pages

The build script handles everything. No config files to learn, no framework APIs to memorize. Change the HTML, save, and it's live on localhost.

---

## Ideas & Planning

- **[v0.1.0 Release Plan](V0.1.0-RELEASE-PLAN.md)** — Current release roadmap
- **[Feature Void Audit](FEATURE_VOID_AUDIT.md)** — 42 identified feature gaps
- **[Tech Debt Tracker](TECH_DEBT.md)** — Known issues and priorities
- **[The Keeper's Log](_AI_Journal/)** — AI development journal and reflections
- **[CHANGELOG.md](CHANGELOG.md)** — Version history

---

## License

Private - All rights reserved.

*Built by [Christopher Tavolazzi](https://github.com/ctavolazzi)*
