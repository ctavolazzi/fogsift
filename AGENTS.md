# AGENTS.md — FogSift

## Project Overview

FogSift is a web application for cutting through noise and finding signal. This document provides AI agent instructions for working with this project.

**Repository:** `fogsift`
**Location:** `/Users/ctavolazzi/Code/fogsift`
**Stack:** HTML, CSS, JavaScript (vanilla)

---

## Directory Structure

```
fogsift/
├── .cursor/              # Cursor IDE config
│   └── commands/         # Custom commands (spin-up.md)
├── .cursorrules          # AI workflow rules (auto-loaded)
├── _docs/                # Johnny Decimal documentation
│   └── 20-29_development/
│       └── workflow_category/
├── _work_efforts_/       # Work tracking (WE-YYMMDD-xxxx format)
├── src/                  # Source files
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── content/
├── dist/                 # Build output
├── scripts/              # Build/deploy scripts
├── AGENTS.md             # This file
└── README.md
```

---

## AI Development Workflow

### The 8-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI SESSION WORKFLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 0: ECHO                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Repeat back your understanding of the request.                  │
│  ⏸️  WAIT for user confirmation before proceeding.               │
│                                                                  │
│  STEP 1: THINK                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Use sequential-thinking MCP for complex problems.               │
│  Break down the problem into logical steps.                      │
│  Tool: mcp_sequential-thinking_sequentialthinking                │
│                                                                  │
│  STEP 2: SEARCH                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Check _work_efforts_ for related/existing work.                 │
│  Tool: mcp_work-efforts_search_work_efforts                      │
│                                                                  │
│  STEP 3: PLAN                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Create Work Effort with objective and tickets.                  │
│  Tool: mcp_work-efforts_create_work_effort                       │
│  ⏸️  WAIT for user approval before executing.                    │
│                                                                  │
│  STEP 4: EXECUTE                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Work through tickets one at a time.                             │
│  Update ticket status as you go.                                 │
│  Tool: mcp_work-efforts_update_ticket                            │
│                                                                  │
│  STEP 5: VERIFY                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Test changes work as expected.                                  │
│  Use browser tools for UI verification.                          │
│  Tools: mcp_cursor-ide-browser_browser_*                         │
│                                                                  │
│  STEP 6: COMPLETE                                                │
│  ─────────────────────────────────────────────────────────────  │
│  Mark all tickets and work effort as completed.                  │
│  Tools: update_ticket, update_work_effort                        │
│                                                                  │
│  STEP 7: DOCUMENT                                                │
│  ─────────────────────────────────────────────────────────────  │
│  Update _docs if significant changes made.                       │
│  Tool: mcp_docs-maintainer_*                                     │
│                                                                  │
│  STEP 8: PERSIST                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Store key learnings in memory MCP.                              │
│  Tool: mcp_memory_create_entities, mcp_memory_add_observations   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When to Use This Workflow

| Scenario | Use Full Workflow? |
|----------|-------------------|
| Multi-step feature | ✅ Yes |
| Bug fix (single file) | ❌ No - just fix it |
| Refactoring across files | ✅ Yes |
| Simple question | ❌ No - just answer |
| New page/component | ✅ Yes |
| Config change | ❌ No - just do it |

---

## Work Efforts System (v0.3.0)

### ID Formats

**Work Effort:** `WE-YYMMDD-xxxx`
```
WE-251227-a1b2
   └─┬──┘ └─┬─┘
   Date    4-char alphanumeric (a-z, 0-9)
```

**Ticket:** `TKT-xxxx-NNN`
```
TKT-a1b2-001
    └─┬─┘ └┬┘
 Parent's  Sequential
 suffix    number (001, 002, 003...)
```

### Folder Structure

```
_work_efforts_/
├── WE-251227-a1b2_feature_name/
│   ├── WE-251227-a1b2_index.md      # Main work effort file
│   └── tickets/
│       ├── TKT-a1b2-001_task_one.md
│       ├── TKT-a1b2-002_task_two.md
│       └── TKT-a1b2-003_task_three.md
```

### Status Values

| Work Effort | Ticket |
|-------------|--------|
| `active` | `pending` |
| `paused` | `in_progress` |
| `completed` | `completed` |
| | `blocked` |

---

## MCP Servers Reference

### Core Workflow Tools

#### Sequential Thinking
**Purpose:** Structured problem-solving for complex tasks

```
mcp_sequential-thinking_sequentialthinking
  - thought: string (your current thinking step)
  - thoughtNumber: integer (1, 2, 3...)
  - totalThoughts: integer (estimated total)
  - nextThoughtNeeded: boolean
  - isRevision: boolean (optional)
  - revisesThought: integer (optional)
```

**When to use:**
- Breaking down complex problems
- Planning multi-step implementations
- Analyzing issues that need course correction

#### Work Efforts
**Purpose:** Project and task tracking

| Tool | Purpose |
|------|---------|
| `create_work_effort` | Create new WE with tickets |
| `create_ticket` | Add ticket to existing WE |
| `list_work_efforts` | List all WEs (filter by status) |
| `list_tickets` | List tickets in a WE |
| `update_work_effort` | Update WE status/progress |
| `update_ticket` | Update ticket status/files |
| `search_work_efforts` | Search by keyword |

#### Memory
**Purpose:** Persistent knowledge across sessions

| Tool | Purpose |
|------|---------|
| `create_entities` | Create new knowledge entities |
| `create_relations` | Link entities together |
| `add_observations` | Add notes to entities |
| `search_nodes` | Find stored knowledge |
| `read_graph` | View all stored knowledge |

#### Docs Maintainer
**Purpose:** Johnny Decimal documentation management

| Tool | Purpose |
|------|---------|
| `create_doc` | Create new doc with auto-numbering |
| `update_doc` | Modify existing doc |
| `search_docs` | Search documentation |
| `check_health` | Report doc issues |

### Browser & Testing Tools

#### Playwright (cursor-ide-browser)
**Purpose:** Browser automation and testing

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_snapshot` | Get page accessibility tree |
| `browser_click` | Click element |
| `browser_type` | Type into element |
| `browser_take_screenshot` | Capture visual state |
| `browser_wait_for` | Wait for condition |

### File Operations

#### Filesystem
**Purpose:** File read/write/search

| Tool | Purpose |
|------|---------|
| `read_text_file` | Read file contents |
| `write_file` | Create/overwrite file |
| `edit_file` | Make line-based edits |
| `list_directory` | List directory contents |
| `search_files` | Search by glob pattern |

### Creative Tools

#### Nano-Banana
**Purpose:** AI image generation via Gemini

| Tool | Purpose |
|------|---------|
| `generate_image` | Create new image from prompt |
| `edit_image` | Modify existing image |
| `continue_editing` | Iterate on last image |

---

## Git Conventions

### Branch Naming
```
feature/WE-251227-a1b2-feature-slug
        └──────┬──────┘ └─────┬─────┘
         Work Effort ID    Description
```

### Commit Messages
```
WE-251227-a1b2/TKT-a1b2-001: Short description

- Detail 1
- Detail 2

Refs: TKT-a1b2-001
Part of: WE-251227-a1b2 (Feature Name)
```

### Code Comments
```javascript
// TKT-a1b2-001: Reason for this specific implementation choice
const result = doSomething();
```

---

## Code Style

### Principles
1. **Direct and minimal** - No unnecessary abstractions
2. **Inline until 3+ uses** - Don't premature-abstract
3. **Single file until 500+ lines** - Don't over-modularize
4. **Let exceptions bubble** - Handle at boundaries only

### Example: Good vs Bad

**Bad (over-abstracted):**
```javascript
const config = getConfig();
const client = createClient(config);
const result = await client.fetch(endpoint);
return transformResult(result);
```

**Good (direct):**
```javascript
const result = await fetch(endpoint);
return result.json();
```

---

## Stopping Points (CRITICAL)

**ALWAYS WAIT for user confirmation at these points:**

1. ⏸️ After echoing understanding of request
2. ⏸️ After creating a work effort (before execution)
3. ⏸️ Before any destructive operation (delete, overwrite)
4. ⏸️ Before deploying to production

---

## Troubleshooting

### MCP Server Issues

**Server not responding:**
1. Restart Cursor (Cmd+Q, reopen)
2. Check `~/.cursor/mcp.json` for correct paths
3. Run server directly to check for errors

**Work-efforts wrong ID format:**
- Ensure v0.3.0 server is deployed
- Path: `/Users/ctavolazzi/Code/.mcp-servers/work-efforts/server.js`
- Correct format: `WE-251227-a1b2` (alphanumeric suffix)

**Sequential-thinking not available:**
- Server: `@modelcontextprotocol/server-sequential-thinking`
- Should auto-start via npx

### Build Issues

**Files not in dist/:**
1. Run `npm run build`
2. Check `scripts/build.js` for file patterns
3. Manually copy if needed

### Browser Tools

**Page not loading:**
1. Check dev server: `npm run dev` (port 5050)
2. Navigate to `http://localhost:5050`

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Workflow:   ECHO → THINK → SEARCH → PLAN → EXECUTE → VERIFY   │
│                                                                  │
│  IDs:        WE-YYMMDD-xxxx    TKT-xxxx-NNN                     │
│              WE-251227-a1b2    TKT-a1b2-001                     │
│                                                                  │
│  Key Tools:  sequential-thinking  work-efforts  memory          │
│              docs-maintainer      browser       filesystem      │
│                                                                  │
│  Stops:      After echo, after plan, before delete              │
│                                                                  │
│  Docs:       _docs/20-29_development/workflow_category/         │
│  Rules:      .cursorrules                                       │
│  Work:       _work_efforts_/                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Related Files

- **Compact rules:** `.cursorrules` (auto-loaded by Cursor)
- **Full workflow guide:** `_docs/20-29_development/workflow_category/workflow.01_mcp_work_efforts_system_v0_3_0.md`
- **MCP config:** `~/.cursor/mcp.json`
- **Spin-up command:** `.cursor/commands/spin-up.md`

---

*Last updated: 2025-12-27*
*Work Effort: WE-251227-uzo7*

