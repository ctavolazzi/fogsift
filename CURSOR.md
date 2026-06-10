# CURSOR.md — FogSift Local Routing Policy

## Purpose

This file defines Cursor-specific execution defaults for FogSift.

## Canonical Local Base

- Application base URL: `http://localhost:5050`
- API base URL: `http://localhost:5050/api/`

## Required Workflow

1. Build from source using `node scripts/build.js`.
2. Validate behavior through the local `:5050` environment.
3. Prefer existing static API outputs in `dist/api/*`.
4. Reference `_docs/20-29_development/architecture_category/architecture.02_api_endpoints.md` for endpoint contracts.
5. Avoid introducing parallel local entrypoints unless required; if introduced, document how they integrate with the `:5050` flow.

## CivicOS Hard-Gate

- A task is blocked until it is represented in CivicOS on `http://localhost:5050`.
- Required sequence: represent task in CivicOS -> execute via CivicOS-linked tools -> verify through CivicOS surfaces -> log to work effort/devlog.
- Temporary overrides must include reason, scope, expiry, and postmortem note in `_work_efforts/devlog.md`.

## Empirica Startup Guard

Before Oracle-style reasoning or cognitive test visualization:

1. `empirica project-init --non-interactive --output json`
2. `empirica project-switch fogsift --output json`
3. `empirica project-bootstrap --output json`
4. `npm run test:empirica:cognitive`

If project-path resolver errors persist:
```bash
pip uninstall -y empirica empirica-mcp
pip install empirica==1.5.9 empirica-mcp
```

If CLI parser crashes with `badly formed help string` (Python 3.14 path):
```bash
python3 -m pip install -e /Users/ctavolazzi/Code/active/empirica
```

## Implementation Guidance

- Recombine existing engine/canvas/build components before creating net-new architecture.
- Keep changes additive and documented in `_work_efforts/devlog.md`.
- When proposing new endpoints or orchestration patterns, define them in docs first, then implement.
