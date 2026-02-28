# Memory System

A SQLite-backed store for professional knowledge. You put in what you learn. It gives back what's relevant when you ask for it.

---

## Before You Hit Play

The terminal below simulates the live API. Six exhibits run in sequence, each showing one operation. Use the buttons or arrow keys to navigate.

| Exhibit | What It Shows |
|---|---|
| 1. Boot Sequence | System startup and readiness checks |
| 2. Store a Memory | `POST /remember` — saves a fragment with keywords and type |
| 3. L1 Keyword Recall | `POST /recall` with keywords — hits the index directly |
| 4. L2 Metadata Fallback | `POST /recall` with topic/type — scans when no keywords given |
| 5. Link Fragments | `POST /link` — connects two fragments with a typed relationship |
| 6. System Stats | `GET /stats` — shows your knowledge base shape |

<div class="terminal-crt">
  <div class="terminal-header">
    <span class="terminal-brand">FOGSIFT SYSTEMS&#8482;</span>
    <span class="terminal-title">COGNITIVE ARCHITECTURE // MEMORY TERMINAL v2.0</span>
    <span class="terminal-status">ONLINE</span>
  </div>
  <div class="terminal-screen">
    <div class="terminal-output" aria-live="polite" aria-label="Terminal output — use navigation buttons below to change exhibit"></div>
    <nav class="terminal-nav" aria-label="Exhibit navigation">
      <button class="terminal-btn" data-dir="prev" aria-label="Previous exhibit">[&#8592; PREV]</button>
      <span class="terminal-exhibit-info">
        <span class="terminal-exhibit-label">EXHIBIT 1 OF 6</span>
      </span>
      <button class="terminal-btn" data-dir="next" aria-label="Next exhibit">[NEXT &#8594;]</button>
    </nav>
  </div>
</div>

The terminal auto-advances after 12 seconds. Select any exhibit manually at any time.

---

## The Fragment

A **fragment** is one atomic unit of knowledge. One observation. One mistake. One decision. Not a session summary — a specific, retrievable fact.

### Fields

| Field | Type | Constraint | Description |
|---|---|---|---|
| `content` | string | 1–10,000 chars | The actual memory. 1–3 sentences. |
| `topic` | string | 1–100 chars | Category label, e.g. `redis`, `auth` |
| `type` | enum | see below | Classification |
| `importance` | float | 0.0–1.0 | Defaults by type if not given |
| `ttl_tier` | enum | hot / warm / cold | Temperature based on access |
| `keywords` | string[] | max 20, 100 chars each | Index terms for fast retrieval |
| `reference_count` | int | ≥0 | How often this was recalled |
| `source` | object | optional | Origin metadata (client, date, etc.) |
| `scope` | string | permanent / session | Whether it survives the session |

### Types and Default Importance

Each type carries a default importance score. You can override it explicitly.

| Type | Default | Store this when... |
|---|---|---|
| `preference` | **0.95** | You have a non-negotiable style or process rule |
| `error` | **0.90** | You made a mistake that cost something — never forget |
| `solution_approach` | **0.85** | You found something that worked |
| `decision` | **0.70** | You chose A over B and want to remember why |
| `procedure` | **0.65** | You have a repeatable workflow |
| `client_pattern` | **0.60** | You see the same problem shape across clients |

### Memory Temperature

New fragments start **hot**. Access frequency drives temperature:

- **HOT** — recently retrieved. Surfaces first.
- **WARM** — occasionally recalled. Background knowledge.
- **COLD** — rarely accessed. Historical record.

Every recall increments `reference_count` and updates `last_referenced`. The system tracks which memories are actually useful to you.

---

## How Search Works

The system uses two retrieval tiers, chosen automatically based on your query:

**L1 — Keyword Index (fast path)**
Used when you provide `keywords`. Queries the keyword index directly. This is the path to design for — it works regardless of database size, and the query plan is predictable.

**L2 — Metadata Filter (fallback)**
Used when no keywords are given but `topic` or `type` is. Scans the `fragments` table filtered by your criteria, ordered by importance then recency. Covered by indexes on topic, type, importance, and last_referenced.

**Token budget**
Results are assembled in descending importance order until the `token_budget` is reached. The budget uses a 4-characters-per-token estimate. This prevents a recall from flooding a language model context window.

**Practical note:** Put explicit keywords on every fragment you store. L1 retrieval is what you want. L2 is what happens when you didn't.

---

## Database Structure

Four tables. Constraints are enforced at the database level, not only in application code.

```
fragments   — core storage
keywords    — L1 keyword index (UNIQUE per fragment, prevents index bloat)
links       — typed graph relationships between fragments
metadata    — system state (initialization time, schema version)
```

**Database-level constraints:**
- `type` must be one of the six valid fragment types
- `scope` must be `permanent` or `session`
- `ttl_tier` must be `hot`, `warm`, or `cold`
- `relation_type` must be one of the six valid link types
- `importance` must be between 0.0 and 1.0
- `content` and `topic` must be non-empty
- `UNIQUE(fragment_id, keyword)` — no duplicate keywords per fragment
- Foreign keys use `ON DELETE CASCADE` — removing a fragment removes its keywords and links

WAL journal mode and a 5-second busy timeout are set at connection time.

---

## Graph Relationships

Link any two fragments with a typed relationship:

| Relation | Meaning |
|---|---|
| `related` | Contextually connected |
| `caused_by` | A happened because of B |
| `resolved_by` | A was fixed by applying B |
| `part_of` | A is a component of B |
| `contradicts` | A and B conflict |
| `informs` | A provides context for B |

Example: an `error` fragment linked `resolved_by` to a `solution_approach` fragment. When you recall the error, you know where to look for the resolution.

---

## Running It

From the `fogsift-api/` directory:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open `http://localhost:8000/docs` for the interactive API explorer.

**Tests:**

```bash
pip install pytest
pytest tests/ -v
```

Tests use an in-memory SQLite database. No setup, no external services, no cleanup needed.

---

## What This Is and Isn't

**What it is:** A structured SQLite store for one person's professional knowledge. Simple to run, simple to understand, simple to extend.

**What it isn't:** A production-grade multi-user system. For that, see [Memento MCP](https://github.com/JinHo-von-Choi/memento-mcp) — the PostgreSQL + Redis + pgvector implementation that this is adapted from. Memento MCP adds semantic search (L3 via pgvector), automatic fragment linking, multi-tenancy, and a full MCP server interface.

**The tradeoff:** SQLite means no external services, no connection pool, no separate process. That is the right tradeoff for a single consultant. The moment you need multi-user access or vector search, this implementation will need to be replaced.

---

*See also: [The Diagnostic Process](/wiki/diagnostic-process) — [Systems Thinking](/wiki/concepts/systems-thinking) — [Documentation Debt](/wiki/field-notes/007-documentation-debt)*
