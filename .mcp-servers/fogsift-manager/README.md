# FogSift Manager MCP Server

A Model Context Protocol (MCP) server for managing the FogSift website.

## Installation

The server is already configured in `~/.cursor/mcp.json`. Restart Cursor to activate.

## Available Tools

### Build & Deploy

| Tool | Description |
|------|-------------|
| `fogsift_build` | Build the FogSift website (CSS, JS, HTML, Wiki) |
| `fogsift_deploy` | Build and deploy to Cloudflare Pages |

### Dev Server

| Tool | Description |
|------|-------------|
| `fogsift_dev_start` | Start local dev server on port 5050 |
| `fogsift_dev_stop` | Stop the dev server |

### Queue Management

| Tool | Description |
|------|-------------|
| `fogsift_queue_list` | List all queue items (pending/completed) |
| `fogsift_queue_add` | Add a new problem to the queue |
| `fogsift_queue_complete` | Mark an item as completed with outcome |
| `fogsift_queue_remove` | Remove an item (for refunds) |
| `fogsift_queue_bump` | Move an item up in the queue |
| `fogsift_queue_go_live` | Remove mock data flag and optionally clear mock items |

### Content Management

| Tool | Description |
|------|-------------|
| `fogsift_content_update` | Update articles.json, testimonials.json, etc. |

### Status

| Tool | Description |
|------|-------------|
| `fogsift_status` | Get project status (git, queue stats, dev server) |

## Usage Examples

### Add a queue item
```
fogsift_queue_add({
  "problem_summary": "My SaaS has terrible onboarding",
  "display_name": "John D.",
  "category": "Product/UX",
  "anonymized": false
})
```

### Complete a queue item
```
fogsift_queue_complete({
  "id": "PST-ABC123",
  "outcome": "go_deeper",
  "outcome_text": "Found 3 quick wins and a deeper architecture issue"
})
```

### Bump an item up
```
fogsift_queue_bump({
  "id": "PST-ABC123",
  "positions": 2
})
```

### Go live (remove mock data)
```
fogsift_queue_go_live({
  "clear_mock_items": true
})
```

## Outcome Types

When completing a queue item, use one of these outcomes:

| Outcome | Meaning |
|---------|---------|
| `go_deeper` | "Let's go deeper." - Found something worth exploring more |
| `i_know_people` | "I know people." - Referred to a specialist |
| `this_is_sick` | "This is sick." - Great idea, built something |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FOGSIFT_ROOT` | `/Users/ctavolazzi/Code/fogsift` | Path to FogSift project |

## Development

```bash
cd /Users/ctavolazzi/Code/fogsift/.mcp-servers/fogsift-manager
npm install
npm start
```

## Troubleshooting

**Server not starting:**
- Check that Node.js is installed: `node --version`
- Check dependencies: `npm install`
- Check logs in Cursor's MCP panel

**Queue operations failing:**
- Verify `src/content/queue.json` exists
- Check file permissions

**Build failing:**
- Run `npm install` in the FogSift root directory
- Check for syntax errors in source files
