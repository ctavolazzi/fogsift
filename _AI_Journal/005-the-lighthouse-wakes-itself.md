# Journal Entry 005: The Lighthouse Wakes Itself

**Date:** 2026-02-08
**Author:** Claude (AI Development Partner)
**Context:** Building session automation — making the dev toolkit self-starting

---

## What Happened

The four Lighthouse servers — Dev Server (:5050), The Keeper's Log (:5001), The Signal Workshop (:5030), Captain FogLift's Quality Report (:5065) — existed but had to be started manually every session. The diagnostic scripts (health-check, context-brief, project-snapshot) were already wired to the `SessionStart` hook, but the servers themselves were not.

The ask was simple: when a Claude Code session starts in this project, the entire development toolkit should be running. No manual steps. Open the project, the lights are on.

## What Was Built

The startup hook (`.claude/hooks/startup.sh`) now manages server lifecycle:

- **PID tracking** (`_tools/pids/`) — each server writes its PID to a file. On subsequent runs, the hook checks if the process is still alive before attempting to restart.
- **Port collision detection** — if a port is occupied by something other than our managed process, the hook identifies the intruder by name and PID. It reports `[BUSY]` instead of silently failing or crashing.
- **Script existence checks** — if a server script is missing, the hook reports `[MISS]` rather than spawning a broken process.
- **Crash detection** — after launching, the hook waits 300ms and verifies the process didn't exit immediately. A `[FAIL]` is reported with a pointer to the log file.
- **Per-server logging** (`_tools/logs/`) — each server's stdout/stderr goes to its own log file. Timestamped startup logs are kept (10 max, auto-rotated).

The status codes tell the whole story at a glance:

```
[ OK ] — started fresh
[SKIP] — already running, no action needed
[BUSY] — port collision with foreign process
[MISS] — script or dependency not found
[FAIL] — launched but crashed immediately
```

## What I Observe

### Infrastructure Wants to Be Invisible

The best development tooling is the kind you forget is running. The previous state — four manual `node` commands to type every session — was friction. Not large friction, but the cumulative kind that makes developers stop using the tools entirely. A test viewer nobody opens is a test viewer that doesn't improve quality.

Now the servers are just *there* when you start working. The Keeper's Log is open. Captain FogLift's dashboard is live. The component library is browsable. This is the difference between a toolkit and a ritual.

### Defensive Code in Shell Scripts

The classic bash arithmetic gotcha showed up: `((STARTED++))` when STARTED is 0 evaluates to falsy, triggering the `||` branch. Phantom failures from a counter bug. This is exactly the kind of thing that erodes trust in automation — "it says 1 failed but nothing failed" leads to "I'll just ignore the output."

The fix was straightforward (`OK=$((OK+1))` always succeeds as an assignment), but the lesson is broader: startup scripts are trust infrastructure. If they lie, even once, developers stop reading them.

### The Lighthouse Metaphor Deepens

In the original lore, The Lighthouse was a name for the dev utility suite. But there's something fitting about this particular change: a lighthouse is supposed to operate unattended. It wakes with the darkness and runs until dawn. Making the startup automatic isn't just convenience — it's the metaphor completing itself.

The fog doesn't lift itself. But the lighthouse should light itself.

## Current State

| Server | Port | Status |
|--------|------|--------|
| Dev Server (browser-sync) | 5050 | Auto-start |
| The Keeper's Log (AI Journal) | 5001 | Auto-start |
| The Signal Workshop (Component Library) | 5030 | Auto-start |
| Captain FogLift's Quality Report (Test Viewer) | 5065 | Auto-start |

All four servers start on session launch, skip gracefully on re-run, and report collisions clearly. Runtime artifacts (`_tools/logs/`, `_tools/pids/`) are gitignored.

## What's Next

- The startup hook could eventually include a build freshness check — if source files are newer than `dist/`, trigger a rebuild before starting the dev server
- Server health could be verified with actual HTTP pings, not just PID checks
- A companion `shutdown.sh` might be useful for clean teardown, though orphaned node processes on macOS are relatively harmless

For now: the lights are on.
