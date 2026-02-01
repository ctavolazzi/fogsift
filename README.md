# FogSift

**Straight answers to complicated questions.**

FogSift is a diagnostic consulting website that helps organizations cut through noise and find signal. We specialize in identifying root causes of operational challenges through systematic analysis.

## Live Site

🌐 **[fogsift.pages.dev](https://fogsift.pages.dev)**

## Features

- **Knowledge Wiki** - 31 pages of diagnostic frameworks, mental models, and case studies
- **Testimonials** - Social proof from satisfied clients
- **Dark/Light Theme** - User preference saved locally
- **Secret Sleep Mode** - Easter egg screensaver (5 min + 30 sec idle)
- **Responsive Design** - Mobile-first with slide-out navigation
- **PWA Ready** - Installable as a standalone app

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Build**: Node.js build script with CSS/JS concatenation
- **Hosting**: Cloudflare Pages
- **Wiki**: Markdown → HTML conversion at build time

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/ctavolazzi/fogsift.git
cd fogsift

# Install dependencies
npm install

# Start development server (port 5050)
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Build and start dev server with hot reload |
| `npm run build` | Build to `dist/` |
| `npm run deploy` | Build and deploy to Cloudflare Pages |
| `npm run quick-deploy` | Deploy with pre-flight checks |

### Project Structure

```
fogsift/
├── src/
│   ├── index.html          # Main page
│   ├── css/                 # Stylesheets
│   │   ├── tokens.css      # Design tokens
│   │   ├── base.css        # Reset, typography
│   │   ├── components.css  # UI components
│   │   ├── navigation.css  # Nav styles
│   │   └── sleep.css       # Sleep mode styles
│   ├── js/                  # JavaScript modules
│   │   ├── main.js         # App init
│   │   ├── theme.js        # Theme toggle
│   │   ├── modal.js        # Modal system
│   │   ├── toast.js        # Notifications
│   │   └── sleep.js        # Easter egg
│   └── wiki/               # Markdown wiki content
├── dist/                   # Built output
├── scripts/                # Build scripts
├── _docs/                  # Project documentation
└── _work_efforts/          # Work tracking
```

## Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[TECH_DEBT.md](TECH_DEBT.md)** - Technical debt tracking
- **[AGENTS.md](AGENTS.md)** - AI development workflow
- **[FEATURE_VOID_AUDIT.md](FEATURE_VOID_AUDIT.md)** - Feature gap analysis

## Cursor Setup

- Project rules: `.cursor/rules/` (legacy `.cursorrules` retained)
- Commands: `.cursor/commands/` (project), `~/.cursor/commands/` (global)
- Skills: `.cursor/skills/`, `~/.cursor/skills/`
- Subagents: `.cursor/agents/`, `~/.cursor/agents/`
- Hooks: `.cursor/hooks.json`, `~/.cursor/hooks.json` (light audit/ask policy)
- @Docs sources: `~/.cursor/DOCS_SOURCES.md` (add via Settings → Indexing & Docs)
- Semantic Search: `.cursorignore` excludes secrets/noise; `.cursorindexingignore` excludes indexing-only paths (e.g., `dist/`)
- MCP: `~/.cursor/mcp.json` (no secrets in repo; see `~/.cursor/MCP_MIGRATION_GUIDE.md`)
- GitHub integration: Cursor GitHub app required for cloud agents/Bugbot; use `@cursor` on PRs/issues
- Extensions: Open VSX + Cursor verification; install via Extensions panel or `cursor:extension/publisher.extensionname`
- Parallel agents: `.cursor/worktrees.json` + setup scripts; LSP not supported in worktrees; use Apply to merge
- Agent guardrail: avoid `npm run dev` or `npm run build` unless explicitly requested

## Version

**Current:** v0.0.5

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

Private - All rights reserved.

---

*Built with care by [Christopher Tavolazzi](https://github.com/ctavolazzi)*
