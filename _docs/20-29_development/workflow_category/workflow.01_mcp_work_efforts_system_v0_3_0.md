---
created: '2025-12-27T18:41:02Z'
id: workflow.01
links:
- '[[00.00_index]]'
- '[[workflow_category_index]]'
related_work_efforts:
- WE-251227-uzo7
title: MCP Work Efforts System v0.3.0
updated: '2025-12-27T19:30:00Z'
---

# MCP Work Efforts System v0.3.0 - Complete Guide

## Overview

The Work Efforts system provides structured project tracking with **Work Efforts** (high-level objectives) containing **Tickets** (discrete tasks). Everything is tracked in markdown files within your repository.

---

## ID Formats

### Work Effort: `WE-YYMMDD-xxxx`

```
WE-251227-a1b2
   └─┬──┘ └─┬─┘
   Date    4-char unique (a-z, 0-9)
```

- 15 characters total
- Date-sortable by filename
- Collision-resistant: 36^4 = 1.6M combinations per day

### Ticket: `TKT-xxxx-NNN`

```
TKT-a1b2-001
    └─┬─┘ └┬┘
 Parent's  Sequential
 suffix    number
```

- Links directly to parent work effort
- Sequential within the work effort (001, 002, 003...)

---

## Folder Structure

```
your-repo/
└── _work_efforts_/
    ├── WE-251227-a1b2_api_architecture/
    │   ├── WE-251227-a1b2_index.md      # Main work effort file
    │   └── tickets/
    │       ├── TKT-a1b2-001_define_endpoints.md
    │       ├── TKT-a1b2-002_implement_api.md
    │       └── TKT-a1b2-003_add_caching.md
    │
    └── WE-251228-c3d4_documentation/
        ├── WE-251228-c3d4_index.md
        └── tickets/
            └── TKT-c3d4-001_write_readme.md
```

---

## The Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PLAN      → Create Work Effort with objective and scope     │
│                 MCP: create_work_effort                          │
│                                                                  │
│  2. TICKET    → Break WE into discrete tickets                  │
│                 MCP: create_ticket                               │
│                                                                  │
│  3. BRANCH    → Create git branch                               │
│                 git checkout -b feature/WE-YYMMDD-xxxx-slug     │
│                                                                  │
│  4. IMPLEMENT → Code changes with inline comments               │
│                 // TKT-xxxx-NNN: reason for this change         │
│                                                                  │
│  5. COMMIT    → Commit with structured message                  │
│                 WE-YYMMDD-xxxx/TKT-xxxx-NNN: Description        │
│                                                                  │
│  6. UPDATE    → Mark ticket complete, update WE index           │
│                 MCP: update_ticket, update_work_effort          │
│                                                                  │
│  7. MERGE     → PR references WE, lists completed tickets       │
│                 PR title: WE-251227-a1b2: API Architecture      │
│                                                                  │
│  8. CLOSE     → WE marked complete when all tickets done        │
│                 MCP: update_work_effort status=completed        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sequential Thinking Integration

The **sequential-thinking** MCP server provides structured problem-solving for complex tasks. Use it **before** creating work efforts to plan your approach.

### When to Use Sequential Thinking

| Scenario | Use Sequential Thinking? |
|----------|-------------------------|
| Complex multi-step feature | ✅ Yes |
| Problem with unclear scope | ✅ Yes |
| Simple bug fix | ❌ No |
| Straightforward task | ❌ No |
| Architecture decisions | ✅ Yes |
| Debugging complex issue | ✅ Yes |

### How to Use

```javascript
mcp_sequential-thinking_sequentialthinking({
  thought: "Your current thinking step",
  thoughtNumber: 1,           // Current step (1, 2, 3...)
  totalThoughts: 5,           // Estimated total steps
  nextThoughtNeeded: true,    // More thinking needed?
  isRevision: false,          // Revising previous thought?
  revisesThought: null        // Which thought being revised
})
```

### Example: Planning a Feature

```
Thought 1: "User wants a dashboard page. Let me identify the components needed..."
Thought 2: "I'll need: HTML page, CSS styles, data source, navigation link..."
Thought 3: "Dependencies: none on other features, but needs build script update..."
Thought 4: "Tickets: 1) Create HTML, 2) Add styles, 3) Update navigation, 4) Test..."
Thought 5: "Ready to create work effort with 4 tickets. Estimated 30 min work."
```

---

## Complete AI Workflow (10 Steps)

The work efforts system is part of a larger AI development workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLETE AI WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 0: ECHO                                                    │
│  Repeat understanding of request. WAIT for confirmation.         │
│                                                                  │
│  STEP 1: THINK                                                   │
│  Use sequential-thinking MCP for complex problems.               │
│  Tool: mcp_sequential-thinking_sequentialthinking                │
│                                                                  │
│  STEP 2: SEARCH                                                  │
│  Check _work_efforts_ for related work.                          │
│  Tool: mcp_work-efforts_search_work_efforts                      │
│                                                                  │
│  STEP 3: PLAN                                                    │
│  Create Work Effort with tickets. WAIT for approval.             │
│  Tool: mcp_work-efforts_create_work_effort                       │
│                                                                  │
│  STEP 4: EXECUTE                                                 │
│  Work through tickets, updating status.                          │
│  Tool: mcp_work-efforts_update_ticket                            │
│                                                                  │
│  STEP 5: VERIFY                                                  │
│  Test changes work (browser tools for UI).                       │
│  Tools: mcp_cursor-ide-browser_browser_*                         │
│                                                                  │
│  STEP 6: COMPLETE                                                │
│  Mark tickets and WE as completed.                               │
│  Tools: update_ticket, update_work_effort                        │
│                                                                  │
│  STEP 7: DOCUMENT                                                │
│  Update _docs if needed.                                         │
│  Tool: mcp_docs-maintainer_*                                     │
│                                                                  │
│  STEP 8: PERSIST                                                 │
│  Store learnings in memory MCP.                                  │
│  Tool: mcp_memory_*                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Stopping Points (CRITICAL)

| Step | Action | Wait? |
|------|--------|-------|
| 0 | Echo understanding | ⏸️ YES |
| 3 | Create work effort | ⏸️ YES |
| Any | Destructive operation | ⏸️ YES |

---

## MCP Tools Reference

### Creating

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `create_work_effort` | Create new WE with folder structure | `repo_path`, `title`, `objective`, `tickets[]` |
| `create_ticket` | Add ticket to existing WE | `work_effort_path`, `title`, `acceptance_criteria[]` |

### Reading

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `list_work_efforts` | List all WEs in repo | `repo_path`, `status` filter |
| `list_tickets` | List tickets in a WE | `work_effort_path`, `status` filter |
| `search_work_efforts` | Search WEs and tickets | `repo_path`, `query`, `include_tickets` |

### Updating

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `update_work_effort` | Update WE status/progress | `work_effort_path`, `status`, `progress`, `commit` |
| `update_ticket` | Update ticket status/files | `ticket_path`, `status`, `files_changed[]`, `notes` |

---

## File Templates

### Work Effort Index (`WE-YYMMDD-xxxx_index.md`)

```markdown
---
id: WE-251227-a1b2
title: "API Architecture"
status: active
created: 2025-12-27T09:13:45.000Z
created_by: ctavolazzi
branch: feature/WE-251227-a1b2-api_architecture
repository: fogsift
---

# WE-251227-a1b2: API Architecture

## Objective
Create a clean, API-driven data layer for dynamic wiki content.

## Tickets

| ID | Title | Status |
|----|-------|--------|
| TKT-a1b2-001 | Define API endpoint schema | completed |
| TKT-a1b2-002 | Implement wiki API | in_progress |
| TKT-a1b2-003 | Add caching layer | pending |

## Commits
- `abc1234` WE-251227-a1b2/TKT-a1b2-001: Define endpoint contracts
```

### Ticket (`TKT-xxxx-NNN_title.md`)

```markdown
---
id: TKT-a1b2-001
parent: WE-251227-a1b2
title: "Define API Endpoint Schema"
status: completed
created: 2025-12-27T09:15:22.000Z
---

# TKT-a1b2-001: Define API Endpoint Schema

## Description
Document all API endpoints, their request/response contracts, and error codes.

## Acceptance Criteria
- [x] All endpoints documented with URL, method, response shape
- [x] TypeScript interfaces defined for all responses
- [x] Error codes and messages specified

## Files Changed
- `src/js/wiki-api.js` - Added API client module
- `_docs/api.md` - API documentation

## Implementation Notes
- 12/27/2025: Decided to use JSON:API format for consistency

## Commits
- `abc1234` WE-251227-a1b2/TKT-a1b2-001: Define endpoint contracts
```

---

## Git Integration

### Branch Naming
```
feature/WE-251227-a1b2-api-architecture
        └──────┬──────┘ └──────┬──────┘
         Work Effort ID    Slug from title
```

### Commit Message Format
```
WE-251227-a1b2/TKT-a1b2-001: Define API endpoint schema

- Document /api/wiki/index.json contract
- Add TypeScript interfaces

Refs: TKT-a1b2-001
Part of: WE-251227-a1b2 (API Architecture)
```

### Code Comments
```javascript
// TKT-a1b2-001: Using fetch instead of axios to reduce bundle size
const response = await fetch('/api/wiki/index.json');

// TKT-a1b2-003: Cache for 5 minutes to reduce API calls
const CACHE_TTL = 5 * 60 * 1000;
```

---

## Status Values

### Work Effort Status
| Status | Meaning |
|--------|---------|
| `active` | Currently being worked on |
| `paused` | Temporarily on hold |
| `completed` | All tickets done, WE closed |

### Ticket Status
| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Currently being worked on |
| `completed` | Done and verified |
| `blocked` | Waiting on external dependency |

---

## Deployment

### MCP Server Location

**Local (Cursor runs this):**
```
~/.mcp-servers/work-efforts/
├── server.js        # v0.3.0
├── package.json
└── README.md
```

**Cursor Configuration (`~/.cursor/mcp.json`):**
```json
{
  "mcpServers": {
    "work-efforts": {
      "command": "node",
      "args": ["/path/to/.mcp-servers/work-efforts/server.js"]
    }
  }
}
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORK EFFORTS v0.3.0                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  IDs:     WE-YYMMDD-xxxx    TKT-xxxx-NNN                        │
│           WE-251227-a1b2    TKT-a1b2-001                        │
│                                                                  │
│  Folder:  _work_efforts_/WE-YYMMDD-xxxx_title/                  │
│           ├── WE-YYMMDD-xxxx_index.md                           │
│           └── tickets/TKT-xxxx-NNN_task.md                      │
│                                                                  │
│  Branch:  feature/WE-YYMMDD-xxxx-slug                           │
│  Commit:  WE-YYMMDD-xxxx/TKT-xxxx-NNN: Description              │
│  Comment: // TKT-xxxx-NNN: reason                               │
│                                                                  │
│  Tools:   create_work_effort  create_ticket                     │
│           list_work_efforts   list_tickets                      │
│           update_work_effort  update_ticket                     │
│           search_work_efforts                                   │
│                                                                  │
│  Status:  WE: active | paused | completed                       │
│           TKT: pending | in_progress | completed | blocked      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```