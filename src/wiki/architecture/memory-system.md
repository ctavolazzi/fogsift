# Fogsift Memory System

A SQLite-backed pattern storage engine for consulting work. It preserves what you've learned, surfaces it fast, and knows which memories matter most.

---

## Why This Exists

Consulting work produces repeating signals. The same database anti-patterns appear at client after client. The same communication bottlenecks. The same infrastructure mistakes dressed in different colors.

Without a memory system, each engagement starts from scratch. Lessons learned on one project stay locked in a document nobody reads. The same root cause gets diagnosed six times across six clients.

This architecture exists to close that loop: store what you observe, retrieve what's relevant, and let patterns surface automatically across engagements.

> Inspired by [Memento MCP](https://github.com/JinHo-von-Choi/memento-mcp) — a production-grade MCP server (PostgreSQL + Redis + pgvector) that pioneered fragment-based memory for AI agents. This is a self-contained SQLite adaptation tuned for consulting fieldwork.

---

## The Fragment Model

A **fragment** is an atomic unit of professional knowledge. One observation. One decision. One mistake pattern. Not a session summary — a specific, retrievable fact.

Every fragment carries:

| Field | Description |
|---|---|
| `content` | 1–3 sentences. The actual memory. |
| `topic` | Organizational category (e.g. `"redis"`, `"auth"`, `"frontend"`) |
| `type` | Classification (see below) |
| `importance` | 0.0–1.0, defaults by type |
| `ttl_tier` | Temperature: `hot`, `warm`, or `cold` |
| `keywords` | Index terms for L1 retrieval |
| `reference_count` | How often this fragment has been recalled |
| `source` | Optional origin metadata (client, session, date) |

### Fragment Types

The six types encode the nature of the knowledge:

| Type | Importance Default | Use For |
|---|---|---|
| `preference` | 0.95 | Your style rules, non-negotiables |
| `error` | 0.90 | Mistake patterns — never forget |
| `solution_approach` | 0.85 | How you solved something |
| `decision` | 0.70 | Why you chose A over B |
| `procedure` | 0.65 | Repeatable workflows |
| `client_pattern` | 0.60 | Recurring problem shapes across clients |

### Memory Temperature (TTL Tiers)

Fragments are born **hot** and cool over time as they go unreferenced:

```
HOT   → Recently retrieved. Front of mind.
WARM  → Occasionally recalled. Background knowledge.
COLD  → Rarely accessed. Historical record.
```

Every recall automatically increments `reference_count` and updates `last_referenced`, keeping frequently-used knowledge at the surface.

---

## Search Architecture: L1 and L2

The system uses a two-tier retrieval strategy, mirroring how the full Memento MCP uses three tiers (L1 Redis → L2 PostgreSQL GIN → L3 pgvector).

```
Query arrives
     │
     ▼
┌─────────────┐
│  Keywords   │ ──── L1: Keyword index lookup
│  provided?  │      SELECT DISTINCT f.* FROM fragments f
└──────┬──────┘      JOIN keywords k ON f.id = k.fragment_id
       │ YES         WHERE k.keyword IN (...)
       ▼             Sub-millisecond. Exact match.
   L1 Results ────────────────────────────────────────► Return
       │ (empty)
       ▼
┌─────────────┐
│ topic/type  │ ──── L2: Metadata filter
│  provided?  │      SELECT * FROM fragments
└──────┬──────┘      WHERE topic = ? AND type = ?
       │ YES         ORDER BY importance DESC, last_referenced DESC
       ▼             Fast. Covers recent high-importance fragments.
   L2 Results ────────────────────────────────────────► Return
```

**Token budgeting** caps responses: fragments are added to the result set in descending importance order until the token budget is exhausted (estimated at 1 char ≈ 0.25 tokens). This prevents context window bloat.

---

## Database Schema

Four tables. Indexes designed around the query patterns.

```sql
-- Core storage
fragments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,        -- max 10,000 chars via Pydantic
    topic TEXT NOT NULL,          -- max 100 chars
    type TEXT NOT NULL,           -- CHECK: valid FragmentType enum
    importance REAL,              -- CHECK: 0.0–1.0
    scope TEXT,                   -- CHECK: permanent | session
    ttl_tier TEXT,                -- CHECK: hot | warm | cold
    created_at TIMESTAMP,
    last_referenced TIMESTAMP,
    reference_count INTEGER,
    source JSON                   -- arbitrary metadata
)

-- L1 index (fast keyword retrieval)
keywords (
    fragment_id TEXT REFERENCES fragments(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    UNIQUE(fragment_id, keyword)  -- prevents index bloat
)

-- Graph relationships
links (
    id TEXT PRIMARY KEY,
    from_id TEXT REFERENCES fragments(id) ON DELETE CASCADE,
    to_id TEXT REFERENCES fragments(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL   -- CHECK: valid LinkRelationType
)

-- System state
metadata (key TEXT PRIMARY KEY, value TEXT)
```

**Indexes built:** `keywords(keyword)`, `keywords(fragment_id)`, `links(from_id)`, `links(to_id)`, `fragments(topic)`, `fragments(type)`, `fragments(importance DESC, last_referenced DESC)`.

Foreign keys enforce CASCADE DELETE: removing a fragment automatically cleans its keywords and links.

---

## Graph Relationships

Fragments connect to each other through typed links, building a knowledge graph:

| Relation | Meaning |
|---|---|
| `related` | Contextually connected |
| `caused_by` | A happened because of B |
| `resolved_by` | A was fixed by applying B |
| `part_of` | A is a component of B |
| `contradicts` | A and B conflict |
| `informs` | A provides context for B |

A typical consulting pattern: an `error` fragment linked `resolved_by` to a `solution_approach` fragment. When you recall the error, you can traverse to the resolution.

---

## Security Hardening

The v2.0 implementation addresses the common weaknesses in prototype memory systems:

**Input validation (Pydantic layer)**
- `content`: min 1, max 10,000 characters
- `topic`: min 1, max 100 characters
- `keywords`: max 20 items, max 100 chars each
- `token_budget`: 100–50,000 tokens
- `RecallRequest`: requires at least one search criterion (keywords, text, topic, or type)

**Database layer**
- All SQL uses parameterized `?` placeholders — no SQL injection surface
- `CHECK` constraints enforce enums at the DB level (type, scope, ttl_tier, relation_type)
- `UNIQUE(fragment_id, keyword)` prevents index bloat from duplicate keywords
- WAL journal mode for better concurrent reads
- 5,000ms busy timeout prevents immediate lock errors

**Application layer**
- Error messages are sanitized before returning to clients — no stack traces exposed
- N+1 keyword queries eliminated: batch-loaded with a single JOIN per result set
- Transaction context managers (`with conn:`) ensure atomic writes with automatic rollback

---

## Interactive Terminal

The exhibit below simulates the memory system API. Select an exhibit using the buttons or arrow keys.

<div class="terminal-crt">
  <div class="terminal-header">
    <span class="terminal-brand">FOGSIFT SYSTEMS&#8482;</span>
    <span class="terminal-title">MEMORY ARCHITECTURE // DIAGNOSTIC TERMINAL v2.0</span>
    <span class="terminal-status">ONLINE</span>
  </div>
  <div class="terminal-screen">
    <div class="terminal-output" aria-live="polite" aria-label="Terminal output"></div>
    <nav class="terminal-nav" aria-label="Exhibit navigation">
      <button class="terminal-btn" data-dir="prev" aria-label="Previous exhibit">[&#8592; PREV]</button>
      <span class="terminal-exhibit-info">
        <span class="terminal-exhibit-label">EXHIBIT 1 OF 6</span>
      </span>
      <button class="terminal-btn" data-dir="next" aria-label="Next exhibit">[NEXT &#8594;]</button>
    </nav>
  </div>
</div>

---

## Design Decisions

**Why SQLite instead of PostgreSQL?**
Single-file deployment. No service to run, no connection pool to manage, no separate process. For a consulting memory system used by one person, SQLite with WAL mode is fast enough and dramatically simpler to operate. When you're ready for multi-user or semantic search, see [Memento MCP](https://github.com/JinHo-von-Choi/memento-mcp) for the production-grade path.

**Why keyword index instead of full-text search?**
L1 keyword retrieval is deterministic, predictable, and sub-millisecond. Full-text search (FTS5, pgvector) adds complexity and degrades gracefully but unpredictably. For consulting work where you control what gets stored, curated keywords outperform fuzzy matching. L3 semantic search is the planned next tier.

**Why six fragment types?**
Consulting knowledge isn't monolithic. A mistake pattern (error) should surface differently than a preference. The importance defaults encode this hierarchy: errors and preferences are nearly always relevant; client patterns are contextual. The six types let the system rank results without you having to score everything manually.

**Why token budgets?**
Every recall goes to an AI context window. Unbudgeted recall returns everything and floods the context. The budget forces the system to prioritize by importance — only the most relevant fragments make it through.

---

## Running the System

```bash
# From fogsift-api/
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# Docs at http://localhost:8000/docs
```

Tests:

```bash
pip install pytest
pytest tests/ -v
```

---

*See also: [The Diagnostic Process](/wiki/diagnostic-process) — [Systems Thinking](/wiki/concepts/systems-thinking) — [Documentation Debt](/wiki/field-notes/007-documentation-debt)*
