# Cursor Workspace Configuration

**Document ID:** workflow.05
**Created:** 2026-01-23
**Scope:** Global + repo Cursor configuration for FogSift

---

## Overview

This document captures the current Cursor setup for FogSift. All changes are additive and aligned to official Cursor documentation. Global files live under `~/.cursor/`; project files live under `.cursor/` in this repo.

## Locations

### Project (repo)
- Rules: `.cursor/rules/`
- Commands: `.cursor/commands/`
- Skills: `.cursor/skills/`
- Subagents: `.cursor/agents/`
- Hooks: `.cursor/hooks.json` and `.cursor/hooks/`
- Semantic Search exclusions: `.cursorignore`

### Global (user)
- Commands: `~/.cursor/commands/`
- Skills: `~/.cursor/skills/`
- Subagents: `~/.cursor/agents/`
- Hooks: `~/.cursor/hooks.json` and `~/.cursor/hooks/`
- MCP config: `~/.cursor/mcp.json`
- Docs sources list: `~/.cursor/DOCS_SOURCES.md`
- MCP notes: `~/.cursor/MCP_CONFIG_NOTES.md`
- MCP migration: `~/.cursor/MCP_MIGRATION_GUIDE.md`

## Rules
- Project rules are in `.cursor/rules/` with scoped globs and short content.
- `.cursorrules` is retained for legacy compatibility and points to `.cursor/rules/` and `AGENTS.md`.

## Commands
- Project commands live in `.cursor/commands/`.
- Global commands live in `~/.cursor/commands/`.

## Skills
- Skills are stored in `.cursor/skills/` and `~/.cursor/skills/`.
- Each skill has a `SKILL.md` with required frontmatter (`name`, `description`).

## Subagents
- Custom subagents live in `.cursor/agents/` and `~/.cursor/agents/`.
- Project subagents take precedence when names conflict.

## Hooks (Light Policy)
- Hooks log activity and prompt before risky actions.
- Config files: `.cursor/hooks.json` and `~/.cursor/hooks.json`.
- Audit log target: `/tmp/agent-audit.log`.
- Ensure hook scripts are executable (`chmod +x .cursor/hooks/audit.sh` and `chmod +x ~/.cursor/hooks/audit.sh`).

## @ Mentions and @Docs
- Use `@Files`, `@Folders`, `@Code`, and `@Docs` intentionally.
- Curated @Docs list is in `~/.cursor/DOCS_SOURCES.md`.

## Semantic Search
- `.cursorignore` excludes generated and noisy paths.
- View included files in Cursor Settings → Indexing & Docs.
- `.cursorindexingignore` excludes paths from indexing only (AI can still access them).

## MCP
- `~/.cursor/mcp.json` stores MCP servers and credentials (do not commit).
- Use environment interpolation for secrets; see `MCP_MIGRATION_GUIDE.md`.
- MCP Directory “Add to Cursor” is recommended for vetted servers.

## Ignore Files
- `.cursorignore` blocks semantic search, Tab/Agent/Inline Edit, and @ mentions.
- Terminal and MCP tools are not blocked by `.cursorignore`.
- Use `.cursorindexingignore` for indexing-only exclusions (e.g., `dist/`).
- Global ignore list can be set in Cursor Settings → Indexing & Docs.

## Extensions
- Cursor uses Open VSX and adds verification on top of it.
- Install via the Extensions panel or `cursor:extension/publisher.extensionname`.

## Parallel Agents (Worktrees)
- Worktrees are isolated; use **Apply** to merge changes into your checked-out branch.
- LSP is not supported in worktrees (no linting in worktrees).
- Configure setup scripts in `.cursor/worktrees.json`.
- Optional settings: `cursor.worktreeCleanupIntervalHours`, `cursor.worktreeMaxCount`, `git.showCursorWorktrees`.

## GitHub Integration
- Cursor GitHub app is required for cloud agents and Bugbot.
- Use `@cursor` on PRs/issues to trigger agents.
- Permissions/IP allowlist changes are documentation-only unless explicitly requested.

---

## Verification Checklist
- Rules and commands appear in Cursor UI
- Skills and subagents discovered
- Hooks active and audit log is writing
- Semantic Search exclusions applied
